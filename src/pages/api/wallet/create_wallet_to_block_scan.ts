import type { NextApiRequest, NextApiResponse } from 'next'
import { WEB3 } from '@/packages/web3'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { BLOCKSCAN, BlockScanWalletType } from '@/packages/web3/block_scan'
import { CHAINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
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

    const addresses = await prisma.addresses.findMany({
      where: {
        user_id: userId,
        wallet_id: walletId,
        status: 1,
      },
      select: {
        address: true,
        network: true,
        chain_id: true,
      },
    })

    if (addresses.length === 0) {
      return res.status(200).json({ message: 'Cannot find many', result: false, data: null })
    }

    const blockscanWalletTypes: BlockScanWalletType[] = []

    for (const address of addresses) {
      if (address.chain_id === CHAINS.ETHEREUM) {
        for (const chain of ETHEREUM_CATEGORY_CHAINS) {
          blockscanWalletTypes.push({
            address: address.address,
            chain_id: WEB3.getChainIds(address.network === 1, chain),
          })
        }
      } else {
        blockscanWalletTypes.push({
          address: address.address,
          chain_id: WEB3.getChainIds(address.network === 1, address.chain_id),
        })
      }
    }

    const [result, data] = await BLOCKSCAN.bulkStoreUserWallet(blockscanWalletTypes)

    if (!result) {
      return res
        .status(200)
        .json({ message: 'Cannot bulk store user wallet', result: false, data: null })
    }

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
