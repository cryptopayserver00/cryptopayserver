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
        const pullPaymentId = req.query.id;

        const query = 'SELECT * FROM pull_payments where pull_payment_id = ? and status = ? ';
        const values = [pullPaymentId, 1];
        const [rows] = await connection.query(query, values);
        if (Array.isArray(rows) && rows.length === 1) {
          const row = rows[0] as mysql.RowDataPacket;

          return res.status(200).json({
            message: '',
            result: true,
            data: {
              user_id: row.user_id,
              store_id: row.store_id,
              network: row.network,
              pull_payment_id: row.pull_payment_id,
              title: row.title,
              amount: row.amount,
              currency: row.currency,
              description: row.description,
              show_auto_approve_claim: row.show_auto_approve_claim,
              created_date: row.created_date,
              expiration_date: row.expiration_date,
              pull_payment_status: row.pull_payment_status,
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
