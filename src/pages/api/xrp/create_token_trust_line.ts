import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { COINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import {
  assertWalletOwnedByUser,
  forbidden,
  rateLimit,
  requireAuthUserId,
  requireWalletPasswordIfSet,
} from '@/lib/auth'
import { decryptSecret } from '@/lib/crypto/secrets'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'xrp-trust', limit: 20, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const walletId = Number(req.body.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    if (!(await assertWalletOwnedByUser(walletId, userId))) {
      return forbidden(res)
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const fromAddress = req.body.address
    if (!fromAddress) {
      return res.status(200).json({ message: 'Invalid fromAddress', result: false, data: null })
    }

    const coin = req.body.coin
    if (!coin) {
      return res.status(200).json({ message: 'Invalid coin', result: false, data: null })
    }

    const limit = req.body.limit
    if (!limit) {
      return res.status(200).json({ message: 'Invalid limit', result: false, data: null })
    }

    const address = await prisma.addresses.findFirst({
      where: {
        chain_id: chainId,
        network: network,
        address: fromAddress,
        wallet_id: walletId,
        user_id: userId,
        status: 1,
      },
      select: {
        wallet_id: true,
        private_key: true,
        note: true,
        network: true,
        address: true,
      },
    })

    if (!address) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const wallet = await prisma.wallets.findFirst({
      where: {
        id: address.wallet_id,
        user_id: userId,
        status: 1,
      },
      select: {
        id: true,
        mnemonic: true,
        store_id: true,
        password: true,
      },
    })

    if (!wallet) {
      return res.status(200).json({ message: 'Cannot find wallet', result: false, data: null })
    }

    if (!(await requireWalletPasswordIfSet(req, res, wallet, req.body.wallet_password))) {
      return
    }

    const token = FindTokenByChainIdsAndSymbol(
      WEB3.getChainIds(address.network === 1, chainId),
      coin as COINS
    )
    if (!token) {
      return res.status(200).json({ message: 'Invalid coin', result: false, data: null })
    }

    const hash = await WEB3.createTokenTrustLine(network === 1, chainId, {
      mnemonic: decryptSecret(wallet.mnemonic),
      address: fromAddress,
      issuer: String(token.contractAddress),
      coin: coin,
      limit: String(limit),
    })

    if (!hash) {
      return res
        .status(200)
        .json({ message: 'Cannot create trust line', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        hash: hash,
      },
    })
  } catch (e) {
    console.error(e)
    const message = e instanceof Error ? e.message : 'Internal server error'
    return res.status(200).json({
      message,
      result: false,
      data: null,
    })
  }
}
