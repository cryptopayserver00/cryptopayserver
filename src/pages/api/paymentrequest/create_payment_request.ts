import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PAYMENT_REQUEST_STATUS } from 'packages/constants';
import { GenerateOrderIDByTime } from 'utils/number';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const network = req.body.network;

        const paymentRequestId = GenerateOrderIDByTime();
        const title = req.body.title;
        const amount = req.body.amount;
        const currency = req.body.currency;
        const showAllowCustomAmount = req.body.show_allow_custom_amount;
        const expirationDate = req.body.expiration_date;
        const email = req.body.email;
        const requestCustomerData = req.body.request_customer_data;
        const memo = req.body.memo;
        const createdDate = new Date();

        const payment_request = await prisma.payment_requests.create({
          data: {
            user_id: userId,
            store_id: storeId,
            network: network,
            payment_request_id: paymentRequestId,
            title: title,
            amount: amount,
            currency: currency,
            show_allow_custom_amount: showAllowCustomAmount,
            email: email,
            request_customer_data: requestCustomerData,
            memo: memo,
            payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
            created_at: createdDate,
            expiration_at: expirationDate,
            status: 1,
          },
        });

        if (!payment_request) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: payment_request.id,
          },
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
