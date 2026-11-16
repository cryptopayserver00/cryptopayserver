import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { NOTIFICATION_TYPE } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import {
  hashPassword,
  rateLimit,
  setPending2faCookie,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!rateLimit(req, res, { scope: 'login', limit: 10, windowMs: 15 * 60 * 1000 })) {
      return
    }

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const password = req.body.password
    if (!password) {
      return res.status(200).json({ message: 'Invalid password', result: false, data: null })
    }

    const user = await prisma.users.findFirst({
      where: {
        email: email,
        status: 1,
      },
    })

    if (!user) {
      return res.status(200).json({ message: 'Cannot find user', result: false, data: null })
    }

    const { ok, needsRehash } = await verifyPassword(password, user.password)
    if (!ok) {
      return res.status(200).json({ message: 'Cannot find user', result: false, data: null })
    }

    let passwordHash = user.password
    if (needsRehash) {
      passwordHash = await hashPassword(password)
      await prisma.users.update({
        where: { id: user.id },
        data: { password: passwordHash },
      })
    }

    // Require TOTP when authenticator is configured
    if (user.authenticator) {
      await setPending2faCookie(res, user.id)
      return res.status(200).json({
        message: '',
        result: true,
        data: {
          requires2fa: true,
        },
      })
    }

    const stores = await prisma.stores.findMany({
      where: {
        user_id: user.id,
        status: 1,
      },
    })

    if (stores && stores.length > 0) {
      const message = `You have a new login: ${new Date().toLocaleString()}`
      await prisma.notifications.createMany({
        data: [
          {
            user_id: user.id,
            store_id: stores[0].id,
            network: 1,
            label: NOTIFICATION_TYPE.UserUpdates,
            message: message,
            url: '',
            is_seen: 2,
            status: 1,
          },
          {
            user_id: user.id,
            store_id: stores[0].id,
            network: 2,
            label: NOTIFICATION_TYPE.UserUpdates,
            message: message,
            url: '',
            is_seen: 2,
            status: 1,
          },
        ],
      })
    }

    await setSessionCookie(res, user.id, passwordHash)

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        requires2fa: false,
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
