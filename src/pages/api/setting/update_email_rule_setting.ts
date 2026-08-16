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

    if (req.body.trigger !== undefined) updateData.trigger = Number(req.body.trigger)
    if (req.body.recipients !== undefined) updateData.recipients = req.body.recipients
    if (req.body.show_send_to_buyer !== undefined)
      updateData.show_send_to_buyer = Number(req.body.show_send_to_buyer)
    if (req.body.subject !== undefined) updateData.subject = req.body.subject
    if (req.body.body !== undefined) updateData.body = req.body.body

    await prisma.email_rule_settings.update({
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
