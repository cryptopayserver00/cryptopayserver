import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const id = req.body.id;
        const shopName = req.body.shop_name;
        const apiKey = req.body.api_key;
        const adminApiAccessToken = req.body.admin_api_access_token;

        const shopify_setting = await prisma.shopify_settings.update({
          data: {
            shop_name: shopName,
            api_key: apiKey,
            admin_api_access_token: adminApiAccessToken,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!shopify_setting) {
          return res.status(200).json({
            message: '',
            result: false,
            data: null,
          });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });

      // let updateQuery = 'UPDATE shopify_settings SET ';
      // let updateValues = [];
      // if (shopName) {
      //   updateQuery += 'shop_name = ?,';
      //   updateValues.push(shopName);
      // }
      // if (apiKey) {
      //   updateQuery += 'api_key = ?,';
      //   updateValues.push(apiKey);
      // }
      // if (adminApiAccessToken) {
      //   updateQuery += 'admin_api_access_token = ?,';
      //   updateValues.push(adminApiAccessToken);
      // }

      // updateQuery = updateQuery.slice(0, -1);

      // updateQuery += ' WHERE id = ? and status = ?';
      // updateValues.push(id, 1);

      // await connection.query(updateQuery, updateValues);

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: null,
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
