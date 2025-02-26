import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const id = req.body.id;
        // const userId = req.body.user_id;
        // const storeId = req.body.store_id;
        // const network = req.body.network;
        const chainId = req.body.chain_id;

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

      // let updateQuery = 'UPDATE payout_settings SET ';
      // let updateValues = [];
      // if (showApprovePayoutProcess) {
      //   updateQuery += 'show_approve_payout_process = ?,';
      //   updateValues.push(showApprovePayoutProcess);
      // }
      // if (interval) {
      //   updateQuery += '`interval` = ?,';
      //   updateValues.push(interval);
      // }
      // if (feeBlockTarget) {
      //   updateQuery += 'fee_block_target = ?,';
      //   updateValues.push(feeBlockTarget);
      // }
      // if (threshold) {
      //   updateQuery += 'threshold = ?,';
      //   updateValues.push(threshold);
      // }

      // updateQuery = updateQuery.slice(0, -1);

      // updateQuery += ' WHERE store_id = ? and user_id = ? and network = ? and chain_id = ? and status = ?';
      // updateValues.push(storeId, userId, network, chainId, 1);

      // await connection.query(updateQuery, updateValues);

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: null,
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
