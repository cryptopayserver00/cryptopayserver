import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireOwnedStore } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!(await rateLimit(req, res, { scope: 'rl-find_wallet_coin_enables', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const ownedStore = await requireOwnedStore(req, res, req.query.store_id)
    if (!ownedStore) return
    const storeId = ownedStore.storeId

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const coin_enables = await prisma.wallet_coin_enables.findMany({
      where: {
        store_id: storeId,
        network: network,
        status: 1,
      },
      select: {
        chain_id: true,
        name: true,
        enabled: true,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: coin_enables.map((item) => ({
        name: item.name,
        chainId: item.chain_id,
        enabled: item.enabled,
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
