import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYMENT_REQUEST_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const paymentRequestId = Number(req.query.payment_request_id)
    if (!paymentRequestId) {
      return res
        .status(200)
        .json({ message: 'Invalid paymentRequestId', result: false, data: null })
    }

    const paymentRequestStatus = req.query.payment_request_status

    let whereData: { [key: string]: any } = {}
    whereData.store_id = storeId
    whereData.network = network
    whereData.status = 1

    if (paymentRequestId) whereData.payment_request_id = paymentRequestId
    if (
      paymentRequestStatus !== undefined &&
      paymentRequestStatus !== PAYMENT_REQUEST_STATUS.AllStatus
    )
      whereData.payment_request_status = paymentRequestStatus

    const payment_requests = await prisma.payment_requests.findMany({
      where: whereData,
      orderBy: {
        updated_at: 'desc',
      },
    })

    if (!payment_requests) {
      return res.status(200).json({ message: 'Invalid find many', result: false, data: null })
    }
    return res.status(200).json({ message: '', result: true, data: payment_requests })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
