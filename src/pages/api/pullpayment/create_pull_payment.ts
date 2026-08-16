import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GenerateOrderIDByTime } from '@/utils/number'
import { PULL_PAYMENT_STATUS } from '@/packages/constants'
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

    const pullPaymentId = GenerateOrderIDByTime()
    const name = req.body.name
    const amount = req.body.amount
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
        amount: Number(amount),
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
