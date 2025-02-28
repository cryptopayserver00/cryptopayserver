import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();

        let findData: { [key: string]: any } = {};

        if (req.body.store_id !== undefined) findData.store_id = Number(req.body.store_id);
        if (req.body.is_seen !== undefined) findData.is_seen = Number(req.body.is_seen);
        if (req.body.network !== undefined) findData.network = Number(req.body.network);
        findData.status = 1;

        const notifications = await prisma.notifications.findMany({
          where: findData,
        });

        if (!notifications) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: notifications });

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
