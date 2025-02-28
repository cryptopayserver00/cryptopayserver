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

        let updateData: { [key: string]: any } = {};

        if (req.body.payout_status !== undefined) updateData.payout_status = req.body.payout_status;
        if (req.body.tx !== undefined) updateData.tx = req.body.tx;
        if (req.body.crypto_amount !== undefined) updateData.crypto_amount = Number(req.body.crypto_amount);

        const payout = await prisma.payouts.update({
          data: updateData,
          where: {
            payout_id: payoutId,
            status: 1,
          },
        });

        if (!payout) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
