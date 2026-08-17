import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '@/pages/api'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    let findData: { [key: string]: any } = {}

    if (req.query.store_id) findData.store_id = Number(req.query.store_id)
    if (req.query.network) findData.network = Number(req.query.network)
    if (req.query.chain_id) findData.chain_id = Number(req.query.chain_id)
    findData.status = 1

    const address_books = await prisma.address_books.findMany({
      where: findData,
      orderBy: {
        id: 'desc',
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: address_books.map((item) => ({
        id: item.id,
        name: item.name,
        userId: item.user_id,
        storeId: item.store_id,
        chainId: item.chain_id,
        address: item.address,
        network: item.network,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
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
