import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const shopName = req.body.shop_name
    const apiKey = req.body.api_key
    const adminApiAccessToken = req.body.admin_api_access_token

    const shopify_setting = await prisma.shopify_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        shop_name: shopName,
        api_key: apiKey,
        admin_api_access_token: adminApiAccessToken,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: shopify_setting.id,
      },
    })

    // const createQuery =
    //   'INSERT INTO shopify_settings (user_id, store_id, shop_name, api_key, admin_api_access_token, status) VALUES (?, ?, ?, ?, ?, ?)';
    // const createValues = [userId, storeId, shopName, apiKey, adminApiAccessToken, 1];
    // const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
    // const id = ResultSetHeader.insertId;
    // if (id === 0) {
    //   return res.status(200).json({ message: '', result: false, data: null });
    // }

    // return res.status(200).json({
    //   message: '',
    //   result: true,
    //   data: {
    //     id: id,
    //   },
    // });
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
