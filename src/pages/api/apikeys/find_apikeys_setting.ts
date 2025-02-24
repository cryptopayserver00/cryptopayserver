import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
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

        const apiKeys = await prisma.api_key_settings.findMany({
          where: {
            store_id: typeof storeId === 'number' ? storeId : 0,
            user_id: typeof userId === 'number' ? userId : 0,
            status: 1,
          },
        });

        if (apiKeys) {
          return res.status(200).json({ message: '', result: true, data: apiKeys });
        } else {
          return res.status(200).json({ message: '', result: false, data: null });
        }

      // const query = 'SELECT * FROM api_key_settings where store_id = ? and user_id = ? and status = ? ';
      // const values = [storeId, userId, 1];
      // const [rows] = await connection.query(query, values);
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
