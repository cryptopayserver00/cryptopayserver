import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { CHAINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import {
  assertWalletOwnedByUser,
  forbidden,
  rateLimit,
  requireAccountPassword,
  requireAuth,
  requireWalletPasswordIfSet,
} from '@/lib/auth'
import { decryptAndUpgrade } from '@/lib/crypto/secrets'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    // POST only — wallet password must not appear in query strings.
    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'export-pk', limit: 20, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    let chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const walletId = Number(req.body.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    if (!(await assertWalletOwnedByUser(walletId, session.userId))) {
      return forbidden(res)
    }

    const wallet = await prisma.wallets.findFirst({
      where: { id: walletId, user_id: session.userId, status: 1 },
      select: { id: true, password: true },
    })
    if (!wallet) {
      return forbidden(res)
    }
    if (
      !(await requireAccountPassword(
        req,
        res,
        session.userId,
        req.body.account_password || req.body.password,
        'Account password required to export keys'
      ))
    ) {
      return
    }

    if (!(await requireWalletPasswordIfSet(req, res, wallet, req.body.wallet_password))) {
      return
    }

    if (ETHEREUM_CATEGORY_CHAINS.includes(chainId)) {
      chainId = CHAINS.ETHEREUM
    }

    const addresses = await prisma.addresses.findMany({
      where: {
        wallet_id: walletId,
        user_id: session.userId,
        chain_id: chainId,
        network: network,
        status: 1,
      },
      select: {
        id: true,
        address: true,
        private_key: true,
      },
    })

    const data = []
    for (const item of addresses) {
      const { plaintext, upgraded } = decryptAndUpgrade(item.private_key)
      if (upgraded) {
        await prisma.addresses.update({
          where: { id: item.id },
          data: { private_key: upgraded },
        })
      }
      data.push({
        address: item.address,
        privateKey: plaintext,
      })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data,
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
