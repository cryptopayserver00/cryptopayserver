import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { NOTIFICATION_TYPE } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import {
  clearPending2faCookie,
  getPending2faFromRequest,
  rateLimit,
  setSessionCookie,
} from '@/lib/auth'
import { decryptAndUpgrade } from '@/lib/crypto/secrets'
import { VerifyAuthenticator } from '@/utils/totp'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!rateLimit(req, res, { scope: 'verify-2fa', limit: 15, windowMs: 15 * 60 * 1000 })) {
      return
    }

    const pending = await getPending2faFromRequest(req)
    if (!pending) {
      return res.status(401).json({ message: '2FA session expired', result: false, data: null })
    }

    const code = String(req.body.code || '').trim()
    if (!code) {
      return res.status(200).json({ message: 'Invalid code', result: false, data: null })
    }

    const user = await prisma.users.findFirst({
      where: { id: pending.userId, status: 1 },
    })

    if (!user?.authenticator) {
      return res.status(200).json({ message: '2FA not configured', result: false, data: null })
    }

    const { plaintext: totpSecret, upgraded } = decryptAndUpgrade(user.authenticator)
    if (upgraded) {
      await prisma.users.update({
        where: { id: user.id },
        data: { authenticator: upgraded },
      })
    }

    if (!VerifyAuthenticator(code, totpSecret)) {
      return res.status(200).json({ message: 'Invalid code', result: false, data: null })
    }

    const stores = await prisma.stores.findMany({
      where: { user_id: user.id, status: 1 },
    })

    if (stores.length > 0) {
      const message = `You have a new login: ${new Date().toLocaleString()}`
      await prisma.notifications.createMany({
        data: [
          {
            user_id: user.id,
            store_id: stores[0].id,
            network: 1,
            label: NOTIFICATION_TYPE.UserUpdates,
            message,
            url: '',
            is_seen: 2,
            status: 1,
          },
          {
            user_id: user.id,
            store_id: stores[0].id,
            network: 2,
            label: NOTIFICATION_TYPE.UserUpdates,
            message,
            url: '',
            is_seen: 2,
            status: 1,
          },
        ],
      })
    }

    clearPending2faCookie(res)
    await setSessionCookie(res, user.id, user.password)

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
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
