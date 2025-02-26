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
        const email = req.body.email;

        const status = 2; // delete

        const update_user = await prisma.users.update({
          where: {
            email: email,
            status: 1,
          },
          data: {
            status: status,
          },
        });

        if (!update_user) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      // const updateQuery = 'UPDATE users SET status = ? WHERE email = ?';
      // const updateValues = [status, email];
      // await connection.query(updateQuery, updateValues);

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
