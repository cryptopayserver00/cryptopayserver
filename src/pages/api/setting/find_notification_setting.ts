import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  requireStorePermission,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import { NOTIFICATION, NOTIFICATIONS } from '@/packages/constants'

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

    if (!(await rateLimit(req, res, { scope: 'rl-find_notification_setting', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    const { userId, storeId } = access

    let notification_setting = await prisma.notification_settings.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        status: 1,
      },
    })

    if (!notification_setting) {
      const ids: number[] = NOTIFICATIONS.map((item: NOTIFICATION) => item.id)
      if (storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
        notification_setting = await prisma.notification_settings.create({
          data: {
            user_id: userId,
            store_id: storeId,
            notifications: ids.join(','),
            status: 1,
          },
        })
      } else {
        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: 0,
            notifications: ids.join(','),
          },
        })
      }
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
