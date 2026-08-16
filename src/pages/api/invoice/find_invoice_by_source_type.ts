import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
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

    const externalPaymentId = Number(req.query.external_payment_id)
    if (!externalPaymentId) {
      return res
        .status(200)
        .json({ message: 'Invalid externalPaymentId', result: false, data: null })
    }

    const sourceType = req.query.source_type
    if (!sourceType) {
      return res.status(200).json({ message: 'Invalid sourceType', result: false, data: null })
    }

    const invoices = await prisma.invoices.findMany({
      where: {
        store_id: storeId,
        network: network,
        source_type: String(sourceType),
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

    if (!invoices) {
      return res.status(200).json({ message: 'Invalid invices', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: invoices.map((item) => ({
        orderId: item.order_id,
        currency: item.currency,
        amount: item.amount,
        orderStatus: item.order_status,
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
