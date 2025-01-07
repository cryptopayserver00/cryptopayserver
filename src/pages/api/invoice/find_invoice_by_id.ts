import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '.';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const id = req.query.id;

        const query =
          'SELECT invoices.*, node_own_transactions.hash, node_own_transactions.address, node_own_transactions.from_address, node_own_transactions.to_address, node_own_transactions.transact_type, node_own_transactions.block_timestamp FROM invoices LEFT JOIN node_own_transactions ON invoices.match_tx_id = node_own_transactions.id WHERE invoices.order_id = ? and invoices.status = ?';
        const values = [id, 1];
        const [rows] = await connection.query(query, values);
        return res.status(200).json({ message: '', result: true, data: rows });
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
