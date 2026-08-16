import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { CHAINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    let chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const walletId = Number(req.query.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    if (ETHEREUM_CATEGORY_CHAINS.includes(chainId)) {
      chainId = CHAINS.ETHEREUM
    }

    const addresses = await prisma.addresses.findMany({
      where: {
        wallet_id: walletId,
        chain_id: chainId,
        network: network,
        status: 1,
      },
      select: {
        address: true,
        private_key: true,
      },
    })

    if (Array.isArray(addresses) && addresses.length > 0) {
      const newRows = addresses.filter((item) => {
        return {
          address: item.address,
          privateKey: item.private_key,
        }
      })

      return res.status(200).json({ message: '', result: true, data: newRows })
    }

    return res.status(200).json({ message: '', result: false, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
