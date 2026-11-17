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

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rl-update_notification', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.notifications.findFirst({
      where: { id, status: 1 },
      select: { id: true, store_id: true },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ViewStores)) {
      return forbidden(res)
    }

    let updateData: { [key: string]: any } = {}

    // Staff may mark seen; only ModifyStores can rewrite label/message.
    if (req.body.is_seen !== undefined) updateData.is_seen = Number(req.body.is_seen)
    if (
      storeAccessHasPermission(access, STORE_PERMISSION.ModifyStores) ||
      access.isOwner
    ) {
      if (req.body.label) updateData.label = req.body.label
      if (req.body.message) updateData.message = req.body.message
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: 'Nothing to update', result: false, data: null })
    }

    const result = await prisma.notifications.updateMany({
      data: updateData,
      where: {
        id: owned.id,
        user_id: access.ownerUserId,
        status: 1,
      },
    })

    if (result.count === 0) {
      return res.status(200).json({ message: 'Invalid update', result: false, data: null })
    }

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
