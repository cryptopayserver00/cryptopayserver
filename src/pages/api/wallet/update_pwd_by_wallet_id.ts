import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import mysql from 'mysql2/promise';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const walletId = req.body.wallet_id;
        const storeId = req.body.store_id;
        const password = req.body.password;
        const cryptoPassword = CryptoJS.SHA256(password).toString();

        const query = 'UPDATE wallets set password = ? where id = ? and user_id = ? and store_id = ? and status = 1';
        const values = [cryptoPassword, walletId, userId, storeId];
        await connection.query(query, values);

        const selectQuery = 'SELECT * FROM wallets where id = ? and status = ? ';
        const selectValues = [walletId, 1];
        const [rows] = await connection.query(selectQuery, selectValues);
        if (Array.isArray(rows) && rows.length > 0) {
          const row = rows[0] as mysql.RowDataPacket;
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              is_backup: row.is_backup,
            },
          });
        }
        return res.status(200).json({
          message: '',
          result: true,
          data: {
            is_backup: 2,
          },
        });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
