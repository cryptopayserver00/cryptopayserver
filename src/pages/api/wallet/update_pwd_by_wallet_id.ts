import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const walletId = req.body.wallet_id;
        const password = req.body.password;
        const cryptoPassword = password ? CryptoJS.SHA256(password).toString() : password;

        const wallet = await prisma.wallets.update({
          data: {
            password: cryptoPassword,
          },
          where: {
            id: walletId,
            status: 1,
          },
        });

        if (!wallet) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            is_backup: wallet.is_backup,
          },
        });

      // const query = 'UPDATE wallets set password = ? where id = ? and status = ?';
      // const values = [cryptoPassword, walletId, 1];
      // await connection.query(query, values);

      // const selectQuery = 'SELECT * FROM wallets where id = ? and status = ? ';
      // const selectValues = [walletId, 1];
      // const [rows] = await connection.query(selectQuery, selectValues);

      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       is_backup: row.is_backup,
      //     },
      //   });
      // }
      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: {
      //     is_backup: 2,
      //   },
      // });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
