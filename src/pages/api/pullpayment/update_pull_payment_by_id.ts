import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAccountPassword,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

const ALLOWED_STATUS_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  [PULL_PAYMENT_STATUS.Active]: new Set([PULL_PAYMENT_STATUS.Archived]),
  [PULL_PAYMENT_STATUS.Future]: new Set([
    PULL_PAYMENT_STATUS.Active,
    PULL_PAYMENT_STATUS.Archived,
  ]),
  [PULL_PAYMENT_STATUS.Expired]: new Set([PULL_PAYMENT_STATUS.Archived]),
  [PULL_PAYMENT_STATUS.Settled]: new Set([PULL_PAYMENT_STATUS.Archived]),
  [PULL_PAYMENT_STATUS.Archived]: new Set(),
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    const pullPaymentId = Number(req.body.id)
    if (!pullPaymentId) {
      return res.status(200).json({ message: 'Invalid pullPaymentId', result: false, data: null })
    }

    const owned = await prisma.pull_payments.findFirst({
      where: {
        pull_payment_id: pullPaymentId,
        status: 1,
      },
      select: {
        id: true,
        pull_payment_id: true,
        store_id: true,
        amount: true,
        pull_payment_status: true,
      },
    })
    if (!owned) {
      return forbidden(res)
    }

    const access = await getStoreAccess(owned.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ManagePullPayments)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.name) updateData.name = String(req.body.name).slice(0, 200)
    if (req.body.currency) updateData.currency = req.body.currency
    if (req.body.show_auto_approve_claim)
      updateData.show_auto_approve_claim = Number(req.body.show_auto_approve_claim)
    if (req.body.description) updateData.description = String(req.body.description).slice(0, 5000)
    if (req.body.payout_method) updateData.payout_method = req.body.payout_method

    if (req.body.amount !== undefined && req.body.amount !== null && req.body.amount !== '') {
      if (owned.pull_payment_status !== PULL_PAYMENT_STATUS.Active &&
          owned.pull_payment_status !== PULL_PAYMENT_STATUS.Future) {
        return res.status(200).json({
          message: 'Amount can only be changed while Active or Future',
          result: false,
          data: null,
        })
      }
      const nextAmount = Number(req.body.amount)
      if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
        return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
      }

      const claimed = await prisma.payouts.findMany({
        where: {
          external_payment_id: owned.pull_payment_id,
          source_type: PAYOUT_SOURCE_TYPE.PullPayment,
          user_id: access.ownerUserId,
          status: 1,
          payout_status: {
            notIn: [PAYOUT_STATUS.Cancelled],
          },
        },
        select: { amount: true },
      })
      const claimedTotal = claimed.reduce((sum, item) => sum + Number(item.amount || 0), 0)
      if (nextAmount + 1e-12 < claimedTotal) {
        return res.status(200).json({
          message: 'Amount cannot be below already claimed total',
          result: false,
          data: null,
        })
      }
      updateData.amount = nextAmount
    }

    if (req.body.pull_payment_status) {
      const nextStatus = String(req.body.pull_payment_status)
      const allowed = ALLOWED_STATUS_TRANSITIONS[owned.pull_payment_status] || new Set<string>()
      if (!allowed.has(nextStatus)) {
        return res.status(200).json({
          message: `Invalid status transition from ${owned.pull_payment_status} to ${nextStatus}`,
          result: false,
          data: null,
        })
      }
      if (nextStatus === PULL_PAYMENT_STATUS.Archived) {
        if (
          !(await requireAccountPassword(
            res,
            session.userId,
            req.body.account_password || req.body.password,
            'Account password required to archive pull payment'
          ))
        ) {
          return
        }
      }
      updateData.pull_payment_status = nextStatus
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: 'Nothing to update', result: false, data: null })
    }

    await prisma.pull_payments.update({
      data: updateData,
      where: {
        pull_payment_id: owned.pull_payment_id,
      },
    })

    if (updateData.pull_payment_status === PULL_PAYMENT_STATUS.Archived) {
      await prisma.payouts.updateMany({
        data: {
          payout_status: PAYOUT_STATUS.Cancelled,
        },
        where: {
          external_payment_id: pullPaymentId,
          source_type: PAYOUT_SOURCE_TYPE.PullPayment,
          user_id: access.ownerUserId,
          status: 1,
          payout_status: {
            in: [PAYOUT_STATUS.AwaitingApproval, PAYOUT_STATUS.AwaitingPayment],
          },
        },
      })
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
