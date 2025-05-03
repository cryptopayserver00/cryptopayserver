import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const chainId = req.body.chain_id;
        const name = req.body.name;
        const network = req.body.network;
        let enabled = 0;
        let id = 0;

        const coin_enable = await prisma.wallet_coin_enables.findFirst({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            chain_id: Number(chainId),
            name: String(name),
            network: Number(network),
            status: 1,
          },
        });

        if (coin_enable) {
          id = coin_enable.id;
          enabled = coin_enable?.enabled;
        } else {
          const create_coin_enable = await prisma.wallet_coin_enables.create({
            data: {
              user_id: Number(userId),
              store_id: Number(storeId),
              chain_id: Number(chainId),
              name: String(name),
              network: Number(network),
              enabled: 1,
              status: 1,
            },
          });

          if (!create_coin_enable) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          id = create_coin_enable.id;
          enabled = create_coin_enable.enabled;
        }

        const update_enable = await prisma.wallet_coin_enables.update({
          data: {
            enabled: enabled === 1 ? 2 : 1,
          },
          where: {
            id: Number(id),
            status: 1,
          },
        });

        if (!update_enable) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
