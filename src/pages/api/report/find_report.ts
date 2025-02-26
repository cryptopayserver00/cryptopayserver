import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { REPORT_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;
        const status = req.query.status;
        const storeId = req.query.store_id;
        const network = req.query.network;

        const reports = await prisma.invoices.findMany({
          where: {
            source_type: String(status) && String(status) !== REPORT_STATUS.All ? String(status) : REPORT_STATUS.All,
            created_at: {
              gte: String(startDate),
              lte: String(endDate),
            },
            store_id: Number(storeId),
            network: Number(network),
            status: 1,
          },
          select: {
            chain_id: true,
            currency: true,
            amount: true,
            crypto: true,
            crypto_amount: true,
            rate: true,
            description: true,
            buyer_email: true,
            order_status: true,
            created_at: true,
            expiration_at: true,
            payment_method: true,
            paid: true,
            metadata: true,
            match_tx_id: true,
          },
        });

        if (!reports) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: reports });

      // let findQuery =
      //   'SELECT chain_id, currency, amount, crypto, crypto_amount, rate, description, buyer_email, order_status, created_date, expiration_date, payment_method, paid, metadata, match_tx_id FROM invoices where ';
      // let updateValues = [];

      // if (status && status !== REPORT_STATUS.All) {
      //   findQuery += 'source_type = ? and';
      //   updateValues.push(status);
      // }

      // findQuery += ' created_date BETWEEN ? and ? and store_id = ? and network = ? and status = ?';
      // updateValues.push(startDate, endDate, storeId, network, 1);

      // const [rows] = await connection.query(findQuery, updateValues);
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
