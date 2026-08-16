import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }

    const stores = await prisma.stores.findMany({
      where: {
        user_id: userId,
        status: 1,
      },
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: stores.map((item) => ({
        id: item.id,
        name: item.name,
        website: item.website,
        currency: item.currency,
        brandColor: item.brand_color,
        logoUrl: item.logo_url,
        customCssUrl: item.custom_css_url,
        allowAnyoneCreateInvoice: item.allow_anyone_create_invoice,
        add_additionalFeeToInvoice: item.add_additional_fee_to_invoice,
        invoice_expiresIfNotPaidFullAmount: item.invoice_expires_if_not_paid_full_amount,
        invoicePaidLessThanPrecent: item.invoice_paid_less_than_precent,
        minimumExpiraionTimeForRefund: item.minimum_expiraion_time_for_refund,
        priceSource: item.price_source,
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
