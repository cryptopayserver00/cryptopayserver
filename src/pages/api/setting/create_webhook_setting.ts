import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const payloadUrl = req.body.payload_url
    const secret = req.body.secret
    const showAutomaticRedelivery = req.body.automatic_redelivery
    const showEnabled = req.body.enabled
    const eventType = req.body.event_type

    const webhook_setting = await prisma.webhook_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        payload_url: payloadUrl,
        secret: secret,
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
