import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const userId = req.query.user_id;
        const storeId = req.query.store_id;
        const chainId = req.query.chain_id;
        const network = req.query.network

        const query =
          'SELECT id, payment_expire, confirm_block, show_recommended_fee, current_used_address_id FROM payment_settings where user_id = ? and store_id = ? and chain_id = ? and network = ?';
        const values = [userId, storeId, chainId, network];
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
