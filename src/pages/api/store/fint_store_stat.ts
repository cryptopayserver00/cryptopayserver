import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { STORE_STAT_ITEM_TYPE, STORE_STAT_TIME_TYPE } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const id = req.query.id;
        const network = req.query.network;
        const time = req.query.time;
        const item = req.query.item;

        if (
          !time ||
          !item ||
          !Object.values(STORE_STAT_TIME_TYPE).includes(String(time)) ||
          !Object.values(STORE_STAT_ITEM_TYPE).includes(String(item))
        ) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        let start: any, end: any;
        const now = new Date();
        let result;

        switch (time) {
          case STORE_STAT_TIME_TYPE.WEEK:
            const dayOfWeek = now.getDay() || 7;
            start = new Date(now);
            start.setDate(now.getDate() - (dayOfWeek - 1));
            start.setHours(0, 0, 0, 0);

            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
          case STORE_STAT_TIME_TYPE.MONTH:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            start.setHours(0, 0, 0, 0);

            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
          case STORE_STAT_TIME_TYPE.YEAR:
            start = new Date(now.getFullYear(), 0, 1);
            start.setHours(0, 0, 0, 0);

            end = new Date(now.getFullYear(), 11, 31);
            end.setHours(23, 59, 59, 999);
            break;
        }

        const invoices = await prisma.invoices.findMany({
          where: {
            store_id: Number(id),
            network: Number(network),
            created_at: { gte: start, lte: end },
            status: 1,
            paid: item === STORE_STAT_ITEM_TYPE.DEAL_AMOUNT ? 1 : undefined,
          },
          select: { created_at: true, amount: true },
        });

        let countArray: any, amountArray: any;

        switch (time) {
          case STORE_STAT_TIME_TYPE.WEEK:
            countArray = Array(7).fill(0);
            amountArray = Array(7).fill(0);
            invoices.forEach((invoice) => {
              const date = new Date(invoice.created_at);
              const dayOfWeek = date.getDay() || 7;
              const index = dayOfWeek - 1;
              countArray[index] += 1;
              amountArray[index] += invoice.amount;
            });

            result = { count: countArray, amount: amountArray };
            break;
          case STORE_STAT_TIME_TYPE.MONTH:
            const totalDays = getDaysBetween(start, end);
            const daysPerSlot = totalDays / 30;
            const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());

            countArray = Array(30).fill(0);
            amountArray = Array(30).fill(0);
            invoices.forEach((invoice) => {
              const date = new Date(invoice.created_at);
              const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const daysFromStart = getDaysBetween(startDate, orderDate);
              const slotIndex = Math.floor((daysFromStart - 1) / daysPerSlot);
              if (slotIndex >= 0 && slotIndex < 30) {
                countArray[slotIndex] += 1;
                amountArray[slotIndex] += invoice.amount;
              }
            });

            result = { count: countArray, amount: amountArray };
            break;
          case STORE_STAT_TIME_TYPE.YEAR:
            countArray = Array(12).fill(0);
            amountArray = Array(12).fill(0);
            invoices.forEach((invoice) => {
              const month = new Date(invoice.created_at).getMonth();
              countArray[month] += 1;
              amountArray[month] += invoice.amount;
            });

            result = { count: countArray, amount: amountArray };
            break;
        }

        return res.status(200).json({
          message: '',
          result: true,
          data:
            item === STORE_STAT_ITEM_TYPE.DEAL_AMOUNT
              ? result?.amount
              : item === STORE_STAT_ITEM_TYPE.TRANSACTION_VOLUMN
              ? result?.count
              : null,
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}

function getDaysBetween(start: Date, end: Date): number {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  let days = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days++;
  }
  return days;
}
