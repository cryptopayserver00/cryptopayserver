import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const email = req.body.email
    if (!email) {
      return res.status(200).json({ message: 'Invalid email', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.username !== undefined) updateData.username = req.body.username
    if (req.body.profile_picture_url !== undefined)
      updateData.profile_picture_url = req.body.profile_picture_url
    if (req.body.authenticator !== undefined) updateData.authenticator = req.body.authenticator

    await prisma.users.update({
      data: updateData,
      where: {
        email: email,
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
