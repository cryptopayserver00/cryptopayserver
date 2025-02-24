import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { INVOICE_SOURCE_TYPE } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const storeId = req.query.store_id;
        const network = req.query.network;
        const sourceType = req.query.source_type;
        const externalPaymentId = req.query.external_payment_id;

        const invoices = await prisma.invoices.findMany({
          where: {
            store_id: typeof storeId === 'number' ? storeId : 0,
            network: typeof network === 'number' ? network : 0,
            source_type: typeof sourceType === 'string' ? sourceType : '',
            external_payment_id: typeof externalPaymentId === 'number' ? externalPaymentId : 0,
            status: 1,
          },
          select: {
            order_id: true,
            amount: true,
            currency: true,
            order_status: true,
          },
          orderBy: {
            id: 'desc',
          },
        });

        if (!invoices) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: invoices });

      // const query = `SELECT order_id, amount, currency, order_status FROM invoices where store_id = ? and network = ? and source_type = ? and external_payment_id = ? and status = ? order by id desc`;
      // const values = [storeId, network, sourceType, externalPaymentId, 1];
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
