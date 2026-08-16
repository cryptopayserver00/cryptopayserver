import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '@/pages/api'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
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
