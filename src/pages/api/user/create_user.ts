import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import { NOTIFICATION, NOTIFICATIONS } from 'packages/constants';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const email = req.body.email;
        const username = req.body.email;
        const password = req.body.password;
        const cryptoPassword = CryptoJS.SHA256(password).toString();

        const createUser = await prisma.users.create({
          data: {
            email: email,
            username: username,
            password: cryptoPassword,
            profile_picture_url: '',
            authenticator: '',
            status: 1,
          },
        });

        if (createUser) {
          return res.status(200).json({ message: '', result: true, data: null });
        } else {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

      // user
      // const query = 'INSERT INTO users (email, username, password, status) VALUES (?, ?, ?, ?)';
      // const values = [email, username, cryptoPassword, 1];
      // const [ResultSetHeader]: any = await connection.query(query, values);
      // const userId = ResultSetHeader.insertId;
      // if (userId === 0) {
      //   return res.status(200).json({ message: 'Something wrong', result: false, data: null });
      // }

      // return res.status(200).json({ message: '', result: true, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
