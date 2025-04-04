import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const payoutId = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.payout_status !== undefined) updateData.payout_status = req.body.payout_status;
        if (req.body.tx !== undefined) updateData.tx = req.body.tx;
        if (req.body.crypto_amount !== undefined) updateData.crypto_amount = Number(req.body.crypto_amount);

        const payout = await prisma.payouts.update({
          data: updateData,
          where: {
            payout_id: payoutId,
            status: 1,
          },
        });

        if (!payout) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        switch (payout.source_type) {
          case PAYOUT_SOURCE_TYPE.PullPayment:
            const pull_payment = await prisma.pull_payments.findFirst({
              where: {
                pull_payment_id: payout.external_payment_id,
                pull_payment_status: PULL_PAYMENT_STATUS.Active,
                status: 1,
              },
              select: {
                id: true,
                amount: true,
              },
            });

            if (!pull_payment) {
              return res.status(200).json({ message: '', result: false, data: null });
            }

            const payouts = await prisma.payouts.findMany({
              where: {
                external_payment_id: payout.external_payment_id,
                payout_status: PAYOUT_STATUS.Completed,
                status: 1,
              },
            });

            if (!payouts) {
              return res.status(200).json({ message: '', result: false, data: null });
            }

            let totalPayoutAmount = 0;
            payouts.map((payoutItem) => {
              totalPayoutAmount += payoutItem.amount;
            });

            if (totalPayoutAmount >= pull_payment.amount) {
              const update_pull_payment = await prisma.pull_payments.update({
                data: {
                  pull_payment_status: PULL_PAYMENT_STATUS.Settled,
                },
                where: {
                  id: pull_payment.id,
                },
              });

              if (!update_pull_payment) {
                return res.status(200).json({ message: '', result: false, data: null });
              }
            }
        }

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
