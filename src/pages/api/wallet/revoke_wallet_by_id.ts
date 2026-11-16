import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  requireAccountPassword,
  requireOwnedWallet,
  requireWalletPasswordIfSet,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const owned = await requireOwnedWallet(req, res, req.body.wallet_id, req.body.user_id)
    if (!owned) return

    if (!rateLimit(req, res, { scope: 'revoke-wallet', limit: 10, windowMs: 15 * 60 * 1000 })) {
      return
    }

    if (
      !(await requireAccountPassword(
        res,
        owned.userId,
        req.body.account_password || req.body.password,
        'Account password required to revoke wallet'
      ))
    ) {
      return
    }

    const wallet = await prisma.wallets.findFirst({
      where: { id: owned.walletId, user_id: owned.userId, status: 1 },
      select: { id: true, password: true },
    })
    if (!wallet) {
      return res.status(200).json({ message: 'Wallet not found', result: false, data: null })
    }

    if (!(await requireWalletPasswordIfSet(res, wallet, req.body.wallet_password))) {
      return
    }

    await prisma.$transaction(async (tx) => {
      await tx.wallets.update({
        where: { id: owned.walletId, user_id: owned.userId, status: 1 },
        data: { status: 2, mnemonic: '', password: '' },
      })
      await tx.addresses.updateMany({
        where: { wallet_id: owned.walletId, user_id: owned.userId, status: 1 },
        data: { status: 2, private_key: '' },
      })
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
