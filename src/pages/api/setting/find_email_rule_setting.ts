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

        const email_rule_setting = await prisma.email_rule_settings.findFirst({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            status: 1,
          },
        });

        if (email_rule_setting) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: email_rule_setting.id,
              tigger: email_rule_setting.tigger,
              recipients: email_rule_setting.recipients,
              show_send_to_buyer: email_rule_setting.show_send_to_buyer,
              subject: email_rule_setting.subject,
              body: email_rule_setting.body,
            },
          });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      // const query = 'SELECT * FROM email_rule_settings where store_id = ? and user_id = ? and status = ? ';
      // const values = [storeId, userId, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       id: row.id,
      //       tigger: row.tigger,
      //       recipients: row.recipients,
      //       show_send_to_buyer: row.show_send_to_buyer,
      //       subject: row.subject,
      //       body: row.body,
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
