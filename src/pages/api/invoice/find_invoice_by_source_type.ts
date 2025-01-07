import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { INVOICE_SOURCE_TYPE } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const storeId = req.query.store_id;
        const network = req.query.network;
        const sourceType = req.query.source_type;
        const externalPaymentId = req.query.external_payment_id;

        // let queryTypeString = '';
        // switch (sourceType) {
        //   case INVOICE_SOURCE_TYPE.PaymentRequest:
        //     queryTypeString = 'payment_request_id';
        //     break;
        //   default:
        //     return res.status(500).json({ message: '', result: false, data: '' });
        // }

        const query = `SELECT order_id, amount, currency, order_status FROM invoices where store_id = ? and network = ? and source_type = ? and external_payment_id = ? and status = ? order by id desc`;
        const values = [storeId, network, sourceType, externalPaymentId, 1];
        const [rows] = await connection.query(query, values);
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
