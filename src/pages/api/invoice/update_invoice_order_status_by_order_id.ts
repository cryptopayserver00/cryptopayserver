import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { ORDER_STATUS } from '@/packages/constants'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  forbidden,
  getStoreAccess,
  requireAuth,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'rl-update_invoice_order_status_by_order_', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const orderId = Number(req.body.order_id)
    if (!orderId) {
      return res.status(200).json({ message: 'Invalid orderId', result: false, data: null })
    }

    const orderStatus = req.body.order_status
    if (!orderStatus) {
      return res.status(200).json({ message: 'Invalid orderStatus', result: false, data: null })
    }

    const existing = await prisma.invoices.findFirst({
      where: {
        order_id: orderId,
        status: 1,
      },
      select: {
        id: true,
        user_id: true,
        store_id: true,
        order_id: true,
      },
    })

    if (!existing) {
      return res.status(200).json({ message: 'Cannot find invoice', result: false, data: null })
    }

    const access = await getStoreAccess(existing.store_id, session.userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyInvoices)) {
      return forbidden(res, 'Insufficient store permission')
    }

    if (orderStatus === ORDER_STATUS.Invalid) {
      const invoice = await prisma.invoices.update({
        where: {
          order_id: existing.order_id,
        },
        data: {
          order_status: orderStatus,
        },
      })

      const invoiceEventMessage = `Invoice ${orderId} new event: invoice_invalid`

      await prisma.invoice_events.create({
        data: {
          invoice_id: invoice.id,
          order_id: invoice.order_id,
          message: invoiceEventMessage,
          status: 1,
        },
      })

      return res.status(200).json({ message: '', result: true, data: null })
    }

    return res.status(200).json({ message: '', result: false, data: null })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
