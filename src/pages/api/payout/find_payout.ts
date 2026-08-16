import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
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

    const payoutStatus = req.query.payout_status

    const payouts = await prisma.payouts.findMany({
      where: {
        payout_status: String(payoutStatus),
        store_id: storeId,
        network: network,
        status: 1,
      },
      orderBy: {
        updated_at: 'desc',
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: payouts.map((item) => ({
        id: item.id,
        userId: item.user_id,
        chainId: item.chain_id,
        address: item.address,
        storeId: item.store_id,
        network: item.network,
        payoutStatus: item.payout_status,
        status: item.status,
        payoutId: item.payout_id,
        externalPaymentId: item.external_payment_id,
        sourceType: item.source_type,
        currency: item.currency,
        amount: item.amount,
        crypto: item.crypto,
        cryptoAmount: item.crypto_amount,
        tx: item.tx,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
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
