import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const paymentRequestId = req.query.id;

        const payment_requests = await prisma.payment_requests.findFirst({
          where: {
            payment_request_id: typeof paymentRequestId === 'number' ? paymentRequestId : 0,
            status: 1,
          },
        });

        if (!payment_requests) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
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

      // const query = 'SELECT * FROM payment_requests where payment_request_id = ? and status = ? ';
      // const values = [paymentRequestId, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       user_id: row.user_id,
      //       store_id: row.store_id,
      //       payment_request_id: row.payment_request_id,
      //       network: row.network,
      //       title: row.title,
      //       amount: row.amount,
      //       currency: row.currency,
      //       memo: row.memo,
      //       expiration_date: row.expiration_date,
      //       payment_request_status: row.payment_request_status,
      //       reques_customer_data: row.reques_customer_data,
      //       show_allow_customAmount: row.show_allow_customAmount,
      //       email: row.email,
      //     },
      //   });
      // }

      // return res.status(200).json({ message: 'Something wrong', result: false, data: null });

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
