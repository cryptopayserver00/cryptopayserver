import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireStorePermission, STORE_PERMISSION } from '@/lib/auth'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.body.store_id,
      STORE_PERMISSION.ModifyStores,
      req.body.user_id
    )
    if (!access) return

    if (!(await rateLimit(req, res, { scope: 'rl-update_wallet_coin_enable', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const userId = access.userId
    const storeId = access.storeId

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const name = req.body.name
    if (!name) {
      return res.status(200).json({ message: 'Invalid name', result: false, data: null })
    }

    let enabled = 0
    let id = 0

    const coin_enable = await prisma.wallet_coin_enables.findFirst({
      where: {
        user_id: userId,
        store_id: storeId,
        chain_id: chainId,
        name: String(name),
        network: network,
        status: 1,
      },
    })

    if (coin_enable) {
      id = coin_enable.id
      enabled = coin_enable?.enabled
    } else {
      const create_coin_enable = await prisma.wallet_coin_enables.create({
        data: {
          user_id: userId,
          store_id: storeId,
          chain_id: chainId,
          name: String(name),
          network: network,
          enabled: 1,
          status: 1,
        },
      })

      id = create_coin_enable.id
      enabled = create_coin_enable.enabled
    }

    await prisma.wallet_coin_enables.update({
      data: {
        enabled: enabled === 1 ? 2 : 1,
      },
      where: {
        id: id,
        user_id: userId,
        store_id: storeId,
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
