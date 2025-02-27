import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        const paymentExpire = req.body.payment_expire ? req.body.payment_expire : 0;
        const confirmBlock = req.body.confirm_block ? req.body.confirm_block : 0;
        const showRecommendedFee = req.body.show_recommended_fee ? req.body.show_recommended_fee : 0;
        const currentUsedAddressId = req.body.current_used_address_id;

        const payment_setting = await prisma.payment_settings.update({
          data: {
            payment_expire: paymentExpire,
            confirm_block: confirmBlock,
            show_recommended_fee: showRecommendedFee,
            current_used_address_id: currentUsedAddressId,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!payment_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
