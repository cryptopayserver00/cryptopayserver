import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.shop_name !== undefined) updateData.shop_name = req.body.shop_name;
        if (req.body.api_key !== undefined) updateData.api_key = req.body.api_key;
        if (req.body.admin_api_access_token !== undefined)
          updateData.admin_api_access_token = req.body.admin_api_access_token;

        const shopify_setting = await prisma.shopify_settings.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!shopify_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
