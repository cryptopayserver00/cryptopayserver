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

        const email_setting = await prisma.email_settings.findFirst({
          where: {
            store_id: Number(storeId),
            user_id: Number(userId),
            status: 1,
          },
        });

        if (email_setting) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: email_setting.id,
              login: email_setting.login,
              password: email_setting.password,
              port: email_setting.port,
              sender_email: email_setting.sender_email,
              show_tls: email_setting.show_tls,
              smtp_server: email_setting.smtp_server,
            },
          });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      // const query = 'SELECT * FROM email_settings where store_id = ? and user_id = ? and status = ? ';
      // const values = [storeId, userId, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       id: row.id,
      //       login: row.login,
      //       password: row.password,
      //       port: row.port,
      //       sender_email: row.sender_email,
      //       show_tls: row.show_tls,
      //       smtp_server: row.smtp_server,
      //     },
      //   });
      // }

      // return res.status(200).json({ message: '', result: false, data: null });

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
