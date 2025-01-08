import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const storeId = req.query.store_id;
        const network = req.query.network;

        const query = 'SELECT id FROM wallets where store_id = ? and status = ? limit 1';
        const values = [storeId, 1];
        const [rows] = await connection.query(query, values);

        if (Array.isArray(rows) && rows.length === 1) {
          const row: any = rows[0];
          const walletId = row.id;

          const txQuery =
            'SELECT node_own_transactions.*, addresses.chain_id FROM addresses JOIN node_own_transactions ON addresses.address = node_own_transactions.address WHERE addresses.wallet_id = ? AND addresses.network = ? AND addresses.status = ? AND node_own_transactions.status = ? ORDER BY node_own_transactions.block_timestamp DESC';
          const txValues = [walletId, network, 1, 1];
          const [txRows] = await connection.query(txQuery, txValues);

          return res.status(200).json({ message: '', result: true, data: txRows });
        }

        return res.status(200).json({ message: '', result: true, data: [] });
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
