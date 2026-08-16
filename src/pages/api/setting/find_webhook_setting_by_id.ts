import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
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
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
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
        secret: webhook_setting.secret,
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
