import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, assertStoreOwnedByUser, forbidden, requireAuth } from '@/lib/auth'
import { USER_ROLE } from '@/packages/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rl-delete_user_role_by_id', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }
    const owned = await prisma.user_roles.findFirst({
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
        .json({ message: 'Cannot remove Owner role assignment', result: false, data: null })
    }

    await prisma.user_roles.update({
      data: {
        status: 2,
      },
      where: {
        id: owned.id,
        user_id: session.userId,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: null,
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
