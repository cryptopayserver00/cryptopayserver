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

        let updateData: { [key: string]: any } = {};

        if (req.body.price_source !== undefined) updateData.price_source = req.body.price_source;
        if (req.body.brand_color !== undefined) updateData.brand_color = req.body.brand_color;
        if (req.body.logo_url !== undefined) updateData.logo_url = req.body.logo_url;
        if (req.body.custom_css_url !== undefined) updateData.custom_css_url = req.body.custom_css_url;
        if (req.body.currency !== undefined) updateData.currency = req.body.currency;
        if (req.body.allow_anyone_create_invoice !== undefined)
          updateData.allow_anyone_create_invoice = Number(req.body.allow_anyone_create_invoice);
        if (req.body.add_additional_fee_to_invoice !== undefined)
          updateData.add_additional_fee_to_invoice = Number(req.body.add_additional_fee_to_invoice);
        if (req.body.invoice_expires_if_not_paid_full_amount !== undefined)
          updateData.invoice_expires_if_not_paid_full_amount = Number(req.body.invoice_expires_if_not_paid_full_amount);
        if (req.body.invoice_paid_less_than_precent !== undefined)
          updateData.invoice_paid_less_than_precent = Number(req.body.invoice_paid_less_than_precent);
        if (req.body.minimum_expiraion_time_for_refund !== undefined)
          updateData.minimum_expiraion_time_for_refund = Number(req.body.minimum_expiraion_time_for_refund);

        const store = await prisma.stores.update({
          data: updateData,
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
