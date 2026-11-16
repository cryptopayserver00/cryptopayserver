import axios from 'axios'
import { createHmac } from 'crypto'
import { decryptSecret } from '@/lib/crypto/secrets'
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

export type WebhookSendOptions = {
  secret?: string | null
  event?: string
  /** Retry once on failure when automatic redelivery is enabled */
  retry?: boolean
}

export class WEBHOOK {
  static axiosInstance = axios.create({
    timeout: 50000,
  })

  static signPayload(secret: string, timestamp: string, rawBody: string): string {
    return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  }

  static async sendWebhook(
    url: string,
    body: any,
    options: WebhookSendOptions = {}
  ): Promise<any> {
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

    const attempt = async () => {
      // maxRedirects: 0 — prevent redirect-based SSRF after DNS check
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

    try {
      return await attempt()
    } catch (e) {
      if (options.retry) {
        try {
          return await attempt()
        } catch (retryError) {
          console.error('webhook retry failed', retryError)
          throw new Error('can not send the webhook')
        }
      }
      console.error(e)
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
        })
      } catch (e) {
        console.error(`store ${storeId} webhook delivery failed`, e)
      }
    }
  }
}
