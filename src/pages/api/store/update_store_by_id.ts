import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
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

        let updateQuery = 'UPDATE stores SET ';
        let updateValues = [];
        if (priceSource) {
          updateQuery += 'price_source = ?,';
          updateValues.push(priceSource);
        }
        if (brandColor) {
          updateQuery += 'brand_color = ?,';
          updateValues.push(brandColor);
        }
        if (logoUrl) {
          updateQuery += 'logo_url = ?,';
          updateValues.push(logoUrl);
        }
        if (customCssUrl) {
          updateQuery += 'custom_css_url = ?,';
          updateValues.push(customCssUrl);
        }

        if (currency) {
          updateQuery += 'currency = ?,';
          updateValues.push(currency);
        }
        if (allowAnyoneCreateInvoice) {
          updateQuery += 'allow_anyone_create_invoice = ?,';
          updateValues.push(allowAnyoneCreateInvoice);
        }
        if (addAdditionalFeeToInvoice) {
          updateQuery += 'add_additional_fee_to_invoice = ?,';
          updateValues.push(addAdditionalFeeToInvoice);
        }
        if (invoiceExpiresIfNotPaidFullAmount) {
          updateQuery += 'invoice_expires_if_not_paid_full_amount = ?,';
          updateValues.push(invoiceExpiresIfNotPaidFullAmount);
        }
        if (invoicePaidLessThanPrecent) {
          updateQuery += 'invoice_paid_less_than_precent = ?,';
          updateValues.push(invoicePaidLessThanPrecent);
        }
        if (minimumExpiraionTimeForRefund) {
          updateQuery += 'minimum_expiraion_time_for_refund = ?,';
          updateValues.push(minimumExpiraionTimeForRefund);
        }

        updateQuery = updateQuery.slice(0, -1);

        updateQuery += ' WHERE id = ? and user_id = ? and status = ?';
        updateValues.push(storeId, userId, 1);

        await connection.query(updateQuery, updateValues);

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
