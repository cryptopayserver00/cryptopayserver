import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { CHAINS, ETHEREUM_CATEGORY_CHAINS } from 'packages/constants/blockchain';
import mysql from 'mysql2/promise';
import { FindChainIdsByChainNames } from 'utils/web3';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const walletId = req.query.wallet_id;
        const chainId = req.query.chain_id;
        const network = req.query.network;

        if (!chainId) {
          return res.status(200).json({ message: '', result: false, data: '' });
        }

        let dbChainId = chainId || 0;

        if (ETHEREUM_CATEGORY_CHAINS.includes(parseInt(dbChainId as string))) {
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
            address: true,
            private_key: true,
          },
        });

        if (!addresses) {
          return res.status(200).json({ message: '', result: false, data: '' });
        }

        if (Array.isArray(addresses) && addresses.length > 0) {
          const newRows = addresses.filter((item) => {
            return {
              address: item.address,
              private_key: item.private_key,
            };
          });

          return res.status(200).json({ message: '', result: true, data: newRows });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      // const query =
      //   'SELECT address, private_key FROM addresses where wallet_id = ? and chain_id = ? and network = ? and status = ?';
      // const values = [walletId, dbChainId, network, 1];
      // const [rows] = await connection.query(query, values);

      // if (Array.isArray(rows) && rows.length > 0) {
      //   const newRows = rows.filter((item: any) => {
      //     return {
      //       address: item.address,
      //       private_key: item.private_key,
      //     };
      //   });

      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: newRows,
      //   });
      // }

      // return res.status(200).json({ message: '', result: false, data: null });
      case 'POST':
        break;
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
