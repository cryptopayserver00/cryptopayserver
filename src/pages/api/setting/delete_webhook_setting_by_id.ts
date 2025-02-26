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
        const id = req.body.id;

        const webhook_setting = await prisma.webhook_settings.update({
          data: {
            status: 2,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (webhook_setting) {
          return res.status(200).json({
            message: '',
            result: true,
            data: null,
          });
        } else {
          return res.status(200).json({
            message: '',
            result: false,
            data: null,
          });
        }

      // const updateQuery = 'UPDATE webhook_settings SET status = ? WHERE id = ? and status = ?';
      // const updateValues = [2, id, 1];

      // await connection.query(updateQuery, updateValues);

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: null,
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
