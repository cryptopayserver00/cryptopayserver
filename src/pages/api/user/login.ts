import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';
import { NOTIFICATION_TYPE } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const email = req.body.email;
        const password = req.body.password;
        const cryptoPassword = CryptoJS.SHA256(password).toString();

        const user = await prisma.users.findFirst({
          where: {
            email: email,
            password: cryptoPassword,
            status: 1,
          },
        });

        if (!user) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const stores = await prisma.stores.findMany({
          where: {
            user_id: user.id,
            status: 1,
          },
        });

        if (stores && stores.length > 0) {
          const message = `You have a new login: ${new Date().toLocaleString()}`;
          const notifications = await prisma.notifications.createMany({
            data: [
              {
                user_id: user.id,
                store_id: stores[0].id,
                network: 1,
                label: NOTIFICATION_TYPE.UserUpdates,
                message: message,
                url: '',
                is_seen: 2,
                status: 1,
              },
              {
                user_id: user.id,
                store_id: stores[0].id,
                network: 2,
                label: NOTIFICATION_TYPE.UserUpdates,
                message: message,
                url: '',
                is_seen: 2,
                status: 1,
              },
            ],
          });

          if (!notifications) {
            return res.status(200).json({ message: '', result: false, data: null });
          }
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: user?.id,
            email: user?.email,
            username: user?.username,
          },
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
