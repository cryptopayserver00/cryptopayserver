import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  assertStoreOwnedByUser,
  forbidden,
  rateLimit,
  requireAccountPassword,
  requireAuthUserId,
} from '@/lib/auth'
import { encryptSecret } from '@/lib/crypto/secrets'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'shopify-create', limit: 20, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    if (
      !(await requireAccountPassword(
        req,
        res,
        userId,
        req.body.account_password || req.body.password,
        'Account password required to save Shopify credentials'
      ))
    ) {
      return
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }
    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
    }

    const shopName = req.body.shop_name
    const apiKey = req.body.api_key
    const adminApiAccessToken = req.body.admin_api_access_token

    const shopify_setting = await prisma.shopify_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        shop_name: shopName,
        api_key: encryptSecret(String(apiKey || '')),
        admin_api_access_token: encryptSecret(String(adminApiAccessToken || '')),
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
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
