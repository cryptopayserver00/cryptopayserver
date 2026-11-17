import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireAuthUserId, assertStoreOwnedByUser, forbidden } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_shopify_setting', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
    }

    const shopify_setting = await prisma.shopify_settings.findFirst({
      where: {
        store_id: storeId,
        user_id: userId,
        status: 1,
      },
    })

    if (!shopify_setting) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: shopify_setting.id,
        shopName: shopify_setting.shop_name,
        // Never return Shopify secrets — leave blank unless the user re-enters them.
        apiKey: '',
        adminApiAccessToken: '',
        hasApiKey: Boolean(shopify_setting.api_key),
        hasAdminApiAccessToken: Boolean(shopify_setting.admin_api_access_token),
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
