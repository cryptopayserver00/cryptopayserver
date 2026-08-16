import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const invoiceId = Number(req.body.invoice_id)
    if (!invoiceId) {
      return res.status(200).json({ message: 'Invalid invoiceId', result: false, data: null })
    }

    const orderId = Number(req.body.order_id)
    if (!orderId) {
      return res.status(200).json({ message: 'Invalid orderId', result: false, data: null })
    }

    const message = req.body.message
    if (!message) {
      return res.status(200).json({ message: 'Invalid message', result: false, data: null })
    }

    const invoice_event = await prisma.invoice_events.create({
      data: {
        invoice_id: invoiceId,
        order_id: orderId,
        message: message,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: invoice_event.id,
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
