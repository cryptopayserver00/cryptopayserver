import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GenerateOrderIDByTime } from '@/utils/number'
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/auth'
import { readAccessToken, verifyPublicResource } from '@/lib/security/public-token'
import { WEB3 } from '@/packages/web3'
import { CHAINS } from '@/packages/constants/blockchain'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    if (!rateLimit(req, res, { scope: 'ext-payout', limit: 30, windowMs: 15 * 60 * 1000 })) {
      return
    }

    const network = Number(req.body.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const chainId = Number(req.body.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const amount = Number(req.body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
    }

    const externalPaymentId = Number(req.body.external_payment_id)
    if (!externalPaymentId) {
      return res
        .status(200)
        .json({ message: 'Invalid externalPaymentId', result: false, data: null })
    }

    if (!verifyPublicResource('pull_payment', externalPaymentId, readAccessToken(req))) {
      return res
        .status(403)
        .json({ message: 'Invalid or missing access token', result: false, data: null })
    }

    const address = String(req.body.address || '')
    if (!address) {
      return res.status(200).json({ message: 'Invalid address', result: false, data: null })
    }

    const sourceType = req.body.source_type
    const currency = req.body.currency
    const crypto = req.body.crypto

    if (sourceType !== PAYOUT_SOURCE_TYPE.PullPayment) {
      return res.status(200).json({ message: 'Invalid source type', result: false, data: null })
    }

    const addressOk = await WEB3.checkAddress(network === 1, chainId as CHAINS, address)
    if (!addressOk) {
      return res.status(200).json({ message: 'Invalid chain address', result: false, data: null })
    }

    const payoutId = GenerateOrderIDByTime()

    // Serialize claim checks + insert so concurrent requests cannot over-claim.
    const result = await prisma.$transaction(async (tx) => {
      const pull_payment = await tx.pull_payments.findFirst({
        where: {
          pull_payment_id: externalPaymentId,
          status: 1,
        },
        select: {
          user_id: true,
          store_id: true,
          network: true,
          currency: true,
          amount: true,
          show_auto_approve_claim: true,
          expiration_at: true,
          pull_payment_status: true,
        },
      })

      if (!pull_payment) {
        return { error: 'Invalid find' as const }
      }

      const store = await tx.stores.findFirst({
        where: { id: pull_payment.store_id, status: 1 },
        select: { id: true },
      })
      if (!store) {
        return { error: 'Store unavailable' as const }
      }

      if (pull_payment.pull_payment_status !== PULL_PAYMENT_STATUS.Active) {
        return { error: 'Pull payment not active' as const }
      }

      if (
        pull_payment.expiration_at &&
        new Date(pull_payment.expiration_at).getTime() < Date.now()
      ) {
        return { error: 'Pull payment expired' as const }
      }

      if (network !== pull_payment.network) {
        return { error: 'Invalid network' as const }
      }

      if (currency && currency !== pull_payment.currency) {
        return { error: 'Invalid currency' as const }
      }

      const claimed = await tx.payouts.aggregate({
        where: {
          external_payment_id: externalPaymentId,
          source_type: PAYOUT_SOURCE_TYPE.PullPayment,
          status: 1,
          NOT: { payout_status: PAYOUT_STATUS.Cancelled },
        },
        _sum: { amount: true },
      })
      const poolAmount = Number(pull_payment.amount)
      if (!Number.isFinite(poolAmount) || poolAmount <= 0) {
        return { error: 'Invalid pull payment amount' as const }
      }
      const claimedTotal = Number(claimed._sum.amount || 0)
      if (!Number.isFinite(claimedTotal) || claimedTotal < 0) {
        return { error: 'Invalid claimed total' as const }
      }
      const remaining = poolAmount - claimedTotal
      if (!Number.isFinite(remaining) || amount > remaining + 1e-12) {
        return { error: 'Amount exceeds remaining pull payment balance' as const }
      }

      const payoutStatus =
        pull_payment.show_auto_approve_claim === 1
          ? PAYOUT_STATUS.AwaitingPayment
          : PAYOUT_STATUS.AwaitingApproval

      const payout = await tx.payouts.create({
        data: {
          user_id: pull_payment.user_id,
          store_id: pull_payment.store_id,
          network: network,
          chain_id: chainId,
          payout_id: payoutId,
          address: address,
          source_type: sourceType,
          currency: currency,
          amount: Number(amount),
          crypto: crypto,
          external_payment_id: externalPaymentId,
          payout_status: payoutStatus,
          status: 1,
        },
      })

      return { payout }
    })

    if ('error' in result) {
      return res.status(200).json({ message: result.error, result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: result.payout.id,
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
