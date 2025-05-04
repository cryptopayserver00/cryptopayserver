import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { CHAINPATHNAMES, CHAINS } from 'packages/constants/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const userId = req.query.user_id;
        const walletId = req.query.wallet_id;
        const network = req.query.network;

        const addresses = await prisma.addresses.findMany({
          where: {
            user_id: Number(userId),
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

        let addressRows: any[] = [];
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
                ],
              );
            } else {
              addressRows.push({
                id: item.id,
                address: item.address,
                note: item.note,
                chain_id: item.chain_id,
              });
            }
          });

          return res.status(200).json({ message: '', result: true, data: addressRows });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
