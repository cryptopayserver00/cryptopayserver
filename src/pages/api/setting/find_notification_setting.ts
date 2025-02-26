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
        const userId = req.query.user_id;
        const storeId = req.query.store_id;

        const notification_setting = await prisma.notification_settings.findFirst({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            status: 1,
          },
        });

        if (!notification_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: notification_setting.id,
            notifications: notification_setting.notifications,
          },
        });

      // const query = 'SELECT * FROM notification_settings where user_id = ? and store_id = ? and status = ?';
      // const values = [userId, storeId, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       notifications: row.notifications,
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
