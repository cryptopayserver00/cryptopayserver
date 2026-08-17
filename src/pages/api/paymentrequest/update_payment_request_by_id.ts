import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const paymentRequestId = Number(req.body.id)
    if (!paymentRequestId) {
      return res
        .status(200)
        .json({ message: 'Invalid paymentRequestId', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.title) updateData.title = req.body.title
    if (req.body.amount) updateData.amount = Number(req.body.amount)
    if (req.body.currency) updateData.currency = req.body.currency
    if (req.body.show_allow_custom_amount)
      updateData.show_allow_custom_amount = Number(req.body.show_allow_custom_amount)
    if (req.body.expiration_date) updateData.expiration_date = req.body.expiration_date
    if (req.body.email) updateData.email = req.body.email
    if (req.body.request_customer_data)
      updateData.request_customer_data = req.body.request_customer_data
    if (req.body.memo) updateData.memo = req.body.memo
    if (req.body.payment_request_status)
      updateData.payment_request_status = req.body.payment_request_status

    const result = await prisma.payment_requests.updateMany({
      data: updateData,
      where: {
        id: paymentRequestId,
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
