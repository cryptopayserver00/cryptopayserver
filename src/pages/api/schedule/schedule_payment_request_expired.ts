import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PAYMENT_REQUEST_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        console.log('Schedule Payment Request Expired');
        const prisma = new PrismaClient();

        const payment_requests = await prisma.payment_requests.findMany({
          where: {
            payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
            status: 1,
          },
        });

        if (!payment_requests) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const now = new Date();
        payment_requests.forEach(async (item) => {
          const remainingTime = item.expiration_at.getTime() - now.getTime();
          if (remainingTime <= 0) {
            const payment_request = await prisma.payment_requests.update({
              data: {
                payment_request_status: PAYMENT_REQUEST_STATUS.Expired,
              },
              where: {
                id: item.id,
                status: 1,
              },
            });

            if (!payment_request) {
              return res.status(200).json({ message: '', result: false, data: null });
            }
          }
        });

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
