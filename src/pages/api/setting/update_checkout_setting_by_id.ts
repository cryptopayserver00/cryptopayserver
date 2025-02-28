import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.show_payment_confetti !== undefined)
          updateData.show_payment_confetti = Number(req.body.show_payment_confetti);
        if (req.body.show_sound !== undefined) updateData.show_sound = Number(req.body.show_sound);
        if (req.body.show_pay_in_wallet_button !== undefined)
          updateData.show_pay_in_wallet_button = Number(req.body.show_pay_in_wallet_button);
        if (req.body.show_detect_language !== undefined)
          updateData.show_detect_language = Number(req.body.show_detect_language);
        if (req.body.language !== undefined) updateData.language = req.body.language;
        if (req.body.custom_html_title !== undefined) updateData.custom_html_title = req.body.custom_html_title;
        if (req.body.support_url !== undefined) updateData.support_url = req.body.support_url;
        if (req.body.show_payment_method !== undefined)
          updateData.show_payment_method = Number(req.body.show_payment_method);
        if (req.body.show_redirect_url !== undefined) updateData.show_redirect_url = Number(req.body.show_redirect_url);
        if (req.body.show_public_receipt_page !== undefined)
          updateData.show_public_receipt_page = Number(req.body.show_public_receipt_page);
        if (req.body.show_payment_list !== undefined) updateData.show_payment_list = Number(req.body.show_payment_list);
        if (req.body.show_qrcode_receipt !== undefined)
          updateData.show_qrcode_receipt = Number(req.body.show_qrcode_receipt);
        if (req.body.show_header !== undefined) updateData.show_header = Number(req.body.show_header);

        const checkout_setting = await prisma.checkout_settings.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!checkout_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
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
