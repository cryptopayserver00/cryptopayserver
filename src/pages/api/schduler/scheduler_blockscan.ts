import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { ORDER_STATUS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
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
          const node_own_transactions = await prisma.node_own_transactions.findFirst({
            where: {
              address: item.destination_address,
              transact_type: 'receive',
              token: item.crypto,
              amount: item.crypto_amount.toString(),
              block_timestamp: {
                gte: item.created_at.getTime(),
              },
              status: 1,
            },
          });

          if (node_own_transactions) {
            const invoice = await prisma.invoices.update({
              data: {
                order_status: ORDER_STATUS.Settled,
                paid: 1,
                match_tx_id: node_own_transactions.id,
              },
              where: {
                id: item.id,
                order_status: ORDER_STATUS.Processing,
                status: 1,
              },
            });

            if (invoice) {
              let invoice_events = await prisma.invoice_events.createMany({
                data: [
                  {
                    invoice_id: item.id,
                    order_id: item.order_id,
                    message: `Monitor the transaction hash: ${node_own_transactions.hash}`,
                    created_at: now,
                    status: 1,
                  },
                  {
                    invoice_id: item.id,
                    order_id: item.order_id,
                    message: `Invoice status is Settled`,
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

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
