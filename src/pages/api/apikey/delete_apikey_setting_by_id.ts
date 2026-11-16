import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import { forbidden, requireAuth } from '@/lib/auth'

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

    const existing = await prisma.api_key_settings.findFirst({
      where: { id, user_id: session.userId, status: 1 },
      select: { id: true },
    })
    if (!existing) {
      return forbidden(res)
    }

    await prisma.api_key_settings.update({
      data: {
        status: 2,
      },
      where: {
        id: id,
        user_id: session.userId,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: null,
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
