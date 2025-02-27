import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        const showApprovePayoutProcess = req.body.show_approve_payout_process;
        const interval = req.body.interval;
        const feeBlockTarget = req.body.fee_block_target;
        const threshold = req.body.threshold;

        const payout_setting = await prisma.payout_settings.update({
          data: {
            show_approve_payout_process: showApprovePayoutProcess,
            interval: interval,
            fee_block_target: feeBlockTarget,
            threshold: threshold,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!payout_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
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
