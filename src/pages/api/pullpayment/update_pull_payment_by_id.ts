import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const pullPaymentId = Number(req.body.id)
    if (!pullPaymentId) {
      return res.status(200).json({ message: 'Invalid pullPaymentId', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.name) updateData.name = req.body.name
    if (req.body.amount) updateData.amount = Number(req.body.amount)
    if (req.body.currency) updateData.currency = req.body.currency
    if (req.body.show_auto_approve_claim)
      updateData.show_auto_approve_claim = Number(req.body.show_auto_approve_claim)
    if (req.body.description) updateData.description = req.body.description
    if (req.body.payout_method) updateData.payout_method = req.body.payout_method
    if (req.body.pull_payment_status) updateData.pull_payment_status = req.body.pull_payment_status

    await prisma.pull_payments.update({
      data: updateData,
      where: {
        pull_payment_id: pullPaymentId,
        status: 1,
      },
    })

    switch (req.body.pull_payment_status) {
      case PULL_PAYMENT_STATUS.Archived:
        const result = await prisma.payouts.updateMany({
          data: {
            payout_status: PAYOUT_STATUS.Cancelled,
          },
          where: {
            external_payment_id: pullPaymentId,
            source_type: PAYOUT_SOURCE_TYPE.PullPayment,
            status: 1,
            payout_status: {
              in: [PAYOUT_STATUS.AwaitingApproval, PAYOUT_STATUS.AwaitingPayment],
            },
          },
        })

        if (result.count === 0) {
          return res.status(500).json({ message: 'Cannot update', result: false, data: null })
        }
    }

    return res.status(200).json({ message: '', result: true, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
