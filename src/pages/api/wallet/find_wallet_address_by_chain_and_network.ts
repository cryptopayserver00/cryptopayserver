import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { CHAINS, ETHEREUM_CATEGORY_CHAINS } from 'packages/constants/blockchain';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const walletId = req.query.wallet_id;
        const chainId = req.query.chain_id;
        const network = req.query.network;

        if (!chainId) {
          return res.status(200).json({ message: '', result: false, data: '' });
        }

        let dbChainId = chainId || 0;

        if (ETHEREUM_CATEGORY_CHAINS.includes(Number(dbChainId))) {
          dbChainId = CHAINS.ETHEREUM;
        }

        const addresses = await prisma.addresses.findMany({
          where: {
            wallet_id: Number(walletId),
            chain_id: Number(dbChainId),
            network: Number(network),
            status: 1,
          },
          select: {
            id: true,
            address: true,
            note: true,
          },
        });

        if (!addresses) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        let newRows: any[] = [];
        if (Array.isArray(addresses) && addresses.length > 0) {
          const promises = addresses.map(async (item: any) => {
            return {
              id: item.id,
              address: item.address,
              note: item.note,
              balance: await WEB3.getAssetBalance(Number(network) === 1 ? true : false, Number(chainId), item.address),
              status: await WEB3.checkAccountStatus(
                Number(network) === 1 ? true : false,
                Number(chainId),
                item.address,
              ),
              tx_url: WEB3.getBlockchainAddressTransactionUrl(
                Number(network) === 1 ? true : false,
                Number(chainId),
                item.address,
              ),
              transactions: await WEB3.getTransactions(
                Number(network) === 1 ? true : false,
                Number(chainId),
                item.address,
              ),
              // transactions: [],
            };
          });
          newRows = await Promise.all(promises);

          return res.status(200).json({ message: '', result: true, data: newRows });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(200).json({ message: '', result: false, data: null });
  }
}
