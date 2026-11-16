import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { assertStoreOwnedByUser, forbidden, requireAuth } from '@/lib/auth'
import { revokeStoreIntegrations } from '@/lib/store/revoke-integrations'

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

    if (!(await assertStoreOwnedByUser(id, session.userId))) {
      return forbidden(res)
    }

    await prisma.$transaction(async (tx) => {
      await tx.stores.update({
        data: { status: 2 },
        where: {
          id: id,
          user_id: session.userId,
          status: 1,
        },
      })
      await revokeStoreIntegrations(tx, id)
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
