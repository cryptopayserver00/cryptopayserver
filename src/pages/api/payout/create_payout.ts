import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GenerateOrderIDByTime } from '@/utils/number'
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from '@/packages/constants'
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

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const amount = Number(req.body.amount)
    if (!amount) {
      return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
    }

    const externalPaymentId = Number(req.body.external_payment_id)
    if (!externalPaymentId) {
      return res
        .status(200)
        .json({ message: 'Invalid externalPaymentId', result: false, data: null })
    }

    const payoutId = GenerateOrderIDByTime()
    const address = req.body.address
    const sourceType = req.body.source_type
    const currency = req.body.currency
    const crypto = req.body.crypto
    const now = new Date()
    // const updatedDate = new Date().getTime();

    let status = PAYOUT_STATUS.AwaitingApproval

    switch (sourceType) {
      case PAYOUT_SOURCE_TYPE.PullPayment:
        const pull_payment = await prisma.pull_payments.findFirst({
          where: {
            pull_payment_id: externalPaymentId,
            status: 1,
          },
          select: {
            show_auto_approve_claim: true,
          },
        })

        if (!pull_payment) {
          return res.status(200).json({ message: 'Invalid find', result: false, data: null })
        }

        if (pull_payment.show_auto_approve_claim === 1) {
          status = PAYOUT_STATUS.AwaitingPayment
        }
    }

    const payout = await prisma.payouts.create({
      data: {
        user_id: userId,
        store_id: storeId,
        network: network,
        chain_id: chainId,
        payout_id: payoutId,
        address: address,
        source_type: sourceType,
        currency: currency,
        amount: Number(amount),
        crypto: crypto,
        external_payment_id: externalPaymentId,
        payout_status: status,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: payout.id,
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
