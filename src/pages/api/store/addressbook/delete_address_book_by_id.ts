import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '@/pages/api'
import { prisma } from '@/lib/prisma'
import {
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

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.address_books.findFirst({
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

    await prisma.address_books.update({
      data: {
        status: 2,
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
