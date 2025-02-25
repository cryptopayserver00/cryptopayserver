import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
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

        const shopName = req.body.shop_name;
        const apiKey = req.body.api_key;
        const adminApiAccessToken = req.body.admin_api_access_token;

        const shopify_setting = await prisma.shopify_settings.create({
          data: {
            user_id: userId,
            store_id: storeId,
            shop_name: shopName,
            api_key: apiKey,
            admin_api_access_token: adminApiAccessToken,
            status: 1,
          },
        });

        if (shopify_setting) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: shopify_setting.id,
            },
          });
        } else {
          return res.status(200).json({
            message: 'something wrong',
            result: false,
            data: null,
          });
        }

      // const createQuery =
      //   'INSERT INTO shopify_settings (user_id, store_id, shop_name, api_key, admin_api_access_token, status) VALUES (?, ?, ?, ?, ?, ?)';
      // const createValues = [userId, storeId, shopName, apiKey, adminApiAccessToken, 1];
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
