import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const email = Number(req.query.email)
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    const user = await prisma.users.findFirst({
      where: {
        email: String(email),
        status: 1,
      },
      select: {
        username: true,
        email: true,
        profile_picture_url: true,
        authenticator: true,
      },
    })

    if (!user) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profile_picture_url,
        authenticator: user.authenticator,
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
