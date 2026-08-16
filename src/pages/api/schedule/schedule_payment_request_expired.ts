import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYMENT_REQUEST_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    console.log('Schedule Payment Request Expired')

    const payment_requests = await prisma.payment_requests.findMany({
      where: {
        payment_request_status: PAYMENT_REQUEST_STATUS.Pending,
        status: 1,
      },
    })

    if (!payment_requests) {
      return res
        .status(200)
        .json({ message: 'Cannot find many payment requests', result: false, data: null })
    }

    const now = new Date()
    payment_requests.forEach(async (item) => {
      const remainingTime = item.expiration_at.getTime() - now.getTime()
      if (remainingTime <= 0) {
        await prisma.payment_requests.update({
          data: {
            payment_request_status: PAYMENT_REQUEST_STATUS.Expired,
          },
          where: {
            id: item.id,
            status: 1,
          },
        })
      }
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
