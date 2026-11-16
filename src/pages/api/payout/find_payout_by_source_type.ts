import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYOUT_SOURCE_TYPE } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/auth'
import { readAccessToken, verifyPublicResource } from '@/lib/security/public-token'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!(await rateLimit(req, res, { scope: 'pub-find-payout-by-source-ty', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
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

    const sourceType = String(req.query.source_type || '')
    if (!sourceType) {
      return res.status(200).json({ message: 'Invalid sourceType', result: false, data: null })
    }

    // Derive store from pull payment — ignore client store_id.
    let storeId: number | null = null
    if (sourceType === PAYOUT_SOURCE_TYPE.PullPayment) {
      if (!verifyPublicResource('pull_payment', externalPaymentId, readAccessToken(req))) {
        return res
          .status(403)
          .json({ message: 'Invalid or missing access token', result: false, data: null })
      }
      const pullPayment = await prisma.pull_payments.findFirst({
        where: { pull_payment_id: externalPaymentId, status: 1 },
        select: { store_id: true, network: true },
      })
      if (!pullPayment || pullPayment.network !== network) {
        return res.status(200).json({ message: 'Invalid pull payment', result: false, data: null })
      }
      storeId = pullPayment.store_id
    } else {
      return res.status(200).json({ message: 'Invalid sourceType', result: false, data: null })
    }

    const payouts = await prisma.payouts.findMany({
      where: {
        store_id: storeId,
        network: network,
        source_type: sourceType,
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
