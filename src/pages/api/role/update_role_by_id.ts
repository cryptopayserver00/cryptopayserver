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

        let updateData: { [key: string]: any } = {};

        if (req.body.role !== undefined) updateData.role = req.body.role;
        if (req.body.permissions !== undefined) updateData.permissions = req.body.permissions;

        const role = await prisma.roles.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!role) {
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
