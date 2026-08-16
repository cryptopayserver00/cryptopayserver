import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const payoutId = Number(req.query.id)
    if (!payoutId) {
      return res.status(200).json({ message: 'Invalid payoutId', result: false, data: null })
    }

    const payout = await prisma.payouts.findFirst({
      where: {
        payout_id: Number(payoutId),
        status: 1,
      },
    })

    if (!payout) {
      return res.status(200).json({ message: 'Cannot find payout', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        address: payout.address,
        crypto: payout.crypto,
        currency: payout.currency,
        amount: payout.amount,
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
