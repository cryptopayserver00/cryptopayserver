import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const network = req.query.network;
        const pullPaymentStatus = req.query.pull_payment_status;

        const pull_payments: any = await prisma.$queryRaw`
        SELECT pull_payments.*, COUNT(payouts.external_payment_id) AS refunded 
        FROM pull_payments 
        LEFT JOIN payouts 
          ON pull_payments.pull_payment_id = payouts.external_payment_id 
          AND payouts.source_type = ${PAYOUT_SOURCE_TYPE.PullPayment} 
          AND payouts.payout_status = ${PAYOUT_STATUS.Completed} 
          AND payouts.status = 1 
        WHERE pull_payments.pull_payment_status = ${pullPaymentStatus} 
          AND pull_payments.store_id = ${storeId} 
          AND pull_payments.network = ${network} 
          AND pull_payments.status = 1 
          GROUP BY pull_payments.id 
          ORDER BY pull_payments.id DESC;
      `;

        if (!pull_payments) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: pull_payments });

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
