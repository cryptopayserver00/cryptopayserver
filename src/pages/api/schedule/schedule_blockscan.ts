import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import {
  INVOICE_SOURCE_TYPE,
  NOTIFICATION_TYPE,
  ORDER_STATUS,
  PAYMENT_REQUEST_STATUS,
  PAYOUT_STATUS,
  PULL_PAYMENT_STATUS,
} from 'packages/constants';
import { PrismaClient } from '@prisma/client';
import { BLOCKSCAN } from 'packages/web3/block_scan';
import { WEB3 } from 'packages/web3';
import { WEBHOOK } from 'utils/webhook';
import { EMAIL } from 'utils/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        console.log('Schedule Blockscan');
        const prisma = new PrismaClient();
        const now = new Date();

        const invoices = await prisma.invoices.findMany({
          where: {
            order_status: ORDER_STATUS.Processing,
            status: 1,
          },
        });

        if (!invoices) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        for (const item of invoices) {
          const txs = await BLOCKSCAN.getTransactionsByChainAndAddress(
            WEB3.getChainIds(Number(item.network) === 1 ? true : false, Number(item.chain_id)).toString(),
            item.destination_address,
          );

          if (!txs) {
            continue;
          }

          if (txs.transactions && txs.transactions.length > 0) {
            for (const txItem of txs.transactions) {
              if (
                String(txItem.address).toLowerCase() === String(item.destination_address).toLowerCase() &&
                String(txItem.transact_type) === 'receive' &&
                String(txItem.token) === String(item.crypto) &&
                Number(txItem.amount) === Number(item.crypto_amount) &&
                new Date(txItem.block_timestamp).getTime() > item.created_at.getTime()
              ) {
                // Does db have this hash of invoice
                const same_invoice = await prisma.invoices.findFirst({
                  where: {
                    hash: txItem.hash,
                    status: 1,
                  },
                });

                if (same_invoice) {
                  continue;
                }

                const invoice = await prisma.invoices.update({
                  data: {
                    hash: txItem.hash,
                    from_address: txItem.from_address,
                    to_address: txItem.to_address,
                    order_status: ORDER_STATUS.Settled,
                    block_timestamp: txItem.block_timestamp,
                    paid: 1,
                  },
                  where: {
                    id: item.id,
                    order_status: ORDER_STATUS.Processing,
                    status: 1,
                  },
                });

                if (!invoice) {
                  continue;
                }

                switch (invoice.source_type) {
                  case INVOICE_SOURCE_TYPE.Invoice:
                    const notifyBody = {
                      chain_id: invoice.chain_id,
                      network: invoice.network,
                      order_id: invoice.order_id,
                      currency: invoice.currency,
                      amount: invoice.amount,
                      crypto: invoice.crypto,
                      crypto_amount: invoice.crypto_amount,
                      rate: invoice.rate,
                      from_address: invoice.from_address,
                      to_address: invoice.to_address,
                      hash: invoice.hash,
                      block_timestamp: invoice.block_timestamp,
                      order_status: invoice.order_status,
                    };
                    if (invoice.notification_url && invoice.notification_url !== '') {
                      // notify(webhook) to url
                      await WEBHOOK.sendWebhook(invoice.notification_url, notifyBody);
                    }

                    if (invoice.notification_email && invoice.notification_email !== '') {
                      // notify to email
                      await EMAIL.sendInvoiceEmail(invoice.notification_email, notifyBody);
                    }
                    break;
                  case INVOICE_SOURCE_TYPE.PaymentRequest:
                    const find_payment_request = await prisma.payment_requests.findFirst({
                      where: {
                        payment_request_id: invoice.external_payment_id,
                        payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
                        status: 1,
                      },
                      select: {
                        amount: true,
                      },
                    });
                    if (!find_payment_request) {
                      continue;
                    }

                    const find_payment_request_invoice = await prisma.invoices.findMany({
                      where: {
                        source_type: INVOICE_SOURCE_TYPE.PaymentRequest,
                        external_payment_id: invoice.external_payment_id,
                        order_status: ORDER_STATUS.Settled,
                        status: 1,
                      },
                      select: {
                        amount: true,
                      },
                    });

                    const settledAmount = find_payment_request_invoice.reduce(
                      (sum, invoice) => sum + invoice.amount,
                      0,
                    );

                    if (settledAmount >= find_payment_request.amount) {
                      const update_payment_request = await prisma.payment_requests.update({
                        data: {
                          payment_request_status: PAYMENT_REQUEST_STATUS.Settled,
                        },
                        where: {
                          payment_request_id: invoice.external_payment_id,
                          payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
                          status: 1,
                        },
                      });
                      if (!update_payment_request) {
                        continue;
                      }
                    }

                    break;
                  case INVOICE_SOURCE_TYPE.Payout:
                    const update_payout = await prisma.payouts.update({
                      data: {
                        payout_status: PAYOUT_STATUS.Completed,
                      },
                      where: {
                        payout_id: invoice.external_payment_id,
                        payout_status: PAYOUT_STATUS.InProgress,
                        status: 1,
                      },
                    });
                    if (!update_payout) {
                      continue;
                    }
                    break;
                  case INVOICE_SOURCE_TYPE.PullPayment:
                    break;
                  case INVOICE_SOURCE_TYPE.Sales:
                    break;
                  case INVOICE_SOURCE_TYPE.Wallets:
                    break;
                }

                const invoice_events = await prisma.invoice_events.createMany({
                  data: [
                    {
                      invoice_id: item.id,
                      order_id: item.order_id,
                      message: `Monitor the transaction hash: ${txItem.hash}`,
                      status: 1,
                    },
                    {
                      invoice_id: item.id,
                      order_id: item.order_id,
                      message: `Invoice status is Settled`,
                      status: 1,
                    },
                  ],
                });

                if (!invoice_events) {
                  continue;
                }

                // create settled notification
                const notification = await prisma.notifications.create({
                  data: {
                    user_id: Number(item.user_id),
                    store_id: item.store_id,
                    network: item.network,
                    label: NOTIFICATION_TYPE.Invoice,
                    message: `You have a transaction completed: ${item.order_id}`,
                    url: `/payments/invoices/${item.order_id}`,
                    is_seen: 2,
                    status: 1,
                  },
                });

                if (!notification) {
                  continue;
                }

                break;
              }
            }
          }
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
