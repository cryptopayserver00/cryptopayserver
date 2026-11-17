import type { NextApiRequest, NextApiResponse } from 'next'
import { CHAINS, COINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { BTC } from '@/packages/web3/chain/btc'
import { GweiToWei } from '@/utils/number'
import { NOTIFICATION_TYPE } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import {
  assertWalletOwnedByUser,
  forbidden,
  rateLimit,
  requireAccountPassword,
  requireAuthUserId,
  requireWalletPasswordIfSet,
} from '@/lib/auth'
import { decryptAndUpgrade } from '@/lib/crypto/secrets'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'send-tx', limit: 30, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const walletId = Number(req.body.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    if (!(await assertWalletOwnedByUser(walletId, userId))) {
      return forbidden(res)
    }

    let chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const fromAddress = req.body.from_address
    const toAddress = req.body.to_address
    const feeRate = req.body.fee_rate
    const value = req.body.value
    const coin = req.body.coin
    const nonce = req.body.nonce
    const maxFee = req.body.max_fee
    const maxPriortyFee = req.body.max_priority_fee ?? req.body.max_priorty_fee
    const gasLimit = req.body.gas_limit
    const memo = req.body.memo

    let dbChainId = chainId
    if (ETHEREUM_CATEGORY_CHAINS.includes(chainId)) {
      dbChainId = CHAINS.ETHEREUM
    }

    const address = await prisma.addresses.findFirst({
      where: {
        chain_id: dbChainId,
        network: network,
        address: fromAddress,
        wallet_id: walletId,
        user_id: userId,
        status: 1,
      },
      select: {
        id: true,
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
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    if (
      !(await requireAccountPassword(
        req,
        res,
        userId,
        req.body.account_password || req.body.password,
        'Account password required to send'
      ))
    ) {
      return
    }

    if (!(await requireWalletPasswordIfSet(req, res, wallet, req.body.wallet_password))) {
      return
    }

    const privateKeyUpgrade = decryptAndUpgrade(address.private_key)
    const mnemonicUpgrade = decryptAndUpgrade(wallet.mnemonic)
    if (privateKeyUpgrade.upgraded) {
      await prisma.addresses.update({
        where: { id: address.id },
        data: { private_key: privateKeyUpgrade.upgraded },
      })
    }
    if (mnemonicUpgrade.upgraded) {
      await prisma.wallets.update({
        where: { id: wallet.id },
        data: { mnemonic: mnemonicUpgrade.upgraded },
      })
    }
    const privateKey = privateKeyUpgrade.plaintext
    const mnemonic = mnemonicUpgrade.plaintext

    const token = FindTokenByChainIdsAndSymbol(WEB3.getChainIds(address.network === 1, chainId), coin)
    if (!token) {
      return res.status(200).json({ message: 'Invalid coin', result: false, data: null })
    }

    const hash = await WEB3.sendTransaction(address.network === 1, {
      coin: token,
      value: value,
      privateKey: privateKey,
      mnemonic: mnemonic,
      feeRate: feeRate,
      btcType: coin === COINS.BTC ? BTC.getType(address.note) : undefined,
      from: address.address,
      to: toAddress,
      gasPrice: maxFee ? GweiToWei(maxFee).toString() : '',
      gasLimit: gasLimit ? gasLimit : '',
      maxPriorityFeePerGas: maxPriortyFee ? GweiToWei(maxPriortyFee).toString() : '',
      nonce: nonce ? nonce : '',
      memo: memo ? memo : '',
    })

    if (!hash) {
      return res.status(200).json({ message: 'Cannot sent tx', result: false, data: null })
    }

    await prisma.notifications.create({
      data: {
        user_id: userId,
        store_id: wallet.store_id,
        network: network,
        label: NOTIFICATION_TYPE.Transaction,
        message: `You have a new transaction in progress: ${hash}`,
        url: `payments/transactions`,
        is_seen: 2,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        hash: hash,
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
