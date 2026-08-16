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

    const notification_setting = await prisma.notification_settings.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })

    if (!notification_setting) {
      return res.status(200).json({
        message: 'Invalid notification setting',
        result: false,
        data: null,
      })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: notification_setting.id,
        notifications: notification_setting.notifications,
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
