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

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            user_id: payment_requests.user_id,
            store_id: payment_requests.store_id,
            payment_request_id: payment_requests.payment_request_id,
            network: payment_requests.network,
            title: payment_requests.title,
            amount: payment_requests.amount,
            currency: payment_requests.currency,
            memo: payment_requests.memo,
            expiration_date: payment_requests.expiration_at,
            payment_request_status: payment_requests.payment_request_status,
            request_customer_data: payment_requests.request_customer_data,
            show_allow_custom_amount: payment_requests.show_allow_custom_amount,
            email: payment_requests.email,
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
