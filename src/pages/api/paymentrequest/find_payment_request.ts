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

    const paymentRequestId = req.query.payment_request_id
    const paymentRequestStatus = req.query.payment_request_status

    let whereData: { [key: string]: any } = {}
    whereData.store_id = storeId
    whereData.network = network
    whereData.status = 1

    if (paymentRequestId && Number(paymentRequestId))
      whereData.payment_request_id = paymentRequestId
    if (paymentRequestStatus && paymentRequestStatus !== PAYMENT_REQUEST_STATUS.AllStatus)
      whereData.payment_request_status = paymentRequestStatus

    const payment_requests = await prisma.payment_requests.findMany({
      where: whereData,
      orderBy: {
        updated_at: 'desc',
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: payment_requests.map((item) => ({
        id: item.id,
        storeId: item.store_id,
        network: item.network,
        paymentRequestId: item.payment_request_id,
        paymentRequestStatus: item.payment_request_status,
        userId: item.user_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        title: item.title,
        amount: item.amount,
        currency: item.currency,
        showAllowCustomAmount: item.show_allow_custom_amount,
        email: item.email,
        requestCustomerData: item.request_customer_data,
        memo: item.memo,
        expirationAt: item.expiration_at,
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
