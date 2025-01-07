import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';

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
          'SELECT id, address, chain_id, note FROM addresses where user_id = ? and wallet_id = ? and network = ? and status = ?';
        const values = [userId, walletId, network, 1];
        const [rows] = await connection.query(query, values);

        let newRows: any[] = [];
        if (Array.isArray(rows) && rows.length > 0) {
          const promises = rows.map(async (item: any) => {
            return {
              id: item.id,
              address: item.address,
              note: item.note,
              chain_id: item.chain_id,
              balance: await WEB3.getAssetBalance(
                parseInt(network as string) === 1 ? true : false,
                item.chain_id,
                item.address,
              )
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
