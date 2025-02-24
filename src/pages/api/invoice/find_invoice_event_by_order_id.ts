import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const orderId = req.query.order_id;

        const invoice_events = await prisma.invoice_events.findMany({
          where: {
            order_id: typeof orderId === 'number' ? orderId : 0,
            status: 1,
          },
        });

        if (!invoice_events) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: invoice_events });

      // const query = 'SELECT * FROM invoice_events where order_id = ? and status = ?';
      // const values = [orderId, 1];
      // const [rows] = await connection.query(query, values);
      // return res.status(200).json({ message: '', result: true, data: rows });
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
