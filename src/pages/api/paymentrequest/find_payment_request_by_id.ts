import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const paymentRequestId = req.query.id;

        const payment_requests = await prisma.payment_requests.findFirst({
          where: {
            payment_request_id: Number(paymentRequestId),
            status: 1,
          },
        });

        if (!payment_requests) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const store = await prisma.stores.findFirst({
          where: {
            id: payment_requests.store_id,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            ...payment_requests,
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
