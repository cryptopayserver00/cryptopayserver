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
        const userId = req.query.user_id;

        const stores = await prisma.stores.findMany({
          where: {
            user_id: typeof userId === 'number' ? userId : 0,
            status: 1,
          },
        });

        if (stores) {
          return res.status(200).json({ message: '', result: true, data: stores });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      // const query = 'SELECT * FROM stores where user_id = ? and status = ? ';
      // const values = [userId, 1];
      // const [rows] = await connection.query(query, values);
      // return res.status(200).json({ message: '', result: true, data: rows });
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
