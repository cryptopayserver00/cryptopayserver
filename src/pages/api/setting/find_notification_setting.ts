import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.query.store_id,
      STORE_PERMISSION.ViewStores,
      req.query.user_id
    )
    if (!access) return
    const { userId, storeId } = access

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
