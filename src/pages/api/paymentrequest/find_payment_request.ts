import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { PAYMENT_REQUEST_STATUS } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const network = req.query.network;
        const paymentRequestStatus = req.query.payment_request_status;
        const paymentRequestId = req.query.payment_request_id;

        let whereData: { [key: string]: any } = {};
        whereData.store_id = Number(storeId);
        whereData.network = Number(network);
        whereData.status = 1;

        if (paymentRequestId) whereData.payment_request_id = Number(paymentRequestId);
        if (paymentRequestStatus !== undefined && paymentRequestStatus !== PAYMENT_REQUEST_STATUS.AllStatus)
          whereData.payment_request_status = paymentRequestStatus;

        const payment_requests = await prisma.payment_requests.findMany({
          where: whereData,
          orderBy: {
            updated_at: 'desc',
          },
        });

        if (!payment_requests) {
          return res.status(200).json({ message: '', result: false, data: null });
        }
        return res.status(200).json({ message: '', result: true, data: payment_requests });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
