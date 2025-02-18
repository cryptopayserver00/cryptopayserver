import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const id = req.body.id;

        const label = req.body.label;
        const message = req.body.message;
        const isSeen = req.body.is_seen;

        let updateQuery = 'UPDATE notifications SET ';
        let updateValues = [];
        if (label) {
          updateQuery += 'label = ?,';
          updateValues.push(label);
        }
        if (message) {
          updateQuery += 'message = ?,';
          updateValues.push(message);
        }
        if (isSeen) {
          updateQuery += 'is_seen = ?,';
          updateValues.push(isSeen);
        }

        updateQuery = updateQuery.slice(0, -1);

        updateQuery += ' WHERE id = ? and status = ?';
        updateValues.push(id, 1);

        await connection.query(updateQuery, updateValues);

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
