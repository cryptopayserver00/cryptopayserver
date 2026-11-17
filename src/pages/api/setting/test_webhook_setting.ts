import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireStorePermission, STORE_PERMISSION } from '@/lib/auth'
import { WEBHOOK } from '@/utils/webhook'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.body.store_id,
      STORE_PERMISSION.ModifyWebhooks,
      req.body.user_id
    )
    if (!access) return

    if (
      !(await rateLimit(req, res, {
        scope: `test_webhook_setting:${access.userId}`,
        limit: 20,
        windowMs: 15 * 60 * 1000,
      }))
    ) {
      return
    }

    const { userId, storeId } = access
    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const webhook = await prisma.webhook_settings.findFirst({
      where: {
        id,
        store_id: storeId,
        user_id: userId,
        status: 1,
      },
      select: {
        id: true,
        payload_url: true,
        secret: true,
        enabled: true,
      },
    })

    if (!webhook) {
      return res.status(200).json({ message: 'Webhook not found', result: false, data: null })
    }

    if (!webhook.payload_url) {
      return res.status(200).json({ message: 'Webhook has no payload URL', result: false, data: null })
    }

    await WEBHOOK.sendWebhook(
      webhook.payload_url,
      { ping: true, webhookId: webhook.id },
      {
        secret: webhook.secret,
        event: 'webhook.test',
      }
    )

    return res.status(200).json({ message: '', result: true, data: null })
  } catch (e) {
    console.error(e)
    return res.status(200).json({
      message: 'Webhook test failed',
      result: false,
      data: null,
    })
  }
}
