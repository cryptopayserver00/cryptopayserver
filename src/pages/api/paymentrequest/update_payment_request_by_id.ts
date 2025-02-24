import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const paymentRequestId = req.body.id;
        const userId = req.body.user_id;
        const storeId = req.body.store_id;

        const title = req.body.title;
        const amount = req.body.amount;
        const currency = req.body.currency;
        const showAllowCustomAmount = req.body.show_allow_custom_amount;
        const expirationDate = req.body.expiration_date;
        const email = req.body.email;
        const requestCustomerData = req.body.request_customer_data;
        const memo = req.body.memo;

        const payment_request = await prisma.payment_requests.update({
          data: {
            title: title,
            amount: amount,
            currency: currency,
            show_allow_custom_amount: showAllowCustomAmount,
            expiration_at: expirationDate,
            email: email,
            request_customer_data: requestCustomerData,
            memo: memo,
          },
          where: {
            payment_request_id: paymentRequestId,
            user_id: userId,
            store_id: storeId,
            status: 1,
          },
        });

        if (!payment_request) {
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

      // let updateQuery = 'UPDATE payment_requests SET ';
      // let updateValues = [];
      // if (title) {
      //   updateQuery += 'title = ?,';
      //   updateValues.push(title);
      // }
      // if (amount) {
      //   updateQuery += 'amount = ?,';
      //   updateValues.push(amount);
      // }
      // if (currency) {
      //   updateQuery += 'currency = ?,';
      //   updateValues.push(currency);
      // }
      // if (showAllowCustomAmount) {
      //   updateQuery += 'show_allow_custom_amount = ?,';
      //   updateValues.push(showAllowCustomAmount);
      // }
      // if (expirationDate) {
      //   updateQuery += 'expiration_date = ?,';
      //   updateValues.push(expirationDate);
      // }
      // if (email) {
      //   updateQuery += 'email = ?,';
      //   updateValues.push(email);
      // }
      // if (requestCustomerData) {
      //   updateQuery += 'request_customer_data = ?,';
      //   updateValues.push(requestCustomerData);
      // }
      // if (memo) {
      //   updateQuery += 'memo = ?,';
      //   updateValues.push(memo);
      // }

      // updateQuery = updateQuery.slice(0, -1);

      // updateQuery += ' WHERE payment_request_id = ? and user_id = ? and store_id = ? and status = ?';
      // updateValues.push(paymentRequestId, userId, storeId, 1);

      // await connection.query(updateQuery, updateValues);

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: null,
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
