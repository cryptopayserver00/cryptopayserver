import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import { NOTIFICATIONS } from '@/packages/constants'

const ALLOWED_NOTIFICATION_IDS = new Set(NOTIFICATIONS.map((n) => n.id))

function sanitizeNotificationIds(raw: unknown): string | null {
  const ids = String(raw || '')
    .split(',')
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n > 0 && ALLOWED_NOTIFICATION_IDS.has(n))
  if (ids.length === 0) return null
  return [...new Set(ids)].sort((a, b) => a - b).join(',')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.notification_settings.findFirst({
      where: { id, status: 1 },
      select: { id: true, store_id: true },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores)) {
      return forbidden(res, 'Insufficient store permission')
    }

    const notifications = sanitizeNotificationIds(req.body.notifications)
    if (!notifications) {
      return res.status(200).json({
        message: 'notifications must be a comma-separated list of known notification ids',
        result: false,
        data: null,
      })
    }

    await prisma.notification_settings.update({
      data: {
        notifications,
      },
      where: {
        id: owned.id,
        user_id: access.ownerUserId,
        status: 1,
      },
    })

    return res.status(200).json({ message: '', result: true, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
