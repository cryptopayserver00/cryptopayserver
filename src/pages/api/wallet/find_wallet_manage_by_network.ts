import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { BLOCKCHAINNAMES, CHAINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
import { WEB3 } from '@/packages/web3'
import { BLOCKSCAN, BlockScanWalletType } from '@/packages/web3/block_scan'
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

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const walletId = Number(req.query.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    const addresses = await prisma.addresses.findMany({
      where: {
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

    // balance
    let coinBalances: any[] = []

    if (Array.isArray(addresses) && addresses.length > 0) {
      addresses.map(async (item: any) => {
        if (item.chain_id === CHAINS.ETHEREUM) {
          coinBalances.push(
            ...[
              {
                address: item.address,
                chain_id: CHAINS.ETHEREUM,
              },
              {
                address: item.address,
                chain_id: CHAINS.BSC,
              },
              {
                address: item.address,
                chain_id: CHAINS.ARBITRUM,
              },
              {
                address: item.address,
                chain_id: CHAINS.AVALANCHE,
              },
              {
                address: item.address,
                chain_id: CHAINS.ARBITRUMNOVA,
              },
              {
                address: item.address,
                chain_id: CHAINS.POLYGON,
              },
              {
                address: item.address,
                chain_id: CHAINS.BASE,
              },
              {
                address: item.address,
                chain_id: CHAINS.OPTIMISM,
              },
            ]
          )
        } else {
          coinBalances.push({
            address: item.address,
            chainId: item.chain_id,
          })
        }
      })
    }

    // scan
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

    let [blockScanResp, blockScanData] = await BLOCKSCAN.bulkStoreUserWallet(blockscanWalletTypes)

    const blockchains = BLOCKCHAINNAMES.filter((item) =>
      network === 1 ? item.isMainnet : !item.isMainnet
    )

    type coinManageType = {
      chainId: number
      name: string
      enabled: boolean
    }

    let coinManages: coinManageType[] = []

    if (blockchains && blockchains.length > 0) {
      for (const item of blockchains) {
        if (item && item.coins.length > 0) {
          for (const coinItem of item.coins) {
            let coinManage: coinManageType = {
              chainId: coinItem.chainId,
              name: coinItem.name,
              enabled: false,
            }

            // enable
            const coin_enable = await prisma.wallet_coin_enables.findFirst({
              where: {
                store_id: storeId,
                chain_id: coinItem.chainId,
                name: coinItem.name,
                network: network,
                status: 1,
              },
              select: {
                enabled: true,
              },
            })
            if (coin_enable) {
              coinManage.enabled = coin_enable.enabled === 1
            } else {
              coinManage.enabled = true
            }

            coinManages.push(coinManage)
          }
        }
      }
    }

    if (blockScanData && blockScanData.length > 0) {
      blockScanData = blockScanData.map((item: any) => {
        return {
          ...item,
          chainId: WEB3.getChains(item.chain_id),
        }
      })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        balances: coinBalances,
        scan: {
          result: blockScanResp,
          data: blockScanData,
        },
        coins: coinManages,
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
