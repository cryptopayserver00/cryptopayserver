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
  requireAccountPassword,
  requireAuthUserId,
  requireWalletPasswordIfSet,
} from '@/lib/auth'
import { decryptSecret } from '@/lib/crypto/secrets'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    // POST — private key must not appear via GET query decryption side-effects.
    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'gas-fee', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    if (
      !(await requireAccountPassword(
        req,
        res,
        userId,
        req.body.account_password || req.body.password,
        'Account password required'
      ))
    ) {
      return
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const coin = req.body.coin
    const from = req.body.from
    const to = req.body.to
    const value = req.body.value
    const walletId = Number(req.body.wallet_id)

    if (!to) {
      return res.status(200).json({ message: 'Invalid to', result: false, data: null })
    }

    if (!value) {
      return res.status(200).json({ message: 'Invalid value', result: false, data: null })
    }

    if (!coin) {
      return res.status(200).json({ message: 'Invalid coin', result: false, data: null })
    }

    const address = await prisma.addresses.findFirst({
      where: {
        chain_id: chainId,
        network: network,
        address: String(from),
        user_id: userId,
        ...(walletId ? { wallet_id: walletId } : {}),
        status: 1,
      },
      select: {
        chain_id: true,
        private_key: true,
        note: true,
        network: true,
        address: true,
        wallet_id: true,
      },
    })

    if (!address) {
      return res.status(200).json({ message: 'Cannot find address', result: false, data: '' })
    }

    if (!(await assertWalletOwnedByUser(address.wallet_id, userId))) {
      return forbidden(res)
    }

    const wallet = await prisma.wallets.findFirst({
      where: { id: address.wallet_id, user_id: userId, status: 1 },
      select: { id: true, password: true },
    })
    if (!wallet) {
      return forbidden(res)
    }
    if (!(await requireWalletPasswordIfSet(res, wallet, req.body.wallet_password))) {
      return
    }

    const gas = await WEB3.estimateGasFee(address.network === 1, {
      coin: FindTokenByChainIdsAndSymbol(
        WEB3.getChainIds(address.network === 1, address.chain_id),
        coin as COINS
      ),
      value: String(value),
      privateKey: decryptSecret(address.private_key),
      from: address.address,
      to: String(to),
    })

    if (!gas) {
      return res.status(200).json({ message: 'Cannot get gas', result: false, data: null })
    }

    return res.status(200).json({ message: '', result: true, data: gas })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
