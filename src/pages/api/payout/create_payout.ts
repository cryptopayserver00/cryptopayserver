import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { GenerateOrderIDByTime } from 'utils/number';
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
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
        const now = new Date();
        // const updatedDate = new Date().getTime();

        let status = PAYOUT_STATUS.AwaitingApproval;

        switch (sourceType) {
          case PAYOUT_SOURCE_TYPE.PullPayment:
            const pull_payment = await prisma.pull_payments.findFirst({
              where: {
                pull_payment_id: externalPaymentId,
                status: 1,
              },
              select: {
                show_auto_approve_claim: true,
              },
            });

            if (!pull_payment) {
              return res.status(200).json({ message: '', result: false, data: null });
            }

            if (pull_payment.show_auto_approve_claim === 1) {
              status = PAYOUT_STATUS.AwaitingPayment;
            }
        }

        const payouts = await prisma.payouts.create({
          data: {
            user_id: userId,
            store_id: storeId,
            network: network,
            chain_id: chainId,
            payout_id: payoutId,
            address: address,
            source_type: sourceType,
            currency: currency,
            amount: amount,
            crypto: crypto,
            external_payment_id: externalPaymentId,
            payout_status: status,
            status: 1,
          },
        });

        if (!payouts) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: payouts.id,
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
