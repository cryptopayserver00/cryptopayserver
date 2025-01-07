import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const walletId = req.body.wallet_id;
        const storeId = req.body.store_id;

        const query = 'UPDATE wallets set is_backup = ? where id = ? and user_id = ? and store_id = ? and status = 1';
        const values = [1, walletId, userId, storeId];
        await connection.query(query, values);
        return res.status(200).json({ message: '', result: true, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
