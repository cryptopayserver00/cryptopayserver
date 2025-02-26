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
        const network = req.query.network;
        const sourceType = req.query.source_type;
        const externalPaymentId = req.query.external_payment_id;

        const payouts = await prisma.payouts.findMany({
          where: {
            store_id: Number(storeId),
            network: Number(network),
            source_type: String(sourceType),
            external_payment_id: Number(externalPaymentId),
            status: 1,
          },
          select: {
            chain_id: true,
            address: true,
            crypto: true,
            crypto_amount: true,
            currency: true,
            amount: true,
            payout_status: true,
            tx: true,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (!payouts) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: payouts });

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
