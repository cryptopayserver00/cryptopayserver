import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  forbidden,
  requireAuth,
  getStoreAccess,
  storeAccessHasPermission,
  STORE_PERMISSION,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_wallet', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const access = await getStoreAccess(storeId, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ViewStores)) {
      return forbidden(res)
    }

    const wallet = await prisma.wallets.findFirst({
      where: {
        store_id: storeId,
        user_id: access.ownerUserId,
        status: 1,
      },
      orderBy: { id: 'desc' },
      select: {
        id: true,
      },
    })

    if (!wallet) {
      return res.status(200).json({ message: 'Cannot find wallet', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: wallet.id,
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
