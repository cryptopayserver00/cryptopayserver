import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { BLOCKCHAINNAMES, CHAINS } from 'packages/constants/blockchain';
import { WEB3 } from 'packages/web3';
import { BLOCKSCAN, BlockScanWalletType } from 'packages/web3/block_scan';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const walletId = req.query.wallet_id;
        const storeId = req.query.store_id;
        const network = req.query.network;

        const addresses = await prisma.addresses.findMany({
          where: {
            wallet_id: Number(walletId),
            network: Number(network),
            status: 1,
          },
          select: {
            id: true,
            address: true,
            network: true,
            chain_id: true,
            note: true,
          },
        });

        if (!addresses) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        // balance
        let coinBalances: any[] = [];

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
                ],
              );
            } else {
              coinBalances.push({
                address: item.address,
                chain_id: item.chain_id,
              });
            }
          });
        }

        // scan
        const blockscanWalletTypes: BlockScanWalletType[] = [];

        addresses.forEach(async (item) => {
          if (item.chain_id === CHAINS.ETHEREUM) {
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.ETHEREUM),
            });
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.BSC),
            });
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.ARBITRUM),
            });
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.ARBITRUMNOVA),
            });
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.AVALANCHE),
            });
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.POLYGON),
            });
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.BASE),
            });
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.OPTIMISM),
            });
          } else {
            blockscanWalletTypes.push({
              address: item.address,
              chain_id: WEB3.getChainIds(item.network === 1 ? true : false, item.chain_id),
            });
          }
        });

        let [blockScanResp, blockScanData] = await BLOCKSCAN.bulkStoreUserWallet(blockscanWalletTypes);

        const blockchains = BLOCKCHAINNAMES.filter((item) =>
          Number(network) === 1 ? item.isMainnet : !item.isMainnet,
        );

        type coinManageType = {
          chain_id: number;
          name: string;
          enabled: boolean;
        };

        let coinManages: coinManageType[] = [];

        if (blockchains && blockchains.length > 0) {
          for (const item of blockchains) {
            if (item && item.coins.length > 0) {
              for (const coinItem of item.coins) {
                let coinManage: coinManageType = {
                  chain_id: coinItem.chainId,
                  name: coinItem.name,
                  enabled: false,
                };

                // enable
                const coin_enable = await prisma.wallet_coin_enables.findFirst({
                  where: {
                    store_id: Number(storeId),
                    chain_id: coinItem.chainId,
                    name: coinItem.name,
                    network: Number(network),
                    status: 1,
                  },
                  select: {
                    enabled: true,
                  },
                });
                if (coin_enable) {
                  coinManage.enabled = coin_enable.enabled === 1 ? true : false;
                } else {
                  coinManage.enabled = true;
                }

                coinManages.push(coinManage);
              }
            }
          }
        }

        if (blockScanData && blockScanData.length > 0) {
          blockScanData = blockScanData.map((item: any) => {
            return {
              ...item,
              chain_id: WEB3.getChains(item.chain_id),
            };
          });
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
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
