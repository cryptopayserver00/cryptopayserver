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

    if (req.body.payload_url !== undefined) updateData.payload_url = req.body.payload_url
    if (req.body.secret !== undefined) updateData.secret = req.body.secret
    if (req.body.automatic_redelivery !== undefined)
      updateData.automatic_redelivery = Number(req.body.automatic_redelivery)
    if (req.body.enabled !== undefined) updateData.enabled = Number(req.body.enabled)
    if (req.body.event_type !== undefined) updateData.event_type = Number(req.body.event_type)

    await prisma.webhook_settings.update({
      data: updateData,
      where: {
        id: id,
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
