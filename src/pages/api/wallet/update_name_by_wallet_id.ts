import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireOwnedWallet } from '@/lib/auth'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const owned = await requireOwnedWallet(req, res, req.body.wallet_id)
    if (!owned) return

    if (!(await rateLimit(req, res, { scope: 'rl-update_wallet_name', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const name = req.body.name
    if (!name) {
      return res.status(200).json({ message: 'Invalid name', result: false, data: null })
    }

    await prisma.wallets.update({
      data: {
        name: name,
      },
      where: {
        id: owned.walletId,
        user_id: owned.userId,
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
