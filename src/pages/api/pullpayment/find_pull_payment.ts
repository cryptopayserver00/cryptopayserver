import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS } from '@/packages/constants'
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

    const pullPaymentStatus = req.query.pull_payment_status
    if (!pullPaymentStatus) {
      return res
        .status(200)
        .json({ message: 'Invalid pullPaymentStatus', result: false, data: null })
    }

    const pullPaymentsRaw: any = await prisma.$queryRaw`
        SELECT pull_payments.*, COUNT(payouts.external_payment_id) AS refunded 
        FROM pull_payments 
        LEFT JOIN payouts 
          ON pull_payments.pull_payment_id = payouts.external_payment_id 
          AND payouts.source_type = ${PAYOUT_SOURCE_TYPE.PullPayment} 
          AND payouts.payout_status = ${PAYOUT_STATUS.Completed} 
          AND payouts.status = 1 
        WHERE pull_payments.pull_payment_status = ${pullPaymentStatus} 
          AND pull_payments.store_id = ${storeId} 
          AND pull_payments.network = ${network} 
          AND pull_payments.status = 1 
          GROUP BY pull_payments.id 
          ORDER BY pull_payments.id DESC;
      `

    return res.status(200).json({
      message: '',
      result: true,
      data: pullPaymentsRaw.map((item: any) => ({
        id: item.id,
        name: item.name,
        userId: item.user_id,
        storeId: item.store_id,
        network: item.network,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        pullPaymentId: item.pull_payment_id,
        amount: item.amount,
        currency: item.currency,
        showAutoApproveClaim: item.show_auto_approve_claim,
        payoutMethod: item.payout_method,
        description: item.description,
        pullPaymentStatus: item.pull_payment_status,
        expirationAt: item.expiration_at,

        refunded: Number(item.refunded),
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
