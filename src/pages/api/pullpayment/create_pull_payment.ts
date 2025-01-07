import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { GenerateOrderIDByTime } from 'utils/number';
import { PULL_PAYMENT_STATUS } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const network = req.body.network;

        const pullPaymentId = GenerateOrderIDByTime();
        const name = req.body.name;
        const amount = req.body.amount;
        const currency = req.body.currency;
        const showAutoApproveClaim = req.body.show_auto_approve_claim;
        const description = req.body.description;
        const currentDate = new Date();
        const createdDate = currentDate.getTime();

        currentDate.setDate(currentDate.getDate() + 7);
        const expirationDate = currentDate.getTime();

        const createQuery =
          'INSERT INTO pull_payments (user_id, store_id, network, pull_payment_id, name, amount, currency, show_auto_approve_claim, description, pull_payment_status, created_date, updated_date, expiration_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const createValues = [
          userId,
          storeId,
          network,
          pullPaymentId,
          name,
          amount,
          currency,
          showAutoApproveClaim,
          description,
          PULL_PAYMENT_STATUS.Active,
          createdDate,
          createdDate,
          expirationDate,
          1,
        ];
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
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
