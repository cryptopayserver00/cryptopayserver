import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const invoiceId = req.body.invoice_id;
        const orderId = req.body.order_id;
        const message = req.body.message;
        const createDate = new Date();

        const invoice_event = await prisma.invoice_events.create({
          data: {
            invoice_id: invoiceId,
            order_id: orderId,
            message: message,
            created_at: createDate,
            status: 1,
          },
        });

        if (invoice_event) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: invoice_event.id,
            },
          });
        } else {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

      // const createQuery = `INSERT INTO invoice_events (invoice_id, order_id, message, created_date, status) VALUES (?, ?, ?, ?, ?)`;
      // const createValues = [invoiceId, orderId, message, createDate, 1];
      // const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
      // const id = ResultSetHeader.insertId;
      // if (id === 0) {
      //   return res.status(200).json({ message: 'Something wrong', result: false, data: null });
      // }

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: {
      //     id: id,
      //   },
      // });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
