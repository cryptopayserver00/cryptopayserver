import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const pullPaymentId = req.query.id;

        const pull_payments = await prisma.pull_payments.findFirst({
          where: {
            pull_payment_id: Number(pullPaymentId),
            status: 1,
          },
        });

        if (!pull_payments) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            user_id: pull_payments.user_id,
            store_id: pull_payments.store_id,
            network: pull_payments.network,
            pull_payment_id: pull_payments.pull_payment_id,
            name: pull_payments.name,
            amount: pull_payments.amount,
            currency: pull_payments.currency,
            description: pull_payments.description,
            show_auto_approve_claim: pull_payments.show_auto_approve_claim,
            created_at: pull_payments.created_at,
            expiration_at: pull_payments.expiration_at,
            pull_payment_status: pull_payments.pull_payment_status,
          },
        });

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
