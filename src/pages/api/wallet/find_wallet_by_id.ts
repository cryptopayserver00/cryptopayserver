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
        const id = req.query.id;

        const wallet = await prisma.wallets.findFirst({
          where: {
            id: Number(id),
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
            name: wallet.name,
            mnemonic: wallet.mnemonic,
            password: wallet.password,
            is_backup: wallet.is_backup,
          },
        });

      // const query = 'SELECT * FROM wallets where id = ? and status = ? ';
      // const values = [id, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       name: row.name,
      //       mnemonic: row.mnemonic,
      //       password: row.password,
      //       is_backup: row.is_backup,
      //     },
      //   });
      // }

      // return res.status(200).json({ message: '', result: false, data: null });

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
