import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const paymentRequestId = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.amount !== undefined) updateData.amount = Number(req.body.amount);
        if (req.body.currency !== undefined) updateData.currency = req.body.currency;
        if (req.body.show_allow_custom_amount !== undefined)
          updateData.show_allow_custom_amount = Number(req.body.show_allow_custom_amount);
        if (req.body.expiration_date !== undefined) updateData.expiration_date = req.body.expiration_date;
        if (req.body.email !== undefined) updateData.email = req.body.email;
        if (req.body.request_customer_data !== undefined)
          updateData.request_customer_data = req.body.request_customer_data;
        if (req.body.memo !== undefined) updateData.memo = req.body.memo;
        if (req.body.payment_request_status !== undefined)
          updateData.payment_request_status = req.body.payment_request_status;

        const payment_request = await prisma.payment_requests.update({
          data: updateData,
          where: {
            id: paymentRequestId,
            status: 1,
          },
        });

        if (!payment_request) {
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
