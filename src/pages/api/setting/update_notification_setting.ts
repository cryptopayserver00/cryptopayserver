import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        // const userId = req.body.user_id;
        // const storeId = req.body.store_id;
        const id = req.body.id;
        const notifications = req.body.notifications;

        const notification_setting = await prisma.notification_settings.update({
          data: {
            notifications: notifications,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!notification_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      // const query =
      //   'UPDATE notification_settings set notifications = ? where user_id = ? and store_id = ? and status = ?';
      // const values = [notifications, userId, storeId, 1];
      // await connection.query(query, values);
      // return res.status(200).json({ message: '', result: true, data: null });
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
