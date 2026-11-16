import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GenerateOrderIDByTime } from '@/utils/number'
import { PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { requireStorePermission, STORE_PERMISSION } from '@/lib/auth'
import { signPublicResource } from '@/lib/security/public-token'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const access = await requireStorePermission(
      req,
      res,
      req.body.store_id,
      STORE_PERMISSION.ManagePullPayments,
      req.body.user_id
    )
    if (!access) return
    const userId = access.userId
    const storeId = access.storeId

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const pullPaymentId = GenerateOrderIDByTime()
    const name = req.body.name
    const amount = Number(req.body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
    }
    const currency = req.body.currency
    const showAutoApproveClaim = req.body.show_auto_approve_claim
    const description = req.body.description
    const createdDate = new Date()

    // const expirationDate = createdDate.setDate(createdDate + 7)

    const expirationDate = new Date(createdDate.setDate(createdDate.getDate() + 7))

    const pull_payment = await prisma.pull_payments.create({
      data: {
        user_id: userId,
        store_id: storeId,
        network: network,
        pull_payment_id: pullPaymentId,
        name: name,
        amount: amount,
        currency: currency,
        show_auto_approve_claim: showAutoApproveClaim,
        description: description,
        pull_payment_status: PULL_PAYMENT_STATUS.Active,
        expiration_at: expirationDate,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: pull_payment.id,
        pullPaymentId: pullPaymentId,
        accessToken: signPublicResource('pull_payment', pullPaymentId),
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
