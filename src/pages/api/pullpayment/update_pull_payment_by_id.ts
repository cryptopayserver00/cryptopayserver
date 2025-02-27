import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const pullPaymentId = req.body.id;
        const userId = req.body.user_id;
        const storeId = req.body.store_id;

        const name = req.body.name;
        const amount = req.body.amount;
        const currency = req.body.currency;
        const showAutoApproveClaim = req.body.show_auto_approve_claim;
        const description = req.body.description;
        const payoutMethod = req.body.payout_method;
        const pullPaymentStatus = req.body.pull_payment_status;
        const updatedDate = new Date();

        const pull_payment = await prisma.pull_payments.update({
          data: {
            name: name,
            amount: amount,
            currency: currency,
            show_auto_approve_claim: showAutoApproveClaim,
            description: description,
            payout_method: payoutMethod,
            pull_payment_status: pullPaymentStatus,
            updated_at: updatedDate,
          },
          where: {
            pull_payment_id: pullPaymentId,
            user_id: userId,
            store_id: storeId,
            status: 1,
          },
        });

        if (!pull_payment) {
          return res.status(500).json({ message: '', result: false, data: null });
        }

        switch (pullPaymentStatus) {
          case PULL_PAYMENT_STATUS.Archived:
            const payouts = await prisma.payouts.updateMany({
              data: {
                payout_status: PAYOUT_STATUS.Cancelled,
                updated_at: new Date(),
              },
              where: {
                external_payment_id: pullPaymentId,
                source_type: PAYOUT_SOURCE_TYPE.PullPayment,
                status: 1,
                payout_status: {
                  in: [PAYOUT_STATUS.AwaitingApproval, PAYOUT_STATUS.AwaitingPayment],
                },
              },
            });

            if (!payouts) {
              return res.status(500).json({ message: '', result: false, data: null });
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
