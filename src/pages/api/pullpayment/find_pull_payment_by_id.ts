import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const pullPaymentId = Number(req.query.id)
    if (!pullPaymentId) {
      return res.status(200).json({ message: 'Invalid pullPaymentId', result: false, data: null })
    }

    const pull_payments = await prisma.pull_payments.findFirst({
      where: {
        pull_payment_id: pullPaymentId,
        status: 1,
      },
    })

    if (!pull_payments) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const store = await prisma.stores.findFirst({
      where: {
        id: pull_payments.store_id,
      },
    })

    if (!store) {
      return res.status(200).json({ message: 'Cannot find store', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: pull_payments.id,
        name: pull_payments.name,
        userId: pull_payments.user_id,
        storeId: pull_payments.store_id,
        network: pull_payments.network,
        status: pull_payments.status,
        createdAt: pull_payments.created_at,
        updatedAt: pull_payments.updated_at,
        pullPaymentId: pull_payments.pull_payment_id,
        amount: pull_payments.amount,
        currency: pull_payments.currency,
        showAutoApproveClaim: pull_payments.show_auto_approve_claim,
        payoutMethod: pull_payments.payout_method,
        description: pull_payments.description,
        pullPaymentStatus: pull_payments.pull_payment_status,
        expirationAt: pull_payments.expiration_at,
        storeName: store.name,
        storeBrandColor: store.brand_color,
        storeLogoUrl: store.logo_url,
        storeWebsite: store.website,
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
