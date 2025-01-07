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
        const walletId = req.query.wallet_id;
        const network = req.query.network;

        const query =
          'SELECT id, address, note, network, chain_id FROM addresses where user_id = ? and wallet_id = ? and network = ? and status = 1';
        const values = [userId, walletId, network];
        const [rows] = await connection.query(query, values);

        let newRows: any[] = [];
        if (Array.isArray(rows) && rows.length > 0) {
          const promises = rows.map(async (item: any) => {
            return {
              id: item.id,
              address: item.address,
              note: item.note,
              chain_id: item.chain_id,
            };
          });
          newRows = await Promise.all(promises);

          return res.status(200).json({ message: '', result: true, data: newRows });
        }

        return res.status(200).json({ message: '', result: true, data: null });
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
