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

        let updateData: { [key: string]: any } = {};

        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.amount !== undefined) updateData.amount = Number(req.body.amount);
        if (req.body.currency !== undefined) updateData.currency = req.body.currency;
        if (req.body.show_auto_approve_claim !== undefined)
          updateData.show_auto_approve_claim = Number(req.body.show_auto_approve_claim);
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.payout_method !== undefined) updateData.payout_method = req.body.payout_method;
        if (req.body.pull_payment_status !== undefined) updateData.pull_payment_status = req.body.pull_payment_status;

        const pull_payment = await prisma.pull_payments.update({
          data: updateData,
          where: {
            pull_payment_id: pullPaymentId,
            status: 1,
          },
        });

        if (!pull_payment) {
          return res.status(500).json({ message: '', result: false, data: null });
        }

        switch (req.body.pull_payment_status) {
          case PULL_PAYMENT_STATUS.Archived:
            const payouts = await prisma.payouts.updateMany({
              data: {
                payout_status: PAYOUT_STATUS.Cancelled,
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
