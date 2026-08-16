import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }
    console.log('Schedule Pull Payment Expired')

    const pull_payments = await prisma.pull_payments.findMany({
      where: {
        pull_payment_status: PULL_PAYMENT_STATUS.Active,
        status: 1,
      },
    })

    const now = new Date()
    for (const payment of pull_payments) {
      const remainingTime = payment.expiration_at.getTime() - now.getTime()
      if (remainingTime <= 0) {
        await prisma.pull_payments.update({
          data: {
            pull_payment_status: PULL_PAYMENT_STATUS.Expired,
          },
          where: {
            id: payment.id,
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
