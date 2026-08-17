import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '@/pages/api'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.name) updateData.name = req.body.name
    if (req.body.address) updateData.address = req.body.address
    if (req.body.chain_id) updateData.chain_id = Number(req.body.chain_id)
    if (req.body.network) updateData.network = Number(req.body.network)

    const find_address_books = await prisma.address_books.findMany({
      where: {
        chain_id: updateData.chain_id,
        address: updateData.address,
        network: updateData.network,
        status: 1,
      },
    })

    if (find_address_books.length >= 1) {
      return res
        .status(200)
        .json({ message: 'Cannot find address book', result: false, data: null })
    }

    await prisma.address_books.update({
      data: updateData,
      where: {
        id: id,
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
