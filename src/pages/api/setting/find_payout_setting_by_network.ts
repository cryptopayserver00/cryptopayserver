import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const storeId = req.query.store_id;
        const userId = req.query.user_id;
        const network = req.query.network;
        const chainId = req.query.chain_id;

        const query =
          'SELECT * FROM payout_settings where store_id = ? and user_id = ? and network = ? and chain_id = ? and status = ? ';
        const values = [storeId, userId, network, chainId, 1];
        const [rows] = await connection.query(query, values);
        if (Array.isArray(rows) && rows.length === 1) {
          const row = rows[0] as mysql.RowDataPacket;

          return res.status(200).json({
            message: '',
            result: true,
            data: {
              chain_id: row.chain_id,
              show_approve_payout_process: row.show_approve_payout_process,
              interval: row.interval,
              fee_block_target: row.fee_block_target,
              threshold: row.threshold,
            },
          });
        }

        return res.status(200).json({ message: 'Something wrong', result: false, data: null });

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
