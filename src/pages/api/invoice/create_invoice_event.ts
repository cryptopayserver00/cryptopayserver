import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const invoiceId = req.body.invoice_id;
        const orderId = req.body.order_id;
        const message = req.body.message;
        const createDate = new Date().getTime();

        const createQuery = `INSERT INTO invoice_events (invoice_id, order_id, message, created_date, status) VALUES (?, ?, ?, ?, ?)`;
        const createValues = [invoiceId, orderId, message, createDate, 1];
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
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
