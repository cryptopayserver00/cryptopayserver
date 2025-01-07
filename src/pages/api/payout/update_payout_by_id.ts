import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const payoutId = req.body.id;
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const payoutStatus = req.body.payout_status;
        const tx = req.body.tx;
        const cryptoAmount = req.body.crypto_amount
        const updatedDate = new Date().getTime();

        let updateQuery = 'UPDATE payouts SET ';
        let updateValues = [];

        if (payoutStatus) {
          updateQuery += 'payout_status = ?,';
          updateValues.push(payoutStatus);
        }

        if (tx) {
          updateQuery += 'tx = ?,';
          updateValues.push(tx);
        }

        if (cryptoAmount) {
          updateQuery += 'crypto_amount = ?,';
          updateValues.push(cryptoAmount);
        }

        updateQuery += 'updated_date = ?,';
        updateValues.push(updatedDate);

        updateQuery = updateQuery.slice(0, -1);

        updateQuery += ' WHERE payout_id = ? and user_id = ? and store_id = ? and status = ?';
        updateValues.push(payoutId, userId, storeId, 1);

        await connection.query(updateQuery, updateValues);

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
