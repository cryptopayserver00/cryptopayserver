import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { GenerateOrderIDByTime } from 'utils/number';
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from 'packages/constants';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const network = req.body.network;
        const chainId = req.body.chain_id;
        const payoutId = GenerateOrderIDByTime();
        const address = req.body.address;
        const sourceType = req.body.source_type;
        const externalPaymentId = req.body.external_payment_id;
        const amount = req.body.amount;
        const currency = req.body.currency;
        const crypto = req.body.crypto;
        const createdDate = new Date().getTime();
        const updatedDate = new Date().getTime();

        let status = PAYOUT_STATUS.AwaitingApproval;

        switch (sourceType) {
          case PAYOUT_SOURCE_TYPE.PullPayment:
            const findQuery =
              'SELECT show_auto_approve_claim FROM pull_payments where pull_payment_id = ? and status = ? limit 1';
            const findValues = [externalPaymentId, 1];
            const [findRows] = await connection.query(findQuery, findValues);
            if (Array.isArray(findRows) && findRows.length === 1) {
              const row = findRows[0] as mysql.RowDataPacket;
              if (row.show_auto_approve_claim === 1) {
                status = PAYOUT_STATUS.AwaitingPayment;
              }
            }
        }

        const createQuery =
          'INSERT INTO payouts (user_id, store_id, network, chain_id, payout_id, address, source_type, currency, amount, crypto, external_payment_id, payout_status, created_date, updated_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const createValues = [
          userId,
          storeId,
          network,
          chainId,
          payoutId,
          address,
          sourceType,
          currency,
          amount,
          crypto,
          externalPaymentId,
          status,
          createdDate,
          updatedDate,
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
