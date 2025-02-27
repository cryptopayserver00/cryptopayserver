import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { ORDER_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        console.log('Schduler Task: Checkout status of order');
        const prisma = new PrismaClient();
        const now = new Date();

        const invoices = await prisma.invoices.findMany({
          where: {
            order_status: ORDER_STATUS.Processing,
            status: 1,
          },
        });

        if (!invoices) {
          return res.status(200).json({ message: '', result: true, data: null });
        }

        invoices.forEach(async (item) => {
          const remainingTime = item.expiration_at.getTime() - now.getTime();
          if (remainingTime <= 0) {
            const invoice = await prisma.invoices.update({
              data: {
                order_status: ORDER_STATUS.Expired,
              },
              where: {
                id: item.id,
                status: 1,
              },
            });

            if (invoice) {
              let invoice_events = await prisma.invoice_events.createMany({
                data: [
                  {
                    invoice_id: item.id,
                    order_id: item.order_id,
                    message: `Invoice status is Expired`,
                    created_at: now,
                    status: 1,
                  },
                  {
                    invoice_id: item.id,
                    order_id: item.order_id,
                    message: `Invoice ${item.order_id} new event: invoice_expired`,
                    created_at: now,
                    status: 1,
                  },
                  {
                    invoice_id: item.id,
                    order_id: item.order_id,
                    message: `Invoice ${item.order_id} is not monitored anymore.`,
                    created_at: now,
                    status: 1,
                  },
                ],
              });

              if (!invoice_events) {
                return res.status(200).json({ message: '', result: false, data: null });
              }
            }
          }
        });

        return res.status(200).json({ message: '', result: true, data: null });

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
