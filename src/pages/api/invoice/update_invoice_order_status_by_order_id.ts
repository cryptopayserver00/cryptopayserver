import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { ORDER_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const orderId = Number(req.body.order_id)
    if (!orderId) {
      return res.status(200).json({ message: 'Invalid orderId', result: false, data: null })
    }

    const orderStatus = req.body.order_status
    if (!orderStatus) {
      return res.status(200).json({ message: 'Invalid orderStatus', result: false, data: null })
    }

    if (orderStatus === ORDER_STATUS.Invalid) {
      const invoice = await prisma.invoices.update({
        where: {
          order_id: orderId,
          order_status: {
            not: orderStatus,
          },
          status: 1,
        },
        data: {
          order_status: orderStatus,
        },
      })

      let invoiceEventMessage = `Invoice ${orderId} new event: invoice_invalid`

      await prisma.invoice_events.create({
        data: {
          invoice_id: invoice.id,
          order_id: invoice.order_id,
          message: invoiceEventMessage,
          status: 1,
        },
      })
    }

    return res.status(200).json({ message: '', result: false, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
