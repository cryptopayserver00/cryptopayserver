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

    const payoutId = Number(req.body.id)
    if (!payoutId) {
      return res.status(200).json({ message: 'Invalid payoutId', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.payout_status !== undefined) updateData.payout_status = req.body.payout_status
    if (req.body.tx !== undefined) updateData.tx = req.body.tx
    if (req.body.crypto_amount !== undefined)
      updateData.crypto_amount = Number(req.body.crypto_amount)

    const payout = await prisma.payouts.update({
      data: updateData,
      where: {
        payout_id: payoutId,
        status: 1,
      },
    })

    switch (payout.source_type) {
      case PAYOUT_SOURCE_TYPE.PullPayment:
        const pull_payment = await prisma.pull_payments.findFirst({
          where: {
            pull_payment_id: payout.external_payment_id,
            pull_payment_status: PULL_PAYMENT_STATUS.Active,
            status: 1,
          },
          select: {
            id: true,
            amount: true,
          },
        })

        if (!pull_payment) {
          return res.status(200).json({ message: 'Cannot find', result: false, data: null })
        }

        const payouts = await prisma.payouts.findMany({
          where: {
            external_payment_id: payout.external_payment_id,
            payout_status: PAYOUT_STATUS.Completed,
            status: 1,
          },
          select: {
            amount: true,
          },
        })

        if (!payouts) {
          return res.status(200).json({ message: 'Cannot find', result: false, data: null })
        }

        const settledAmount = payouts.reduce((sum, payout) => sum + payout.amount, 0)

        if (settledAmount >= pull_payment.amount) {
          await prisma.pull_payments.update({
            data: {
              pull_payment_status: PULL_PAYMENT_STATUS.Settled,
            },
            where: {
              pull_payment_id: payout.external_payment_id,
              pull_payment_status: PULL_PAYMENT_STATUS.Active,
              status: 1,
            },
          })
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
