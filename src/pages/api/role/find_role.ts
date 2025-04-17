import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_USER_ROLE_PERMISSIONS, USER_ROLE } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const userId = req.query.user_id;

        const roles = await prisma.roles.findMany({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            status: 1,
          },
        });

        if (roles.length === 0) {
          // create default role
          const default_roles = await prisma.roles.createMany({
            data: [
              {
                user_id: Number(userId),
                store_id: Number(storeId),
                role: USER_ROLE.Owner,
                permissions: DEFAULT_USER_ROLE_PERMISSIONS.Owner,
                status: 1,
              },
              {
                user_id: Number(userId),
                store_id: Number(storeId),
                role: USER_ROLE.Manager,
                permissions: DEFAULT_USER_ROLE_PERMISSIONS.Manager,
                status: 1,
              },
              {
                user_id: Number(userId),
                store_id: Number(storeId),
                role: USER_ROLE.Employee,
                permissions: DEFAULT_USER_ROLE_PERMISSIONS.Employee,
                status: 1,
              },
              {
                user_id: Number(userId),
                store_id: Number(storeId),
                role: USER_ROLE.Guest,
                permissions: DEFAULT_USER_ROLE_PERMISSIONS.Guest,
                status: 1,
              },
            ],
          });

          if (!default_roles) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          return res.status(200).json({ message: '', result: true, data: default_roles });
        }

        return res.status(200).json({ message: '', result: true, data: roles });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
