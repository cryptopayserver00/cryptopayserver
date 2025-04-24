import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const pullPaymentId = req.query.id;

        const pull_payments = await prisma.pull_payments.findFirst({
          where: {
            pull_payment_id: Number(pullPaymentId),
            status: 1,
          },
        });

        if (!pull_payments) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const store = await prisma.stores.findFirst({
          where: {
            id: pull_payments.store_id,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            ...pull_payments,
            store_name: store.name,
            store_brand_color: store.brand_color,
            store_logo_url: store.logo_url,
            store_website: store.website,
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
