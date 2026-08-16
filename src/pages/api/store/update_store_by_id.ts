import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.PUT) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const id = Number(req.body.id)
    if (!id) {
      return res.status(200).json({ message: 'Invalid id', result: false, data: null })
    }

    let updateData: { [key: string]: any } = {}

    if (req.body.price_source !== undefined) updateData.price_source = req.body.price_source
    if (req.body.brand_color !== undefined) updateData.brand_color = req.body.brand_color
    if (req.body.logo_url !== undefined) updateData.logo_url = req.body.logo_url
    if (req.body.custom_css_url !== undefined) updateData.custom_css_url = req.body.custom_css_url
    if (req.body.currency !== undefined) updateData.currency = req.body.currency
    if (req.body.allow_anyone_create_invoice !== undefined)
      updateData.allow_anyone_create_invoice = Number(req.body.allow_anyone_create_invoice)
    if (req.body.add_additional_fee_to_invoice !== undefined)
      updateData.add_additional_fee_to_invoice = Number(req.body.add_additional_fee_to_invoice)
    if (req.body.invoice_expires_if_not_paid_full_amount !== undefined)
      updateData.invoice_expires_if_not_paid_full_amount = Number(
        req.body.invoice_expires_if_not_paid_full_amount
      )
    if (req.body.invoice_paid_less_than_precent !== undefined)
      updateData.invoice_paid_less_than_precent = Number(req.body.invoice_paid_less_than_precent)
    if (req.body.minimum_expiraion_time_for_refund !== undefined)
      updateData.minimum_expiraion_time_for_refund = Number(
        req.body.minimum_expiraion_time_for_refund
      )

    await prisma.stores.update({
      data: updateData,
      where: {
        id: id,
        status: 1,
      },
    })

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
