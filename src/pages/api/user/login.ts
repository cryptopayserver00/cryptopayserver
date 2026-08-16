import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import CryptoJS from 'crypto-js'
import { NOTIFICATION_TYPE } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const password = req.body.password
    if (!password) {
      return res.status(200).json({ message: 'Invalid password', result: false, data: null })
    }

    const cryptoPassword = CryptoJS.SHA256(password).toString()

    const user = await prisma.users.findFirst({
      where: {
        email: email,
        password: cryptoPassword,
        status: 1,
      },
    })

    if (!user) {
      return res.status(200).json({ message: 'Cannot find user', result: false, data: null })
    }

    const stores = await prisma.stores.findMany({
      where: {
        user_id: user.id,
        status: 1,
      },
    })

    if (stores && stores.length > 0) {
      const message = `You have a new login: ${new Date().toLocaleString()}`
      const result = await prisma.notifications.createMany({
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

      if (result.count === 0) {
        return res.status(200).json({ message: 'Cannot create many', result: false, data: null })
      }
    }

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
