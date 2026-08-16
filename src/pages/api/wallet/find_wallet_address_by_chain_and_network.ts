import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { CHAINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const walletId = Number(req.query.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    let chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    if (ETHEREUM_CATEGORY_CHAINS.includes(chainId)) {
      chainId = CHAINS.ETHEREUM
    }

    const addresses = await prisma.addresses.findMany({
      where: {
        wallet_id: walletId,
        chain_id: chainId,
        network: network,
        status: 1,
      },
      select: {
        id: true,
        address: true,
        note: true,
      },
    })

    let newRows: any[] = []
    if (Array.isArray(addresses) && addresses.length > 0) {
      const promises = addresses.map(async (item: any) => {
        return {
          id: item.id,
          address: item.address,
          note: item.note,
          balance: await WEB3.getAssetBalance(network === 1, chainId, item.address),
          status: (await WEB3.checkAccountStatus(network === 1, chainId, item.address)) ? 1 : 2,
          tx_url: WEB3.getBlockchainAddressTransactionUrl(network === 1, chainId, item.address),
          transactions: await WEB3.getTransactions(network === 1, chainId, item.address),
          resource: await WEB3.getAccountResource(network === 1, chainId, item.address),
          trust_line: await WEB3.getTokenTrustLine(network === 1, chainId, item.address),
          // transactions: [],
        }
      })
      newRows = await Promise.all(promises)

      return res.status(200).json({ message: '', result: true, data: newRows })
    }

    return res.status(200).json({ message: '', result: false, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
