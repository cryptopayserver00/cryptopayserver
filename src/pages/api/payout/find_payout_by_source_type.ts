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

    const externalPaymentId = Number(req.query.external_payment_id)
    if (!externalPaymentId) {
      return res
        .status(200)
        .json({ message: 'Invalid externalPaymentId', result: false, data: null })
    }

    const sourceType = req.query.source_type
    if (!sourceType) {
      return res.status(200).json({ message: 'Invalid sourceType', result: false, data: null })
    }

    const payouts = await prisma.payouts.findMany({
      where: {
        store_id: storeId,
        network: network,
        source_type: String(sourceType),
        external_payment_id: externalPaymentId,
        status: 1,
      },
      select: {
        chain_id: true,
        address: true,
        crypto: true,
        crypto_amount: true,
        currency: true,
        amount: true,
        payout_status: true,
        tx: true,
      },
      orderBy: {
        id: 'desc',
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: payouts.map((item) => ({
        chainId: item.chain_id,
        address: item.address,
        currency: item.currency,
        amount: item.amount,
        crypto: item.crypto,
        cryptoAmount: item.crypto_amount,
        payoutStatus: item.payout_status,
        tx: item.tx,
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
