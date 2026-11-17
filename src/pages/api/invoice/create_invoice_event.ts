import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  rateLimit,
  forbidden,
  getStoreAccess,
  requireAuthUserId,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return

    if (!(await rateLimit(req, res, { scope: 'rl-create_invoice_event', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const invoiceId = Number(req.body.invoice_id)
    if (!invoiceId) {
      return res.status(200).json({ message: 'Invalid invoiceId', result: false, data: null })
    }

    const orderId = Number(req.body.order_id)
    if (!orderId) {
      return res.status(200).json({ message: 'Invalid orderId', result: false, data: null })
    }

    const message = req.body.message
    if (!message) {
      return res.status(200).json({ message: 'Invalid message', result: false, data: null })
    }

    const invoice = await prisma.invoices.findFirst({
      where: {
        id: invoiceId,
        order_id: orderId,
        status: 1,
      },
      select: {
        user_id: true,
        store_id: true,
      },
    })

    if (!invoice) {
      return res.status(200).json({ message: 'Invalid invoice', result: false, data: null })
    }

    const access = await getStoreAccess(invoice.store_id, userId)
    if (!access || !storeAccessHasPermission(access, STORE_PERMISSION.ModifyInvoices)) {
      return forbidden(res, 'Insufficient store permission')
    }

    const invoice_event = await prisma.invoice_events.create({
      data: {
        invoice_id: invoiceId,
        order_id: orderId,
        message: String(message).slice(0, 2000),
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: invoice_event.id,
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
