import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYMENT_REQUEST_STATUS } from '@/packages/constants'
import { GenerateOrderIDByTime } from '@/utils/number'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const storeId = Number(req.body.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const amount = Number(req.body.amount)
    if (!amount) {
      return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
    }

    const paymentRequestId = GenerateOrderIDByTime()
    const title = req.body.title
    const currency = req.body.currency
    const showAllowCustomAmount = req.body.show_allow_custom_amount
    const expirationDate = req.body.expiration_date
    const email = req.body.email
    const requestCustomerData = req.body.request_customer_data
    const memo = req.body.memo

    const payment_request = await prisma.payment_requests.create({
      data: {
        user_id: userId,
        store_id: storeId,
        network: network,
        payment_request_id: paymentRequestId,
        title: title,
        amount: amount,
        currency: currency,
        show_allow_custom_amount: showAllowCustomAmount,
        email: email,
        request_customer_data: requestCustomerData,
        memo: memo,
        payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
        expiration_at: new Date(expirationDate),
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: payment_request.id,
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
