import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const email = req.body.email;
        const oldPwd = req.body.old_password;
        const newPwd = req.body.new_password;

        const oldCryptoPassword = CryptoJS.SHA256(oldPwd).toString();
        const newCryptoPassword = CryptoJS.SHA256(newPwd).toString();

        const updateQuery = 'UPDATE users SET password = ? WHERE email = ? and password = ? and status = ?';
        const updateValues = [newCryptoPassword, email, oldCryptoPassword, 1];
        const [ResultSetHeader]: any = await connection.query(updateQuery, updateValues);

        if (ResultSetHeader.changedRows === 1) {
          return res.status(200).json({
            message: '',
            result: true,
            data: null,
          });
        } else {
          return res.status(200).json({
            message: 'something wrong',
            result: false,
            data: null,
          });
        }

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
