import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const storeId = req.query.store_id;
        const network = req.query.network;
        const pullPaymentStatus = req.query.pull_payment_status;

        const query =
          'SELECT pull_payments.*, COUNT(payouts.external_payment_id) AS refunded FROM pull_payments LEFT JOIN payouts ON pull_payments.pull_payment_id = payouts.external_payment_id AND payouts.source_type = ? AND payouts.payout_status = ? AND payouts.status = ? WHERE pull_payments.pull_payment_status = ? AND pull_payments.store_id = ? AND pull_payments.network = ? AND pull_payments.status = ? GROUP BY pull_payments.id DESC;';
        const values = [
          PAYOUT_SOURCE_TYPE.PullPayment,
          PAYOUT_STATUS.Completed,
          1,
          pullPaymentStatus,
          storeId,
          network,
          1,
        ];
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
