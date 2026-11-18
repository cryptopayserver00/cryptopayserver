import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { requireCronSecret, withCronLock } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!requireCronSecret(req, res)) return

    const locked = await withCronLock('schedule_pull_payment_expired', 55_000, async () => {
      console.info('Schedule Pull Payment Expired')
      const now = new Date()
      const result = await prisma.pull_payments.updateMany({
        data: {
          pull_payment_status: PULL_PAYMENT_STATUS.Expired,
        },
        where: {
          pull_payment_status: PULL_PAYMENT_STATUS.Active,
          status: 1,
          expiration_at: { lte: now },
        },
      })
      return { expired: result.count }
    })

    if (!locked.acquired) {
      return res.status(200).json({ message: 'skipped: lock held', result: true, data: null })
    }

    return res.status(200).json({ message: '', result: true, data: locked.result })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}