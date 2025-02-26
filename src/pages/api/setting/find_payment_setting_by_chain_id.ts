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
        const userId = req.query.user_id;
        const storeId = req.query.store_id;
        const chainId = req.query.chain_id;
        const network = req.query.network;

        const payment_setting = await prisma.payment_settings.findFirst({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            chain_id: Number(chainId),
            network: Number(network),
            status: 1,
          },
        });

        if (payment_setting) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: payment_setting.id,
              payment_expire: payment_setting.payment_expire,
              confirm_block: payment_setting.confirm_block,
              show_recommended_fee: payment_setting.show_recommended_fee,
              current_used_address_id: payment_setting.current_used_address_id,
            },
          });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      // const query =
      //   'SELECT id, payment_expire, confirm_block, show_recommended_fee, current_used_address_id FROM payment_settings where user_id = ? and store_id = ? and chain_id = ? and network = ? and status = ?';
      // const values = [userId, storeId, chainId, network, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       id: row.id,
      //       payment_expire: row.payment_expire,
      //       confirm_block: row.confirm_block,
      //       show_recommended_fee: row.show_recommended_fee,
      //       current_used_address_id: row.current_used_address_id,
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
