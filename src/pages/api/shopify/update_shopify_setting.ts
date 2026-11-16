import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireAuth, forbidden } from '@/lib/auth'
import { encryptSecret } from '@/lib/crypto/secrets'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.shopify_settings.findFirst({
      where: { id: Number(id), user_id: session.userId, status: 1 },
      select: { id: true },
    })
    if (!owned) {
      return forbidden(res)
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.shop_name) updateData.shop_name = req.body.shop_name

    const apiKey = String(req.body.api_key || '')
    if (apiKey && !apiKey.startsWith('•')) {
      updateData.api_key = encryptSecret(apiKey)
    }

    const adminToken = String(req.body.admin_api_access_token || '')
    if (adminToken && !adminToken.startsWith('•')) {
      updateData.admin_api_access_token = encryptSecret(adminToken)
    }

    await prisma.shopify_settings.update({
      data: updateData,
      where: {
        id: owned.id,
        user_id: session.userId,
        status: 1,
      },
    })

    return res.status(200).json({ message: '', result: true, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
