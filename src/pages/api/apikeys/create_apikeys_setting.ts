import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;

        const label = req.body.label;
        const permissions = req.body.permissions;
        const key = randomUUID().toString();

        const apiKey = await prisma.api_key_settings.create({
          data: {
            user_id: userId,
            store_id: storeId,
            label: label,
            api_key: key,
            permissions: permissions,
            status: 1,
          },
        });

        if (apiKey) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: apiKey.id,
            },
          });
        } else {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

      // const createQuery =
      //   'INSERT INTO api_key_settings (user_id, store_id, label, api_key, permissions, status) VALUES (?, ?, ?, ?, ?, ?)';
      // const createValues = [userId, storeId, label, apiKey, permissions, 1];
      // const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
      // const id = ResultSetHeader.insertId;
      // if (id === 0) {
      //   return res.status(200).json({ message: 'Something wrong', result: false, data: null });
      // }

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: {
      //     id: id,
      //   },
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
