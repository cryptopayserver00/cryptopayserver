import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import { NOTIFICATIONS } from 'packages/constants';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const email = req.body.email;
        const username = req.body.email;
        const password = req.body.password;
        const cryptoPassword = CryptoJS.SHA256(password).toString();

        // user
        const query = 'INSERT INTO users (email, username, password, status) VALUES (?, ?, ?, ?)';
        const values = [email, username, cryptoPassword, 1];
        const [ResultSetHeader]: any = await connection.query(query, values);
        const userId = ResultSetHeader.insertId;
        if (userId === 0) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        // notification
        const nQuery = 'INSERT INTO notifications (user_id, notify_id, status) VALUES (?, ?, ?)';
        for (const nKey in NOTIFICATIONS) {
          const nValue = [userId, nKey, 1];
          await connection.query(nQuery, nValue);
        }

        return res.status(200).json({ message: '', result: true, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
