import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const currentUser = await prisma.users.findFirst({
      where: { id: userId, status: 1 },
    })
    if (!currentUser) {
      return res.status(200).json({ message: 'User not found', result: false, data: null })
    }

    const updateData: Record<string, any> = {}

    if (req.body.username) updateData.username = req.body.username
    if (req.body.profile_picture_url) updateData.profile_picture_url = req.body.profile_picture_url
    if (req.body.authenticator) updateData.authenticator = req.body.authenticator

    const email = req.body.email
    if (email) {
      const emailStr = String(email).trim()

      if (emailStr !== currentUser.email) {
        const existing = await prisma.users.findFirst({
          where: {
            email: emailStr,
            status: 1,
            NOT: { id: userId },
          },
        })

        if (!existing) {
          updateData.email = emailStr
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: '', result: true, data: null })
    }

    await prisma.users.update({
      data: updateData,
      where: {
        id: userId,
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
