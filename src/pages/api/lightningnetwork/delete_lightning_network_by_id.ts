import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  assertLightningOwnedByUser,
  forbidden,
  rateLimit,
  requireAccountPassword,
  requireAuth,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!rateLimit(req, res, { scope: 'ln-delete', limit: 20, windowMs: 15 * 60 * 1000 })) {
      return
    }

    if (
      !(await requireAccountPassword(
        res,
        session.userId,
        req.body.account_password || req.body.password,
        'Account password required to delete Lightning credentials'
      ))
    ) {
      return
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    if (!(await assertLightningOwnedByUser(id, session.userId))) {
      return forbidden(res)
    }

    await prisma.$transaction(async (tx) => {
      await tx.wallet_lightning_networks.update({
        where: { id, user_id: session.userId, status: 1 },
        data: {
          status: 2,
          enabled: 2,
          server: '',
          access_token: '',
          refresh_token: '',
          macaroon: '',
          certthumbprint: '',
          rune: '',
        },
      })
      await tx.wallet_lightning_network_settings.updateMany({
        where: { lnd_id: id, user_id: session.userId, status: 1 },
        data: { status: 2 },
      })
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
