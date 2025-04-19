import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { CHAINS } from 'packages/constants/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const userId = req.query.user_id;
        const network = req.query.network;

        const payout_setting = await prisma.payout_settings.findMany({
          where: {
            store_id: Number(storeId),
            user_id: Number(userId),
            status: 1,
          },
        });

        if (payout_setting.length === 0) {
          // create default role
          const chainValues = Object.values(CHAINS);
          const filteredChainValues = chainValues.filter((value) => typeof value === 'number');
          const data: any[] = [];

          filteredChainValues.forEach(async (item) => {
            data.push({
              user_id: Number(userId),
              store_id: Number(storeId),
              chain_id: Number(item),
              network: Number(network),
              show_approve_payout_process: 2,
              interval: 60,
              fee_block_target: 1,
              threshold: 0,
              status: 1,
            });
          });

          const default_setting = await prisma.payout_settings.createMany({
            data: data,
          });

          if (!default_setting) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          return res.status(200).json({ message: '', result: true, data: default_setting });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: payout_setting,
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
