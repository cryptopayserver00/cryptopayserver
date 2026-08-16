import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const paymentRequestId = Number(req.query.id)
    if (!paymentRequestId) {
      return res
        .status(200)
        .json({ message: 'Invalid paymentRequestId', result: false, data: null })
    }

    const payment_request = await prisma.payment_requests.findFirst({
      where: {
        payment_request_id: paymentRequestId,
        status: 1,
      },
    })

    if (!payment_request) {
      return res.status(200).json({ message: 'Invalid find', result: false, data: null })
    }

    const store = await prisma.stores.findFirst({
      where: {
        id: payment_request.store_id,
      },
    })

    if (!store) {
      return res.status(200).json({ message: 'Invalid store', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: payment_request.id,
        userId: payment_request.user_id,
        storeId: payment_request.store_id,
        network: payment_request.network,
        status: payment_request.status,
        createdAt: payment_request.created_at,
        updatedAt: payment_request.updated_at,
        paymentRequestId: payment_request.payment_request_id,
        title: payment_request.title,
        amount: payment_request.amount,
        currency: payment_request.currency,
        showAllowCustomAmount: payment_request.show_allow_custom_amount,
        email: payment_request.email,
        requestCustomerData: payment_request.request_customer_data,
        memo: payment_request.memo,
        paymentRequestStatus: payment_request.payment_request_status,
        expirationAt: payment_request.expiration_at,
        store_name: store.name,
        store_brand_color: store.brand_color,
        store_logo_url: store.logo_url,
        store_website: store.website,
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
