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

        const showPaymentConfetti = req.body.show_payment_confetti;
        const showSound = req.body.show_sound;
        const showPayInWalletButton = req.body.show_pay_in_wallet_button;
        const showDetectLanguage = req.body.show_detect_language;
        const language = req.body.language;
        const customHtmlTitle = req.body.custom_html_title;
        const supportUrl = req.body.support_url;
        const showPaymentMethod = req.body.show_payment_method;
        const showRedirectUrl = req.body.show_redirect_url;
        const showPublicReceiptPage = req.body.show_public_receipt_page;
        const showPaymentList = req.body.show_payment_list;
        const showQrcodeReceipt = req.body.show_qrcode_receipt;
        const showHeader = req.body.show_header;

        const checkout_setting = await prisma.checkout_settings.update({
          data: {
            show_payment_confetti: showPaymentConfetti,
            show_sound: showSound,
            show_pay_in_wallet_button: showPayInWalletButton,
            show_detect_language: showDetectLanguage,
            language: language,
            custom_html_title: customHtmlTitle,
            support_url: supportUrl,
            show_payment_method: showPaymentMethod,
            show_redirect_url: showRedirectUrl,
            show_public_receipt_page: showPublicReceiptPage,
            show_payment_list: showPaymentList,
            show_qrcode_receipt: showQrcodeReceipt,
            show_header: showHeader,
          },
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
