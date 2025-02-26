import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const payoutId = req.query.id;

        const payout = await prisma.payouts.findFirst({
          where: {
            payout_id: Number(payoutId),
            status: 1,
          },
        });

        if (!payout) {
          return res.status(200).json({ message: '', result: false, data: null });
        }
        return res.status(200).json({
          message: '',
          result: true,
          data: {
            address: payout.address,
            crypto: payout.crypto,
            currency: payout.currency,
            amount: payout.amount,
          },
        });

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
