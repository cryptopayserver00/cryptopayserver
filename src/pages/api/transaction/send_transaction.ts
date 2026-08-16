import type { NextApiRequest, NextApiResponse } from 'next'
import { CHAINS, COINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { BTC } from '@/packages/web3/chain/btc'
import { GweiToWei } from '@/utils/number'
import { NOTIFICATION_TYPE } from '@/packages/constants'
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

    const walletId = Number(req.body.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
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
    const maxPriortyFee = req.body.max_priorty_fee
    const gasLimit = req.body.gas_limit
    const memo = req.body.memo

    if (ETHEREUM_CATEGORY_CHAINS.includes(chainId)) {
      chainId = CHAINS.ETHEREUM
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
        status: 1,
      },
      select: {
        mnemonic: true,
        store_id: true,
      },
    })

    if (!wallet) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const hash = await WEB3.sendTransaction(address.network === 1, {
      coin: FindTokenByChainIdsAndSymbol(WEB3.getChainIds(address.network === 1, chainId), coin),
      value: value,
      privateKey: address.private_key,
      mnemonic: wallet.mnemonic,
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
