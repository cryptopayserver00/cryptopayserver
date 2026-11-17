import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, assertStoreOwnedByUser, forbidden, requireAuth } from '@/lib/auth'
import { ROLEPERMISSIONS, USER_ROLE } from '@/packages/constants'

const ALLOWED_PERMISSION_IDS = new Set(ROLEPERMISSIONS.map((p) => p.id))

function sanitizePermissions(raw: string): string | null {
  const ids = raw
    .split(',')
    .map((p) => Number(p.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (ids.length === 0) return null
  if (ids.some((id) => !ALLOWED_PERMISSION_IDS.has(id))) return null
  return [...new Set(ids)].sort((a, b) => a - b).join(',')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rl-update_role_by_id', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.roles.findFirst({
      where: { id: Number(id), user_id: session.userId, status: 1 },
      select: { id: true, store_id: true, role: true },
    })
    if (!owned) {
      return forbidden(res)
    }
    if (!(await assertStoreOwnedByUser(owned.store_id, session.userId))) {
      return forbidden(res)
    }
    if (owned.role === USER_ROLE.Owner) {
      return res
        .status(200)
        .json({ message: 'Cannot modify Owner role', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.role) {
      const nextRole = String(req.body.role)
      if (nextRole === USER_ROLE.Owner) {
        return res
          .status(200)
          .json({ message: 'Cannot rename role to Owner', result: false, data: null })
      }
      updateData.role = nextRole
    }
    if (req.body.permissions) {
      const permissions = sanitizePermissions(String(req.body.permissions))
      if (!permissions) {
        return res.status(200).json({
          message: 'permissions must be a comma-separated list of known permission ids',
          result: false,
          data: null,
        })
      }
      updateData.permissions = permissions
    }

    await prisma.roles.update({
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
