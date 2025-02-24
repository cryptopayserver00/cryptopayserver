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
        const isSeen = req.query.is_seen;
        const network = req.query.network;

        const notifications = await prisma.notifications.findMany({
          where: {
            is_seen: typeof isSeen === 'number' ? isSeen : 0,
            store_id: typeof storeId === 'number' ? storeId : 0,
            network: typeof network === 'number' ? network : 0,
            status: 1,
          },
        });

        if (!notifications) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: notifications });

      // let findQuery = 'SELECT * FROM notifications where ';
      // let updateValues = [];

      // if (isSeen) {
      //   findQuery += 'is_seen = ? and';
      //   updateValues.push(isSeen);
      // }

      // findQuery += ' store_id = ? and network = ? and status = ?';
      // updateValues.push(storeId, network, 1);
      // const [rows] = await connection.query(findQuery, updateValues);
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
