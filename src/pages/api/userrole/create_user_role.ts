import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { requireAuthUserId, assertStoreOwnedByUser, forbidden } from '@/lib/auth'
import { USER_ROLE } from '@/packages/constants'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }
    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
    }

    const email = String(req.body.email || '').trim().toLowerCase()
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    // Only invite already-registered users — blocks invite-then-register hijacks.
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
    if (invitee.id === userId) {
      return res.status(200).json({ message: 'Cannot invite yourself', result: false, data: null })
    }

    const role = String(req.body.role || '')
    if (!role) {
      return res.status(200).json({ message: 'Invalid role', result: false, data: null })
    }
    // Only store owners may invite; never allow assigning Owner via invite.
    if (role === USER_ROLE.Owner) {
      return res.status(200).json({ message: 'Cannot invite as Owner', result: false, data: null })
    }

    const builtin = new Set([USER_ROLE.Manager, USER_ROLE.Employee, USER_ROLE.Guest])
    if (!builtin.has(role)) {
      const roleRow = await prisma.roles.findFirst({
        where: { store_id: storeId, role, status: 1 },
        select: { id: true },
      })
      if (!roleRow) {
        return res.status(200).json({ message: 'Unknown role for store', result: false, data: null })
      }
    }

    const existingInvite = await prisma.user_roles.findFirst({
      where: {
        store_id: storeId,
        email: String(invitee.email).trim().toLowerCase(),
        status: 1,
      },
      select: { id: true },
    })
    if (existingInvite) {
      return res.status(200).json({ message: 'User already invited', result: false, data: null })
    }

    const userRole = await prisma.user_roles.create({
      data: {
        user_id: userId,
        store_id: storeId,
        role: role,
        email: String(invitee.email).trim().toLowerCase(),
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: userRole.id,
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
