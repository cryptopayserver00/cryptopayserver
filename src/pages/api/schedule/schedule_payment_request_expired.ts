import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYMENT_REQUEST_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { requireCronSecret } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!requireCronSecret(req, res)) return

    console.log('Schedule Payment Request Expired')

    const now = new Date()
    await prisma.payment_requests.updateMany({
      data: {
        payment_request_status: PAYMENT_REQUEST_STATUS.Expired,
      },
      where: {
        payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
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
