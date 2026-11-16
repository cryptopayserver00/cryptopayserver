import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { requireCronSecret } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!requireCronSecret(req, res)) return
    console.log('Schedule Pull Payment Expired')

    const now = new Date()
    await prisma.pull_payments.updateMany({
      data: {
        pull_payment_status: PULL_PAYMENT_STATUS.Expired,
      },
      where: {
        pull_payment_status: PULL_PAYMENT_STATUS.Active,
        status: 1,
        expiration_at: { lte: now },
      },
    })

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