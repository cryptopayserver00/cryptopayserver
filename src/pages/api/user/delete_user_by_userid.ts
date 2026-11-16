import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { clearSessionCookie, requireAuthUserId, verifyPassword } from '@/lib/auth'
import { revokeStoreIntegrations, revokeUserSecrets } from '@/lib/store/revoke-integrations'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    const user = await prisma.users.findFirst({
      where: { id: userId, status: 1 },
      select: { id: true, email: true, password: true },
    })
    if (!user) {
      return res.status(200).json({ message: 'User not found', result: false, data: null })
    }

    const accountPassword = String(req.body.password || '')
    if (!accountPassword) {
      return res.status(200).json({
        message: 'Account password required to delete account',
        result: false,
        data: null,
      })
    }
    const { ok } = await verifyPassword(accountPassword, user.password)
    if (!ok) {
      return res.status(200).json({ message: 'Invalid password', result: false, data: null })
    }

    await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id: userId, status: 1 },
        data: { status: 2 },
      })

      // Revoke store invites so a later re-registration cannot inherit access.
      if (user.email) {
        const email = user.email.trim().toLowerCase()
        await tx.user_roles.updateMany({
          where: {
            status: 1,
            OR: [{ email }, { email: user.email }],
          },
          data: { status: 2 },
        })
      }

      const stores = await tx.stores.findMany({
        where: { user_id: userId, status: { in: [1, 3] } },
        select: { id: true },
      })
      for (const store of stores) {
        await revokeStoreIntegrations(tx, store.id)
      }

      await tx.stores.updateMany({
        where: { user_id: userId, status: { in: [1, 3] } },
        data: { status: 2 },
      })

      await revokeUserSecrets(tx, userId)
    })

    clearSessionCookie(res)

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
