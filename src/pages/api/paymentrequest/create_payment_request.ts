import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PAYMENT_REQUEST_STATUS } from 'packages/constants';
import { GenerateOrderIDByTime } from 'utils/number';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
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
        const createdDate = new Date().getTime();

        const createQuery =
          'INSERT INTO payment_requests (user_id, store_id, network, payment_request_id, title, amount, currency, show_allow_custom_amount, expiration_date, email, request_customer_data, memo, payment_request_status, created_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const createValues = [
          userId,
          storeId,
          network,
          paymentRequestId,
          title,
          amount,
          currency,
          showAllowCustomAmount,
          expirationDate,
          email,
          requestCustomerData,
          memo,
          PAYMENT_REQUEST_STATUS.Pending,
          createdDate,
          1,
        ];
        const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
        const id = ResultSetHeader.insertId;
        if (id === 0) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: id,
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
