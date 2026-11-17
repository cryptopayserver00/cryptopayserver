import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { REPORT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireOwnedStore } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const owned = await requireOwnedStore(req, res, req.query.store_id, req.query.user_id)
    if (!owned) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_report', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    const storeId = owned.storeId

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const startDateRaw = req.query.start_date
    const endDateRaw = req.query.end_date
    const status = req.query.status

    const startMs = Number(startDateRaw)
    const endMs = Number(endDateRaw)
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      return res.status(200).json({
        message: 'Invalid start_date or end_date',
        result: false,
        data: null,
      })
    }
    const startDate = new Date(startMs)
    const endDate = new Date(endMs)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
      return res.status(200).json({
        message: 'Invalid date range',
        result: false,
        data: null,
      })
    }

    const reports = await prisma.invoices.findMany({
      where: {
        source_type:
          String(status) && String(status) !== REPORT_STATUS.All ? String(status) : undefined,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        store_id: storeId,
        network: network,
        status: 1,
      },
      select: {
        order_id: true,
        chain_id: true,
        currency: true,
        amount: true,
        crypto: true,
        crypto_amount: true,
        rate: true,
        description: true,
        buyer_email: true,
        order_status: true,
        created_at: true,
        expiration_at: true,
        payment_method: true,
        source_type: true,
        paid: true,
        metadata: true,
        hash: true,
      },
      orderBy: {
        id: 'desc',
      },
    })

    const store = await prisma.stores.findFirst({
      where: {
        id: storeId,
        status: 1,
      },
      select: {
        name: true,
      },
    })

    if (!store) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: reports.map((item) => ({
        chainId: item.chain_id,
        orderId: item.order_id,
        currency: item.currency,
        amount: item.amount,
        crypto: item.crypto,
        cryptoAmount: item.crypto_amount,
        rate: item.rate,
        description: item.description,
        buyerEmail: item.buyer_email,
        orderStatus: item.order_status,
        paymentMethod: item.payment_method,
        paid: item.paid,
        metadata: item.metadata,
        sourceType: item.source_type,
        hash: item.hash,
        expirationAt: item.expiration_at,
        createdAt: item.created_at,

        storeName: store.name,
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
