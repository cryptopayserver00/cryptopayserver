import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const paymentRequestId = req.query.id;

        const query = 'SELECT * FROM payment_requests where payment_request_id = ? and status = ? ';
        const values = [paymentRequestId, 1];
        const [rows] = await connection.query(query, values);
        if (Array.isArray(rows) && rows.length === 1) {
          const row = rows[0] as mysql.RowDataPacket;
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              user_id: row.user_id,
              store_id: row.store_id,
              payment_request_id: row.payment_request_id,
              network: row.network,
              title: row.title,
              amount: row.amount,
              currency: row.currency,
              memo: row.memo,
              expiration_date: row.expiration_date,
              payment_request_status: row.payment_request_status,
              reques_customer_data: row.reques_customer_data,
              show_allow_customAmount: row.show_allow_customAmount,
              email: row.email,
            },
          });
        }

        return res.status(200).json({ message: 'Something wrong', result: false, data: null });

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
