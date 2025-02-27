import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const id = req.query.id;

        const store = await prisma.stores.findFirst({
          where: {
            id: Number(id),
            status: 1,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: store.id,
            name: store.name,
            website: store.website,
            currency: store.currency,
            brand_color: store.brand_color,
            logo_url: store.logo_url,
            custom_css_url: store.custom_css_url,
            allow_anyone_create_invoice: store.allow_anyone_create_invoice,
            add_additional_fee_to_invoice: store.add_additional_fee_to_invoice,
            invoice_expires_if_not_paid_full_amount: store.invoice_expires_if_not_paid_full_amount,
            invoice_paid_less_than_precent: store.invoice_paid_less_than_precent,
            minimum_expiraion_time_for_refund: store.minimum_expiraion_time_for_refund,
            price_source: store.price_source,
          },
        });

      case 'POST':
        break;
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
