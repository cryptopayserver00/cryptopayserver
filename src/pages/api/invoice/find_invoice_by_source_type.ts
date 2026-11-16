import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { INVOICE_SOURCE_TYPE } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/auth'
import {
  readAccessToken,
  signPublicResource,
  verifyPublicResource,
} from '@/lib/security/public-token'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!rateLimit(req, res, { scope: 'pub-find-invoice-by-source-t', limit: 60, windowMs: 15 * 60 * 1000 })) {
      return
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const externalPaymentId = Number(req.query.external_payment_id)
    if (!externalPaymentId) {
      return res
        .status(200)
        .json({ message: 'Invalid externalPaymentId', result: false, data: null })
    }

    const sourceType = String(req.query.source_type || '')
    if (!sourceType) {
      return res.status(200).json({ message: 'Invalid sourceType', result: false, data: null })
    }

    // Derive store from the payment artifact — ignore client store_id.
    let storeId: number | null = null
    if (sourceType === INVOICE_SOURCE_TYPE.PaymentRequest) {
      if (!verifyPublicResource('payment_request', externalPaymentId, readAccessToken(req))) {
        return res
          .status(403)
          .json({ message: 'Invalid or missing access token', result: false, data: null })
      }
      const paymentRequest = await prisma.payment_requests.findFirst({
        where: { payment_request_id: externalPaymentId, status: 1 },
        select: { store_id: true, network: true },
      })
      if (!paymentRequest || paymentRequest.network !== network) {
        return res.status(200).json({ message: 'Invalid payment request', result: false, data: null })
      }
      storeId = paymentRequest.store_id
    } else {
      return res.status(200).json({ message: 'Invalid sourceType', result: false, data: null })
    }

    const invoices = await prisma.invoices.findMany({
      where: {
        store_id: storeId,
        network: network,
        source_type: sourceType,
        external_payment_id: externalPaymentId,
        status: 1,
      },
      select: {
        order_id: true,
        amount: true,
        currency: true,
        order_status: true,
      },
      orderBy: {
        id: 'desc',
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: invoices.map((item) => ({
        orderId: item.order_id,
        amount: item.amount,
        currency: item.currency,
        orderStatus: item.order_status,
        accessToken: signPublicResource('invoice', item.order_id),
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
