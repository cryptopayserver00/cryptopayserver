import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
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
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: checkout_setting.id,
            show_payment_confetti: checkout_setting.show_payment_confetti,
            show_sound: checkout_setting.show_sound,
            show_pay_in_wallet_button: checkout_setting.show_pay_in_wallet_button,
            custom_html_title: checkout_setting.custom_html_title,
            language: checkout_setting.language,
            show_detect_language: checkout_setting.show_detect_language,
            support_url: checkout_setting.support_url,
            show_payment_method: checkout_setting.show_payment_method,
            show_redirect_url: checkout_setting.show_redirect_url,
            show_public_receipt_page: checkout_setting.show_public_receipt_page,
            show_payment_list: checkout_setting.show_payment_list,
            show_qrcode_receipt: checkout_setting.show_qrcode_receipt,
            show_header: checkout_setting.show_header,
          },
        });

      // const query = 'SELECT * FROM checkout_settings where store_id = ? and user_id = ? and status = ? ';
      // const values = [storeId, userId, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       show_payment_confetti: row.show_payment_confetti,
      //       show_sound: row.show_sound,
      //       show_pay_in_wallet_button: row.show_pay_in_wallet_button,
      //       custom_html_title: row.custom_html_title,
      //       language: row.language,
      //       show_detect_language: row.show_detect_language,
      //       support_url: row.support_url,
      //       show_payment_method: row.show_payment_method,
      //       show_redirect_url: row.show_redirect_url,
      //       show_public_receipt_page: row.show_public_receipt_page,
      //       show_payment_list: row.show_payment_list,
      //       show_qrcode_receipt: row.show_qrcode_receipt,
      //       show_header: row.show_header,
      //     },
      //   });
      // }

      // return res.status(200).json({ message: 'Something wrong', result: false, data: null });

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
