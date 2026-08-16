import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const id = Number(req.query.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    const store = await prisma.stores.findFirst({
      where: {
        id: id,
        status: 1,
      },
    })

    if (!store) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        id: store.id,
        name: store.name,
        website: store.website,
        currency: store.currency,
        brandColor: store.brand_color,
        logoUrl: store.logo_url,
        customCssUrl: store.custom_css_url,
        allowAnyoneCreateInvoice: store.allow_anyone_create_invoice,
        add_additionalFeeToInvoice: store.add_additional_fee_to_invoice,
        invoice_expiresIfNotPaidFullAmount: store.invoice_expires_if_not_paid_full_amount,
        invoicePaidLessThanPrecent: store.invoice_paid_less_than_precent,
        minimumExpiraionTimeForRefund: store.minimum_expiraion_time_for_refund,
        priceSource: store.price_source,
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
