import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '@/pages/api'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  forbidden,
  getStoreAccess,
  requireAuthUserId,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_address_book_by_id', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const id = Number(req.query.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const address_book = await prisma.address_books.findFirst({
      where: {
        id: id,
        status: 1,
      },
    })

    if (!address_book) {
      return res
        .status(200)
        .json({ message: 'Cannot find address book', result: false, data: null })
    }

    const access = await getStoreAccess(address_book.store_id, userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ViewStores)) {
      return forbidden(res)
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: address_book.id,
        name: address_book.name,
        userId: address_book.user_id,
        storeId: address_book.store_id,
        chainId: address_book.chain_id,
        address: address_book.address,
        network: address_book.network,
        status: address_book.status,
        createdAt: address_book.created_at,
        updatedAt: address_book.updated_at,
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
