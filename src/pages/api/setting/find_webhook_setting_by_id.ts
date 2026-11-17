import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_webhook_setting_by_id', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const id = Number(req.query.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const webhook_setting = await prisma.webhook_settings.findFirst({
      where: {
        id: id,
        status: 1,
      },
    })

    if (!webhook_setting) {
      return forbidden(res, 'Cannot find')
    }

    const access = await getStoreAccess(webhook_setting.store_id, session.userId)
    if (
      !access ||
      (!storeAccessHasPermission(access, STORE_PERMISSION.ModifyWebhooks) &&
        !storeAccessHasPermission(access, STORE_PERMISSION.ViewStores))
    ) {
      return forbidden(res)
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: webhook_setting.id,
        userId: webhook_setting.user_id,
        storeId: webhook_setting.store_id,
        status: webhook_setting.status,
        createdAt: webhook_setting.created_at,
        updatedAt: webhook_setting.updated_at,
        payloadUrl: webhook_setting.payload_url,
        secret: '',
        hasSecret: Boolean(webhook_setting.secret),
        automaticRedelivery: webhook_setting.automatic_redelivery,
        enabled: webhook_setting.enabled,
        eventType: webhook_setting.event_type,
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
