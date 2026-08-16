import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '@/pages/api'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const name = req.body.name
    if (!name) {
      return res.status(200).json({ message: 'Invalid name', result: false, data: null })
    }

    const address = req.body.address
    if (!address) {
      return res.status(200).json({ message: 'Invalid address', result: false, data: null })
    }

    const result = await WEB3.checkAddress(network === 1, chainId, String(address))

    if (!result) {
      return res.status(200).json({ message: 'Cannot check address', result: false, data: null })
    }

    const find_address_book = await prisma.address_books.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        address: address,
        network: network,
        status: 1,
      },
    })

    if (find_address_book) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const address_book = await prisma.address_books.create({
      data: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        name: name,
        address: address,
        network: network,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: address_book.id,
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
