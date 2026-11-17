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

    if (!(await rateLimit(req, res, { scope: 'rl-update_userrole_by_id', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const id = req.body.id
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

    let updateData: { [key: string]: any } = {}

    if (req.body.email) {
      const email = String(req.body.email).trim().toLowerCase()
      const invitee = await prisma.users.findFirst({
        where: {
          OR: [{ email }, { email: String(req.body.email).trim() }],
          status: 1,
        },
        select: { id: true, email: true },
      })
      if (!invitee) {
        return res.status(200).json({
          message: 'Invitee must already have an account',
          result: false,
          data: null,
        })
      }
      if (invitee.id === session.userId) {
        return res.status(200).json({ message: 'Cannot invite yourself', result: false, data: null })
      }
      const conflict = await prisma.user_roles.findFirst({
        where: {
          store_id: owned.store_id,
          email: String(invitee.email).trim().toLowerCase(),
          status: 1,
          NOT: { id: owned.id },
        },
        select: { id: true },
      })
      if (conflict) {
        return res.status(200).json({ message: 'User already invited', result: false, data: null })
      }
      updateData.email = String(invitee.email).trim().toLowerCase()
    }
    if (req.body.role) {
      const nextRole = String(req.body.role)
      if (nextRole === USER_ROLE.Owner || owned.role === USER_ROLE.Owner) {
        return res
          .status(200)
          .json({ message: 'Cannot change Owner role assignment', result: false, data: null })
      }
      const builtin = new Set([USER_ROLE.Manager, USER_ROLE.Employee, USER_ROLE.Guest])
      if (!builtin.has(nextRole)) {
        const roleRow = await prisma.roles.findFirst({
          where: { store_id: owned.store_id, role: nextRole, status: 1 },
          select: { id: true },
        })
        if (!roleRow) {
          return res
            .status(200)
            .json({ message: 'Unknown role for store', result: false, data: null })
        }
      }
      updateData.role = nextRole
    }

    await prisma.user_roles.update({
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
