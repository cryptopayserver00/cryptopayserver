import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const userId = req.query.user_id;
        const storeId = req.query.store_id;
        const chainId = req.query.chain_id;
        const network = req.query.network;

        const payment_setting = await prisma.payment_settings.findFirst({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            chain_id: Number(chainId),
            network: Number(network),
            status: 1,
          },
        });

        if (!payment_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: payment_setting.id,
            payment_expire: payment_setting.payment_expire,
            confirm_block: payment_setting.confirm_block,
            show_recommended_fee: payment_setting.show_recommended_fee,
            current_used_address_id: payment_setting.current_used_address_id,
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
