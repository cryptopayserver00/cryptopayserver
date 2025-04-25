import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { ORDER_STATUS, ORDER_TIME } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const network = req.query.network;
        const orderId = req.query.order_id;
        const orderStatus = req.query.order_status;
        const time = req.query.time;

        let whereData: { [key: string]: any } = {};
        whereData.store_id = Number(storeId);
        whereData.network = Number(network);
        whereData.status = 1;

        if (orderId) whereData.order_id = Number(orderId);
        if (orderStatus !== undefined && orderStatus !== ORDER_STATUS.AllStatus) whereData.order_status = orderStatus;

        const date = new Date();
        switch (time) {
          case ORDER_TIME.AllTime:
            break;
          case ORDER_TIME.Last24Hours:
            date.setHours(date.getHours() - 24);
            whereData.created_at = {
              gte: date,
            };
            break;
          case ORDER_TIME.Last3Days:
            date.setHours(date.getHours() - 24 * 3);
            whereData.created_at = {
              gte: date,
            };
            break;
          case ORDER_TIME.Last7Days:
            date.setHours(date.getHours() - 24 * 7);
            whereData.created_at = {
              gte: date,
            };
            break;
        }

        const invoices = await prisma.invoices.findMany({
          where: whereData,
          orderBy: {
            id: 'desc',
          },
        });

        if (!invoices) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: invoices });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
