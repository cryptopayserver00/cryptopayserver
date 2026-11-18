/**
 * Server-only webhook delivery. Do not import from React client components —
 * Node builtins (dns/net/crypto) will break the browser bundle.
 */
import axios from 'axios'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'
import { decryptSecret } from '@/lib/crypto/secrets'
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

export type WebhookSendOptions = {
  secret?: string | null
  event?: string
  /** Immediate one-shot retry (legacy); prefer persisted redelivery */
  retry?: boolean
  storeId?: number
  webhookSettingId?: number | null
  /** When false, skip writing webhook_deliveries (e.g. merchant Test button). Default true when storeId set. */
  persist?: boolean
  /** When false, record failure but do not schedule cron retries. Default true. */
  scheduleRetry?: boolean
}

const MAX_ATTEMPTS = 5
const BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000]

export function webhookRetryDelayMs(attemptAfterFailure: number): number {
  const idx = Math.max(0, Math.min(BACKOFF_MS.length - 1, attemptAfterFailure - 1))
  return BACKOFF_MS[idx]!
}

export class WEBHOOK {
  static axiosInstance = axios.create({
    timeout: 50000,
  })

  static signPayload(secret: string, timestamp: string, rawBody: string): string {
    return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  }

  static async postSigned(
    url: string,
    body: unknown,
    options: { secret?: string | null; event?: string } = {}
  ): Promise<unknown> {
    const safe = await assertSafeHttpUrl(url)
    if (!safe.ok) {
      throw new Error(`unsafe webhook url: ${safe.message}`)
    }

    const event = options.event || 'invoice.updated'
    const payload = {
      event,
      created_at: Math.floor(Date.now() / 1000),
      data: body,
    }
    const rawBody = JSON.stringify(payload)
    const timestamp = String(Math.floor(Date.now() / 1000))

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'CryptoPayServer-Webhook/1.0',
      'X-CryptoPay-Event': event,
      'X-CryptoPay-Timestamp': timestamp,
    }

    if (options.secret) {
      const secret = decryptSecret(options.secret)
      headers['X-CryptoPay-Signature'] = WEBHOOK.signPayload(secret, timestamp, rawBody)
    }

    const response = await this.axiosInstance.post(safe.url.toString(), rawBody, {
      headers,
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 300,
    })
    if (response && response.status >= 200 && response.status < 300) {
      return response.data
    }
    throw new Error(`webhook HTTP ${response?.status}`)
  }

  static async sendWebhook(
    url: string,
    body: any,
    options: WebhookSendOptions = {}
  ): Promise<any> {
    const event = options.event || 'invoice.updated'
    const persist = options.persist !== false && options.storeId != null
    const scheduleRetry = options.scheduleRetry !== false
    let deliveryId: number | null = null

    if (persist) {
      const row = await prisma.webhook_deliveries.create({
        data: {
          store_id: Number(options.storeId),
          webhook_setting_id: options.webhookSettingId ?? null,
          event,
          payload_url: url,
          payload: JSON.stringify(body ?? {}),
          secret: String(options.secret || ''),
          delivery_status: 'pending',
          attempts: 0,
          status: 1,
        },
        select: { id: true },
      })
      deliveryId = row.id
    }

    const attempt = async () => WEBHOOK.postSigned(url, body, { secret: options.secret, event })

    try {
      const data = await attempt()
      if (deliveryId) {
        await prisma.webhook_deliveries.update({
          where: { id: deliveryId },
          data: {
            delivery_status: 'delivered',
            attempts: { increment: 1 },
            delivered_at: new Date(),
            last_error: null,
            next_retry_at: null,
          },
        })
      }
      return data
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      if (options.retry) {
        try {
          const data = await attempt()
          if (deliveryId) {
            await prisma.webhook_deliveries.update({
              where: { id: deliveryId },
              data: {
                delivery_status: 'delivered',
                attempts: { increment: 2 },
                delivered_at: new Date(),
                last_error: null,
                next_retry_at: null,
              },
            })
          }
          return data
        } catch (retryError) {
          const retryMessage =
            retryError instanceof Error ? retryError.message : String(retryError)
          console.error('webhook retry failed', retryError)
          if (deliveryId) {
            await prisma.webhook_deliveries.update({
              where: { id: deliveryId },
              data: {
                delivery_status: 'failed',
                attempts: { increment: 2 },
                last_error: retryMessage.slice(0, 2000),
                next_retry_at: scheduleRetry
                  ? new Date(Date.now() + webhookRetryDelayMs(2))
                  : null,
              },
            })
          }
          throw new Error('can not send the webhook')
        }
      }

      console.error(e)
      if (deliveryId) {
        await prisma.webhook_deliveries.update({
          where: { id: deliveryId },
          data: {
            delivery_status: 'failed',
            attempts: { increment: 1 },
            last_error: message.slice(0, 2000),
            next_retry_at: scheduleRetry
              ? new Date(Date.now() + webhookRetryDelayMs(1))
              : null,
          },
        })
      }
      throw new Error('can not send the webhook')
    }
  }

  /**
   * Deliver to all enabled store webhooks. Failures are logged and do not throw,
   * so payment settlement is not rolled back by a flaky merchant endpoint.
   */
  static async deliverStoreWebhooks(
    storeId: number,
    body: any,
    event: string,
    hooks: Array<{
      id?: number
      payload_url: string
      secret: string
      enabled: number
      automatic_redelivery: number
      status: number
    }>
  ): Promise<void> {
    const targets = hooks.filter(
      (h) => h.status === 1 && h.enabled === 1 && Boolean(h.payload_url)
    )

    for (const hook of targets) {
      try {
        await WEBHOOK.sendWebhook(hook.payload_url, body, {
          secret: hook.secret,
          event,
          retry: hook.automatic_redelivery === 1,
          storeId,
          webhookSettingId: hook.id ?? null,
          persist: true,
          scheduleRetry: hook.automatic_redelivery === 1,
        })
      } catch (e) {
        console.error(`store ${storeId} webhook delivery failed`, e)
      }
    }
  }

  /** Process due failed/pending deliveries (cron). */
  static async retryDueDeliveries(limit = 50): Promise<{ processed: number; delivered: number }> {
    const now = new Date()
    const due = await prisma.webhook_deliveries.findMany({
      where: {
        status: 1,
        delivery_status: { in: ['pending', 'failed'] },
        attempts: { lt: MAX_ATTEMPTS },
        OR: [{ next_retry_at: null }, { next_retry_at: { lte: now } }],
      },
      orderBy: { id: 'asc' },
      take: Math.max(1, Math.min(200, limit)),
    })

    let delivered = 0
    for (const row of due) {
      const nextAttempt = row.attempts + 1
      try {
        let body: unknown = {}
        try {
          body = JSON.parse(row.payload)
        } catch {
          body = {}
        }
        await WEBHOOK.postSigned(row.payload_url, body, {
          secret: row.secret || null,
          event: row.event,
        })
        await prisma.webhook_deliveries.update({
          where: { id: row.id },
          data: {
            delivery_status: 'delivered',
            attempts: nextAttempt,
            delivered_at: new Date(),
            last_error: null,
            next_retry_at: null,
          },
        })
        delivered += 1
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        const giveUp = nextAttempt >= MAX_ATTEMPTS
        await prisma.webhook_deliveries.update({
          where: { id: row.id },
          data: {
            delivery_status: 'failed',
            attempts: nextAttempt,
            last_error: message.slice(0, 2000),
            next_retry_at: giveUp
              ? null
              : new Date(Date.now() + webhookRetryDelayMs(nextAttempt)),
          },
        })
      }
    }

    return { processed: due.length, delivered }
  }
}
