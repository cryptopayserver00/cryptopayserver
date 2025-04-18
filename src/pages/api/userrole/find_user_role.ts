import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { USER_ROLE } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const userId = req.query.user_id;

        const userRoles = await prisma.user_roles.findMany({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            status: 1,
          },
        });

        if (userRoles.length === 0) {
          // create default user role
          const user = await prisma.users.findFirst({
            where: {
              id: Number(userId),
            },
          });

          if (!user) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          const default_user_roles = await prisma.user_roles.createMany({
            data: [
              {
                user_id: Number(userId),
                store_id: Number(storeId),
                email: user.email,
                role: USER_ROLE.Owner,
                status: 1,
              },
            ],
          });

          if (!default_user_roles) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          return res.status(200).json({ message: '', result: true, data: default_user_roles });
        }

        return res.status(200).json({ message: '', result: true, data: userRoles });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
