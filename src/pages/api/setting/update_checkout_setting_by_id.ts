import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;

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

        let updateQuery = 'UPDATE checkout_settings SET ';
        let updateValues = [];
        if (showPaymentConfetti) {
          updateQuery += 'show_payment_confetti = ?,';
          updateValues.push(showPaymentConfetti);
        }
        if (showSound) {
          updateQuery += 'show_sound = ?,';
          updateValues.push(showSound);
        }
        if (showPayInWalletButton) {
          updateQuery += 'show_pay_in_wallet_button = ?,';
          updateValues.push(showPayInWalletButton);
        }
        if (showDetectLanguage) {
          updateQuery += 'show_detect_language = ?,';
          updateValues.push(showDetectLanguage);
        }
        if (language) {
          updateQuery += 'language = ?,';
          updateValues.push(language);
        }
        if (customHtmlTitle) {
          updateQuery += 'custom_html_title = ?,';
          updateValues.push(customHtmlTitle);
        }
        if (supportUrl) {
          updateQuery += 'support_url = ?,';
          updateValues.push(supportUrl);
        }
        if (showPaymentMethod) {
          updateQuery += 'show_payment_method = ?,';
          updateValues.push(showPaymentMethod);
        }
        if (showRedirectUrl) {
          updateQuery += 'show_redirect_url = ?,';
          updateValues.push(showRedirectUrl);
        }
        if (showPublicReceiptPage) {
          updateQuery += 'show_public_receipt_page = ?,';
          updateValues.push(showPublicReceiptPage);
        }
        if (showPaymentList) {
          updateQuery += 'show_payment_list = ?,';
          updateValues.push(showPaymentList);
        }
        if (showQrcodeReceipt) {
          updateQuery += 'show_qrcode_receipt = ?,';
          updateValues.push(showQrcodeReceipt);
        }
        if (showHeader) {
          updateQuery += 'show_header = ?,';
          updateValues.push(showHeader);
        }

        updateQuery = updateQuery.slice(0, -1);

        updateQuery += ' WHERE store_id = ? and user_id = ? and status = ?';
        updateValues.push(storeId, userId, 1);

        await connection.query(updateQuery, updateValues);

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
