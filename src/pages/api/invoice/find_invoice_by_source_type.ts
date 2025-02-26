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

        const invoices = await prisma.invoices.findMany({
          where: {
            store_id: Number(storeId),
            network: Number(network),
            source_type: String(sourceType),
            external_payment_id: Number(externalPaymentId),
            status: 1,
          },
          select: {
            order_id: true,
            amount: true,
            currency: true,
            order_status: true,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (!invoices) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: invoices });

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
