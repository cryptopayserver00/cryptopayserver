import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const walletId = req.body.wallet_id;
        const name = req.body.name;

        const query = 'UPDATE wallets set name = ? where id = ? and status = ?';
        const values = [name, walletId, 1];
        await connection.query(query, values);
        return res.status(200).json({ message: '', result: true, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
