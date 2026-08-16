import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { BLOCKCHAINNAMES } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const payment_setting = await prisma.payment_settings.findFirst({
      where: {
        store_id: storeId,
        chain_id: chainId,
        network: network,
        status: 1,
      },
      select: {
        current_used_address_id: true,
      },
    })

    if (!payment_setting) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const address = await prisma.addresses.findFirst({
      where: {
        id: payment_setting.current_used_address_id,
        status: 1,
      },
      select: {
        address: true,
      },
    })

    if (!address) {
      return res.status(200).json({ message: 'Cannot find address', result: false, data: null })
    }

    const balance = await WEB3.getAssetBalance(network === 1, chainId, address.address)

    const coins = BLOCKCHAINNAMES.find(
      (item) => item.chainId === WEB3.getChainIds(network === 1, chainId)
    )?.coins

    const mainCoin = coins?.find((item) => item.isMainCoin)

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        address: address.address,
        balance: balance,
        mainCoin: mainCoin,
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
