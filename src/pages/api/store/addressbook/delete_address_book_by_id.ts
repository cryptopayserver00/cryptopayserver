import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from 'pages/api';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const id = req.body.id;

        const address_book = await prisma.address_books.update({
          data: {
            status: 2,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (address_book) {
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

      // const updateQuery = 'UPDATE address_books SET status = ? WHERE id = ? and status = ?';
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
