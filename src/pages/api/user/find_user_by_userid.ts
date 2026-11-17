import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireAuthUserId } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_user_by_userid', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const user = await prisma.users.findFirst({
      where: {
        id: userId,
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
        // Never return the TOTP secret — only whether 2FA is configured
        hasAuthenticator: Boolean(user.authenticator),
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
