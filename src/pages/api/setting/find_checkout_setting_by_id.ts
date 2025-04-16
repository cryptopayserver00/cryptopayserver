import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const userId = req.query.user_id;

        const checkout_setting = await prisma.checkout_settings.findFirst({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            status: 1,
          },
        });

        if (!checkout_setting) {
          const create_checkout_setting = await prisma.checkout_settings.create({
            data: {
              user_id: Number(userId),
              store_id: Number(storeId),
              show_payment_confetti: 2,
              show_sound: 2,
              show_pay_in_wallet_button: 1,
              show_detect_language: 1,
              language: 'English',
              custom_html_title: '',
              support_url: '',
              show_payment_method: 2,
              show_redirect_url: 2,
              show_public_receipt_page: 1,
              show_payment_list: 1,
              show_qrcode_receipt: 1,
              show_header: 1,
              status: 1,
            },
          });
          return res.status(200).json({ message: '', result: true, data: create_checkout_setting });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: checkout_setting,
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
