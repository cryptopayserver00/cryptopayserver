import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '.';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const network = req.body.network;

        const label = req.body.label;
        const message = req.body.message;
        const url = req.body.url;
        const isSeen = 2;
        const date = new Date().getTime();

        const createQuery =
          'INSERT INTO notifications (user_id, store_id, network, label, message, url, is_seen, created_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const createValues = [userId, storeId, network, label, message, url, isSeen, date, 1];
        const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
        const id = ResultSetHeader.insertId;
        if (id === 0) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: id,
          },
        });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
