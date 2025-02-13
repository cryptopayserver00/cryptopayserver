import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const id = req.query.id;

        const query = 'SELECT * FROM stores where id = ? and status = ? ';
        const values = [id, 1];
        const [rows] = await connection.query(query, values);
        if (Array.isArray(rows) && rows.length === 1) {
          const row = rows[0] as mysql.RowDataPacket;
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: row.id,
              name: row.name,
              website: row.website,
              currency: row.currency,
              brand_color: row.brand_color,
              logo_url: row.logo_url,
              custom_css_url: row.custom_css_url,
              allow_anyone_create_invoice: row.allow_anyone_create_invoice,
              add_additional_fee_to_invoice: row.add_additional_fee_to_invoice,
              invoice_expires_if_not_paid_full_amount: row.invoice_expires_if_not_paid_full_amount,
              invoice_paid_less_than_precent: row.invoice_paid_less_than_precent,
              minimum_expiraion_time_for_refund: row.minimum_expiraion_time_for_refund,
              price_source: row.price_source,
            },
          });
        }

        return res.status(200).json({ message: 'Something wrong', result: false, data: null });

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
