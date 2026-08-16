import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const orderId = Number(req.query.order_id)
    if (!orderId) {
      return res.status(200).json({ message: 'Invalid orderId', result: false, data: null })
    }

    const invoice_events = await prisma.invoice_events.findMany({
      where: {
        order_id: orderId,
        status: 1,
      },
      select: {
        id: true,
        message: true,
        created_at: true,
      },
    })

    if (!invoice_events) {
      return res.status(200).json({ message: 'Invalid invoice events', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: invoice_events.map((item) => ({
        id: item.id,
        createdAt: item.created_at,
        message: item.message,
      })),
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
