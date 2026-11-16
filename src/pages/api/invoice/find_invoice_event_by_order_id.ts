import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'
import {
  forbidden,
  getStoreAccess,
  requireAuthUserId,
  STORE_PERMISSION,
  storeAccessHasPermission,
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return

    const orderId = Number(req.query.order_id)
    if (!orderId) {
      return res.status(200).json({ message: 'Invalid orderId', result: false, data: null })
    }

    const invoice = await prisma.invoices.findFirst({
      where: {
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
    if (
      !access ||
      (!storeAccessHasPermission(access, STORE_PERMISSION.ViewStores) &&
        !storeAccessHasPermission(access, STORE_PERMISSION.ModifyInvoices))
    ) {
      return forbidden(res)
    }

    const invoice_events = await prisma.invoice_events.findMany({
      where: {
        order_id: orderId,
        status: 1,
      },
      select: {
        id: true,
        message: true,
        created_at: true,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: invoice_events.map((item) => ({
        id: item.id,
        createdAt: item.created_at,
        message: item.message,
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
