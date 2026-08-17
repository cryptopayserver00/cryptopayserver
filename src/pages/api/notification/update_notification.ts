import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.label) updateData.label = req.body.label
    if (req.body.message) updateData.message = req.body.message
    if (req.body.is_seen) updateData.is_seen = Number(req.body.is_seen)

    const result = await prisma.notifications.updateMany({
      data: updateData,
      where: {
        id: id,
        status: 1,
      },
    })

    if (result.count === 0) {
      return res.status(200).json({ message: 'Invalid update', result: false, data: null })
    }

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
