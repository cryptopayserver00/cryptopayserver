import type { NextApiRequest, NextApiResponse } from 'next';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { BLOCKSCAN, BlockScanWalletType } from 'packages/web3/block_scan';
import { CHAINS } from 'packages/constants/blockchain';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const userId = req.body.user_id;
        const walletId = req.body.wallet_id;

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
        });

        if (!addresses) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

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
            if (item.network === 1) {
              blockscanWalletTypes.push({
                address: item.address,
                chain_id: WEB3.getChainIds(item.network === 1 ? true : false, CHAINS.ARBITRUMNOVA),
              });
            }
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

        const [result, data] = await BLOCKSCAN.bulkStoreUserWallet(blockscanWalletTypes);

        if (!result) {
          return res.status(200).json({ message: '', result: false, data: data });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
