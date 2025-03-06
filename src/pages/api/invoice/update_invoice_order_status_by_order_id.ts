import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { ORDER_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const orderId = req.body.order_id;
        const orderStatus = req.body.order_status;

        if (orderStatus === ORDER_STATUS.Invalid) {
          const invoice = await prisma.invoices.update({
            where: {
              order_id: Number(orderId),
              order_status: {
                not: orderStatus,
              },
              status: 1,
            },
            data: {
              order_status: orderStatus,
            },
          });

          if (!invoice) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          let invoiceEventMessage = `Invoice ${orderId} new event: invoice_invalid`;

          const invoice_event = await prisma.invoice_events.create({
            data: {
              invoice_id: invoice.id,
              order_id: invoice.order_id,
              message: invoiceEventMessage,
              status: 1,
            },
          });

          if (invoice_event) {
            return res.status(200).json({ message: '', result: true, data: null });
          }
        }

        return res.status(200).json({ message: '', result: false, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
