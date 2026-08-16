import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
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
        status: 1,
      },
      select: {
        mnemonic: true,
        store_id: true,
      },
    })

    if (!wallet) {
      return res.status(200).json({ message: 'Cannot find wallet', result: false, data: null })
    }

    const hash = await WEB3.createTokenTrustLine(network === 1, chainId, {
      mnemonic: wallet.mnemonic,
      address: fromAddress,
      issuer: String(
        FindTokenByChainIdsAndSymbol(WEB3.getChainIds(address.network === 1, chainId), coin)
          .contractAddress
      ),
      coin: coin,
      limit: limit,
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
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
