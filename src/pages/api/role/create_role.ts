import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireAuthUserId, assertStoreOwnedByUser, forbidden } from '@/lib/auth'
import { ROLEPERMISSIONS, USER_ROLE } from '@/packages/constants'

const ALLOWED_PERMISSION_IDS = new Set(ROLEPERMISSIONS.map((p) => p.id))

function sanitizePermissions(raw: string): string | null {
  const ids = raw
    .split(',')
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (ids.length === 0) return null
  if (ids.some((id) => !ALLOWED_PERMISSION_IDS.has(id))) return null
  // Dedupe and sort for stable storage.
  return [...new Set(ids)].sort((a, b) => a - b).join(',')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'rl-create_role', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }
    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
    }

    const role = String(req.body.role || '')
    if (!role) {
      return res.status(200).json({ message: 'Invalid role', result: false, data: null })
    }
    if (role === USER_ROLE.Owner) {
      return res.status(200).json({ message: 'Cannot create Owner role', result: false, data: null })
    }

    const permissions = sanitizePermissions(String(req.body.permissions || ''))
    if (!permissions) {
      return res.status(200).json({
        message: 'permissions must be a comma-separated list of known permission ids',
        result: false,
        data: null,
      })
    }

    const create_role = await prisma.roles.create({
      data: {
        user_id: userId,
        store_id: storeId,
        role: role,
        permissions: permissions,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: create_role.id,
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
