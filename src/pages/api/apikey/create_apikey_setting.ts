import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  requireAuthUserId,
  assertStoreOwnedByUser,
  forbidden,
  generateApiKey,
  rateLimit,
  requireAccountPassword,
  sealApiKey,
} from '@/lib/auth'
import { APIKEYPERMISSIONS } from '@/packages/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'create-apikey', limit: 20, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    if (
      !(await requireAccountPassword(
        req,
        res,
        userId,
        req.body.account_password || req.body.password,
        'Account password required to create API key'
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

    const label = req.body.label
    const permissionsRaw = String(req.body.permissions || '')
    const allowedIds = new Set(APIKEYPERMISSIONS.map((p) => String(p.id)))
    const permissionIds = permissionsRaw
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p && allowedIds.has(p))
    if (permissionIds.length === 0) {
      return res.status(200).json({ message: 'Invalid permissions', result: false, data: null })
    }
    const permissions = permissionIds.join(',')
    const plaintext = generateApiKey()

    const apiKey = await prisma.api_key_settings.create({
      data: {
        user_id: userId,
        store_id: storeId,
        label: label,
        api_key: sealApiKey(plaintext),
        permissions: permissions,
        status: 1,
      },
    })

    // Plaintext is returned once — client must store it; list API only shows a hint.
    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: apiKey.id,
        apiKey: plaintext,
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
