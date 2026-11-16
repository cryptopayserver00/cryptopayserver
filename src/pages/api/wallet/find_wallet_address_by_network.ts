import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { CHAINPATHNAMES, CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import { requireAuthUserId, assertStoreOwnedByUser, assertWalletOwnedByUser, forbidden } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const walletId = Number(req.query.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }
    if (!(await assertWalletOwnedByUser(walletId, userId))) {
      return forbidden(res)
    }

    const addresses = await prisma.addresses.findMany({
      where: {
        user_id: userId,
        wallet_id: walletId,
        network: network,
        status: 1,
      },
      select: {
        id: true,
        address: true,
        network: true,
        chain_id: true,
        note: true,
      },
    })

    let addressRows: any[] = []
    if (Array.isArray(addresses) && addresses.length > 0) {
      addresses.map(async (item: any) => {
        if (item.chain_id === CHAINS.ETHEREUM) {
          addressRows.push(
            ...[
              {
                id: item.id,
                note: CHAINPATHNAMES.ETHEREUM,
                address: item.address,
                chain_id: CHAINS.ETHEREUM,
              },
              {
                id: item.id,
                note: CHAINPATHNAMES.BSC,
                address: item.address,
                chain_id: CHAINS.BSC,
              },
              {
                id: item.id,
                note: CHAINPATHNAMES.ARBITRUM,
                address: item.address,
                chain_id: CHAINS.ARBITRUM,
              },
              {
                id: item.id,
                note: CHAINPATHNAMES.AVALANCHE,
                address: item.address,
                chain_id: CHAINS.AVALANCHE,
              },
              {
                id: item.id,
                note: CHAINPATHNAMES.ARBITRUMNOVA,
                address: item.address,
                chain_id: CHAINS.ARBITRUMNOVA,
              },
              {
                id: item.id,
                note: CHAINPATHNAMES.POLYGON,
                address: item.address,
                chain_id: CHAINS.POLYGON,
              },
              {
                id: item.id,
                note: CHAINPATHNAMES.BASE,
                address: item.address,
                chain_id: CHAINS.BASE,
              },
              {
                id: item.id,
                note: CHAINPATHNAMES.OPTIMISM,
                address: item.address,
                chain_id: CHAINS.OPTIMISM,
              },
            ]
          )
        } else {
          addressRows.push({
            id: item.id,
            address: item.address,
            note: item.note,
            chainId: item.chain_id,
          })
        }
      })

      return res.status(200).json({ message: '', result: true, data: addressRows })
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
