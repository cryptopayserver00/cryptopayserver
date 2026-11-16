import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  rateLimit,
  requireAccountPassword,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'
import { verifyPayoutOnChain } from '@/lib/payout/verify-on-chain'

const ALLOWED_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  [PAYOUT_STATUS.AwaitingApproval]: new Set([
    PAYOUT_STATUS.AwaitingPayment,
    PAYOUT_STATUS.Cancelled,
  ]),
  [PAYOUT_STATUS.AwaitingPayment]: new Set([
    PAYOUT_STATUS.AwaitingApproval,
    PAYOUT_STATUS.InProgress,
    PAYOUT_STATUS.Completed,
    PAYOUT_STATUS.Cancelled,
  ]),
  [PAYOUT_STATUS.InProgress]: new Set([
    PAYOUT_STATUS.AwaitingPayment,
    PAYOUT_STATUS.Completed,
    PAYOUT_STATUS.Cancelled,
  ]),
  [PAYOUT_STATUS.Completed]: new Set(),
  [PAYOUT_STATUS.Cancelled]: new Set(),
}

function isPlausibleTxHash(txHash: string): boolean {
  if (!txHash || txHash.length < 16 || txHash.length > 128) return false
  return /^[a-zA-Z0-9:_-]+$/.test(txHash)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'payout-update', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const payoutId = Number(req.body.id)
    if (!payoutId) {
      return res.status(200).json({ message: 'Invalid payoutId', result: false, data: null })
    }

    const owned = await prisma.payouts.findFirst({
      where: {
        payout_id: payoutId,
        status: 1,
      },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ManagePayouts)) {
      return forbidden(res, 'Insufficient store permission')
    }

    const nextStatus = req.body.payout_status ? String(req.body.payout_status) : ''
    const tx = req.body.tx ? String(req.body.tx) : ''
    const updateData: { [key: string]: any } = {}

    if (nextStatus) {
      const allowed = ALLOWED_TRANSITIONS[owned.payout_status] || new Set<string>()
      if (!allowed.has(nextStatus)) {
        return res.status(200).json({
          message: `Invalid status transition from ${owned.payout_status} to ${nextStatus}`,
          result: false,
          data: null,
        })
      }
      updateData.payout_status = nextStatus
    }

    let statusAfter = updateData.payout_status || owned.payout_status

    // Completing a payout requires step-up + on-chain verification of the tx.
    if (statusAfter === PAYOUT_STATUS.Completed) {
      if (
        !(await requireAccountPassword(
          req,
          res,
          session.userId,
          req.body.account_password || req.body.password,
          'Account password required to complete payout'
        ))
      ) {
        return
      }

      const txHash = tx || String(owned.tx || '')
      if (!isPlausibleTxHash(txHash)) {
        return res.status(200).json({
          message: 'Valid transaction hash required to complete payout',
          result: false,
          data: null,
        })
      }

      const duplicate = await prisma.payouts.findFirst({
        where: {
          tx: txHash,
          status: 1,
          NOT: { payout_id: owned.payout_id },
        },
        select: { id: true },
      })
      if (duplicate) {
        return res.status(200).json({
          message: 'Transaction hash already used by another payout',
          result: false,
          data: null,
        })
      }

      let expectedAmount: number | null = null
      if (req.body.crypto_amount !== undefined && req.body.crypto_amount !== null && req.body.crypto_amount !== '') {
        const cryptoAmount = Number(req.body.crypto_amount)
        if (!cryptoAmount || cryptoAmount <= 0) {
          return res.status(200).json({ message: 'Invalid crypto amount', result: false, data: null })
        }
        expectedAmount = cryptoAmount
        updateData.crypto_amount = cryptoAmount
      } else if (owned.crypto_amount != null) {
        expectedAmount = Number(owned.crypto_amount)
      }

      const verified = await verifyPayoutOnChain({
        chainId: owned.chain_id,
        network: owned.network,
        txHash,
        destination: owned.address,
        crypto: owned.crypto,
        expectedAmount,
      })

      if (!verified.ok && verified.reason === 'mismatch') {
        return res.status(200).json({
          message: 'Transaction does not match payout destination/amount',
          result: false,
          data: null,
        })
      }

      if (!verified.ok && verified.reason === 'not_found') {
        // Tx just broadcast may not be indexed yet — park as InProgress with hash.
        updateData.payout_status = PAYOUT_STATUS.InProgress
        statusAfter = PAYOUT_STATUS.InProgress
      }

      updateData.tx = txHash
    }

    // Only attach a tx hash when completing or marking in-progress from a send flow.
    if (tx && statusAfter !== PAYOUT_STATUS.Completed && statusAfter !== PAYOUT_STATUS.InProgress) {
      return res.status(200).json({
        message: 'Transaction hash only allowed when completing or in progress',
        result: false,
        data: null,
      })
    }
    if (tx && statusAfter === PAYOUT_STATUS.InProgress && updateData.tx !== tx) {
      if (!isPlausibleTxHash(tx)) {
        return res.status(200).json({
          message: 'Invalid transaction hash',
          result: false,
          data: null,
        })
      }
      updateData.tx = tx
    }

    // Never let clients rewrite crypto_amount except when attaching a send tx.
    if (
      req.body.crypto_amount !== undefined &&
      req.body.crypto_amount !== null &&
      req.body.crypto_amount !== '' &&
      updateData.crypto_amount === undefined
    ) {
      if (!tx || (statusAfter !== PAYOUT_STATUS.Completed && statusAfter !== PAYOUT_STATUS.InProgress)) {
        return res.status(200).json({
          message: 'crypto_amount can only be set when completing or in progress with a transaction hash',
          result: false,
          data: null,
        })
      }
      const cryptoAmount = Number(req.body.crypto_amount)
      if (!cryptoAmount || cryptoAmount <= 0) {
        return res.status(200).json({ message: 'Invalid crypto amount', result: false, data: null })
      }
      updateData.crypto_amount = cryptoAmount
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: 'Nothing to update', result: false, data: null })
    }

    const payout = await prisma.payouts.update({
      data: updateData,
      where: {
        payout_id: owned.payout_id,
      },
    })

    if (
      payout.source_type === PAYOUT_SOURCE_TYPE.PullPayment &&
      payout.payout_status === PAYOUT_STATUS.Completed
    ) {
      const pull_payment = await prisma.pull_payments.findFirst({
        where: {
          pull_payment_id: payout.external_payment_id,
          user_id: access.ownerUserId,
          pull_payment_status: PULL_PAYMENT_STATUS.Active,
          status: 1,
        },
        select: {
          id: true,
          amount: true,
        },
      })

      if (pull_payment) {
        const payouts = await prisma.payouts.findMany({
          where: {
            external_payment_id: payout.external_payment_id,
            user_id: access.ownerUserId,
            payout_status: PAYOUT_STATUS.Completed,
            status: 1,
          },
          select: {
            amount: true,
          },
        })

        const settledAmount = payouts.reduce((sum, item) => sum + item.amount, 0)

        if (settledAmount >= pull_payment.amount) {
          await prisma.pull_payments.updateMany({
            data: {
              pull_payment_status: PULL_PAYMENT_STATUS.Settled,
            },
            where: {
              pull_payment_id: payout.external_payment_id,
              user_id: access.ownerUserId,
              pull_payment_status: PULL_PAYMENT_STATUS.Active,
              status: 1,
            },
          })
        }
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
