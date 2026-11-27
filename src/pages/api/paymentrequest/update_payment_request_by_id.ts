import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { PAYMENT_REQUEST_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import { BigIsPositive, FormatCryptoAmount } from '@/utils/number'
import {
  rateLimit,
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

const ALLOWED_STATUS_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  [PAYMENT_REQUEST_STATUS.Pending]: new Set([PAYMENT_REQUEST_STATUS.Archived]),
  [PAYMENT_REQUEST_STATUS.Expired]: new Set([PAYMENT_REQUEST_STATUS.Archived]),
  [PAYMENT_REQUEST_STATUS.Settled]: new Set([PAYMENT_REQUEST_STATUS.Archived]),
  [PAYMENT_REQUEST_STATUS.Archived]: new Set(),
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rl-update_payment_request_by_id', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const paymentRequestId = Number(req.body.id)
    if (!paymentRequestId) {
      return res
        .status(200)
        .json({ message: 'Invalid paymentRequestId', result: false, data: null })
    }

    const existing = await prisma.payment_requests.findFirst({
      where: { id: paymentRequestId, status: 1 },
      select: {
        id: true,
        store_id: true,
        payment_request_status: true,
        amount: true,
      },
    })
    if (!existing) {
      return forbidden(res)
    }

    const access = await getStoreAccess(existing.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyPaymentRequests)) {
      return forbidden(res, 'Insufficient store permission')
    }

    let updateData: { [key: string]: any } = {}

    const isPending = existing.payment_request_status === PAYMENT_REQUEST_STATUS.Pending

    if (req.body.title) {
      if (!isPending) {
        return res.status(200).json({
          message: 'Only Pending payment requests can edit details',
          result: false,
          data: null,
        })
      }
      updateData.title = String(req.body.title).slice(0, 200)
    }
    if (req.body.currency) {
      if (!isPending) {
        return res.status(200).json({
          message: 'Only Pending payment requests can edit details',
          result: false,
          data: null,
        })
      }
      updateData.currency = req.body.currency
    }
    if (req.body.show_allow_custom_amount) {
      if (!isPending) {
        return res.status(200).json({
          message: 'Only Pending payment requests can edit details',
          result: false,
          data: null,
        })
      }
      updateData.show_allow_custom_amount = Number(req.body.show_allow_custom_amount)
    }
    if (req.body.expiration_date) {
      if (!isPending) {
        return res.status(200).json({
          message: 'Only Pending payment requests can edit details',
          result: false,
          data: null,
        })
      }
      updateData.expiration_date = req.body.expiration_date
    }
    if (req.body.email) {
      if (!isPending) {
        return res.status(200).json({
          message: 'Only Pending payment requests can edit details',
          result: false,
          data: null,
        })
      }
      updateData.email = req.body.email
    }
    if (req.body.request_customer_data) {
      if (!isPending) {
        return res.status(200).json({
          message: 'Only Pending payment requests can edit details',
          result: false,
          data: null,
        })
      }
      updateData.request_customer_data = req.body.request_customer_data
    }
    if (req.body.memo) {
      if (!isPending) {
        return res.status(200).json({
          message: 'Only Pending payment requests can edit details',
          result: false,
          data: null,
        })
      }
      updateData.memo = String(req.body.memo).slice(0, 5000)
    }

    if (req.body.amount !== undefined && req.body.amount !== null && req.body.amount !== '') {
      if (!isPending) {
        return res.status(200).json({
          message: 'Amount can only be changed while Pending',
          result: false,
          data: null,
        })
      }
      if (!BigIsPositive(req.body.amount)) {
        return res.status(200).json({ message: 'Invalid amount', result: false, data: null })
      }
      updateData.amount = Number(FormatCryptoAmount(req.body.amount, 12))
    }

    if (req.body.payment_request_status) {
      const nextStatus = String(req.body.payment_request_status)
      const allowed = ALLOWED_STATUS_TRANSITIONS[existing.payment_request_status] || new Set<string>()
      if (!allowed.has(nextStatus)) {
        return res.status(200).json({
          message: `Invalid status transition from ${existing.payment_request_status} to ${nextStatus}`,
          result: false,
          data: null,
        })
      }
      updateData.payment_request_status = nextStatus
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: 'Nothing to update', result: false, data: null })
    }

    const result = await prisma.payment_requests.updateMany({
      data: updateData,
      where: {
        id: paymentRequestId,
        user_id: access.ownerUserId,
        status: 1,
      },
    })

    if (result.count === 0) {
      return forbidden(res, 'Invalid update')
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
