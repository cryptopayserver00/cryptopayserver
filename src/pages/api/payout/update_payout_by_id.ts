import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const payoutId = req.body.id;
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const payoutStatus = req.body.payout_status;
        const tx = req.body.tx;
        const cryptoAmount = req.body.crypto_amount;
        const updatedDate = new Date();

        const payout = await prisma.payouts.update({
          data: {
            payout_status: payoutStatus,
            tx: tx,
            crypto_amount: cryptoAmount,
            updated_at: updatedDate,
          },
          where: {
            payout_id: payoutId,
            user_id: userId,
            store_id: storeId,
            status: 1,
          },
        });

        if (!payout) {
          return res.status(200).json({
            message: '',
            result: false,
            data: null,
          });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
