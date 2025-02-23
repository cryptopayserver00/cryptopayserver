import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const email = req.query.email;

        const user = await prisma.users.findFirst({
          where: {
            email: email,
            status: 1,
          },
          select: {
            username: true,
            email: true,
            profile_picture_url: true,
            authenticator: true,
          },
        });

        if (user) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              username: user.username,
              email: user.email,
              profile_picture_url: user.profile_picture_url,
              authenticator: user.authenticator,
            },
          });
        } else {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

      // const query =
      //   'SELECT username, email, profile_picture_url, authenticator FROM users where email = ? and status = ?';
      // const values = [email, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;

      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       username: row.username,
      //       email: row.email,
      //       profile_picture_url: row.profile_picture_url,
      //       authenticator: row.authenticator,
      //     },
      //   });
      // }

      // return res.status(200).json({ message: 'Something wrong', result: false, data: null });

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
