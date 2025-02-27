import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;
        const priceSource = req.body.price_source;
        const brandColor = req.body.brand_color;
        const logoUrl = req.body.logo_url;
        const customCssUrl = req.body.custom_css_url;
        const currency = req.body.currency;
        const allowAnyoneCreateInvoice = req.body.allow_anyone_create_invoice;
        const addAdditionalFeeToInvoice = req.body.add_additional_fee_to_invoice;
        const invoiceExpiresIfNotPaidFullAmount = req.body.invoice_expires_if_not_paid_full_amount;
        const invoicePaidLessThanPrecent = req.body.invoice_paid_less_than_precent;
        const minimumExpiraionTimeForRefund = req.body.minimum_expiraion_time_for_refund;

        const store = await prisma.stores.update({
          data: {
            price_source: priceSource,
            brand_color: brandColor,
            logo_url: logoUrl,
            custom_css_url: customCssUrl,
            currency: currency,
            allow_anyone_create_invoice: allowAnyoneCreateInvoice,
            add_additional_fee_to_invoice: addAdditionalFeeToInvoice,
            invoice_expires_if_not_paid_full_amount: invoiceExpiresIfNotPaidFullAmount,
            invoice_paid_less_than_precent: invoicePaidLessThanPrecent,
            minimum_expiraion_time_for_refund: minimumExpiraionTimeForRefund,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
