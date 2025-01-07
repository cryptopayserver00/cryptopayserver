import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { REPORT_STATUS } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;
        const status = req.query.status;
        const storeId = req.query.store_id;
        const network = req.query.network;

        let findQuery =
          'SELECT chain_id, currency, amount, crypto, crypto_amount, rate, description, buyer_email, order_status, created_date, expiration_date, payment_method, paid, metadata, match_tx_id FROM invoices where ';
        let updateValues = [];

        if (status && status !== REPORT_STATUS.All) {
          findQuery += 'source_type = ? and';
          updateValues.push(status);
        }

        findQuery += ' created_date BETWEEN ? and ? and store_id = ? and network = ? and status = ?';
        updateValues.push(startDate, endDate, storeId, network, 1);

        const [rows] = await connection.query(findQuery, updateValues);
        return res.status(200).json({ message: '', result: true, data: rows });
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
