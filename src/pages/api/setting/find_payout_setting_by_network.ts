import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const userId = req.query.user_id;
        const network = req.query.network;
        const chainId = req.query.chain_id;

        const payout_setting = await prisma.payout_settings.findFirst({
          where: {
            chain_id: Number(chainId),
            network: Number(network),
            user_id: Number(userId),
            store_id: Number(storeId),
            status: 1,
          },
        });

        if (!payout_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: payout_setting.id,
            chain_id: payout_setting.chain_id,
            show_approve_payout_process: payout_setting.show_approve_payout_process,
            interval: payout_setting.interval,
            fee_block_target: payout_setting.fee_block_target,
            threshold: payout_setting.threshold,
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
