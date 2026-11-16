import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'
import { encryptSecret } from '@/lib/crypto/secrets'
import { assertSafeHttpUrl } from '@/lib/security/safe-url'

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
    const userId = access.userId
    const storeId = access.storeId

    const payloadUrl = String(req.body.payload_url || '')
    const safeUrl = await assertSafeHttpUrl(payloadUrl)
    if (!safeUrl.ok) {
      return res.status(200).json({ message: safeUrl.message, result: false, data: null })
    }

    const secret = req.body.secret
    const showAutomaticRedelivery = req.body.automatic_redelivery
    const showEnabled = req.body.enabled
    const eventType = req.body.event_type

    const webhook_setting = await prisma.webhook_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        payload_url: safeUrl.url.toString(),
        secret: encryptSecret(String(secret || '')),
        automatic_redelivery: showAutomaticRedelivery,
        enabled: showEnabled,
        event_type: eventType,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: webhook_setting.id,
      },
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
