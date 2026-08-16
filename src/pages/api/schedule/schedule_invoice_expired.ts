import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { ORDER_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    console.log('Schedule Invoice Expired')

    const invoices = await prisma.invoices.findMany({
      where: {
        order_status: ORDER_STATUS.Processing,
        status: 1,
      },
    })

    const now = new Date()
    for (const invoice of invoices) {
      const remainingTime = invoice.expiration_at.getTime() - now.getTime()
      if (remainingTime <= 0) {
        await prisma.invoices.update({
          data: {
            order_status: ORDER_STATUS.Expired,
          },
          where: {
            id: invoice.id,
            status: 1,
          },
        })

        let result = await prisma.invoice_events.createMany({
          data: [
            {
              invoice_id: invoice.id,
              order_id: invoice.order_id,
              message: `Invoice status is Expired`,
              status: 1,
            },
            {
              invoice_id: invoice.id,
              order_id: invoice.order_id,
              message: `Invoice ${invoice.order_id} new event: invoice_expired`,
              status: 1,
            },
            {
              invoice_id: invoice.id,
              order_id: invoice.order_id,
              message: `Invoice ${invoice.order_id} is not monitored anymore.`,
              status: 1,
            },
          ],
        })

        if (result.count === 0) {
          return res
            .status(200)
            .json({ message: 'Cannot create many invoice event', result: false, data: null })
        }
      }
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
