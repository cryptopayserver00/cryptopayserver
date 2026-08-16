import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const webhook_settings = await prisma.webhook_settings.findMany({
      where: {
        store_id: storeId,
        user_id: userId,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: webhook_settings.map((item) => ({
        id: item.id,
        userId: item.user_id,
        storeId: item.store_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        payloadUrl: item.payload_url,
        secret: item.secret,
        automaticRedelivery: item.automatic_redelivery,
        enabled: item.enabled,
        eventType: item.event_type,
      })),
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
