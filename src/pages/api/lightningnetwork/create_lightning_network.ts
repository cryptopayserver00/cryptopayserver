import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PAYMENT_REQUEST_STATUS } from 'packages/constants';
import { GenerateOrderIDByTime } from 'utils/number';
import { PrismaClient } from '@prisma/client';
import { LIGHTNING } from 'packages/lightning';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const network = req.body.network;
        const text = req.query.text;

        if (!text) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const values: Record<string, string> = {};
        String(text)
          .split(';')
          .forEach((line) => {
            const [key, value] = line.split('=');
            if (key && value) {
              values[key] = value;
            }
          });

        if (!values || !values['type'] || !values['server']) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const type = values['type'].toUpperCase();
        const server = values['server'];

        const [isAuthorized, data] = await LIGHTNING.testConnection(type as LIGHTNINGNAME, server);
        if (!isAuthorized) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        switch (type) {
          case LIGHTNINGNAME.LNDHUB:
            // const response = await prisma.wallet_coin_enables
            break;
          default:
            return res.status(200).json({ message: '', result: false, data: null });
        }

        // const payment_request = await prisma.wallet_coin_enables.create({
        //   data: {
        //     user_id: userId,
        //     store_id: storeId,
        //     network: network,
        //     payment_request_id: paymentRequestId,
        //     title: title,
        //     amount: Number(amount),
        //     currency: currency,
        //     show_allow_custom_amount: showAllowCustomAmount,
        //     email: email,
        //     request_customer_data: requestCustomerData,
        //     memo: memo,
        //     payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
        //     expiration_at: new Date(expirationDate),
        //     status: 1,
        //   },
        // });

        // if (!payment_request) {
        //   return res.status(200).json({ message: '', result: false, data: null });
        // }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            // id: payment_request.id,
          },
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
