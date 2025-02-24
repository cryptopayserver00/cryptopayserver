import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { ORDER_STATUS } from 'packages/constants';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const orderId = req.body.order_id;
        const orderStatus = req.body.order_status;

        if (orderStatus === ORDER_STATUS.Invalid) {
          const invoice = await prisma.invoices.update({
            where: {
              order_id: orderId,
              order_status: {
                not: orderStatus,
              },
              status: 1,
            },
            data: {
              order_status: orderStatus,
            },
          });

          if (!invoice) {
            return res.status(200).json({ message: 'Something wrong', result: false, data: null });
          }

          let invoiceEventMessage = `Invoice ${orderId} new event: invoice_invalid`;

          const invoice_event = await prisma.invoice_events.create({
            data: {
              invoice_id: invoice.id,
              order_id: invoice.order_id,
              message: invoiceEventMessage,
              created_at: new Date(),
              status: 1,
            },
          });

          if (invoice_event) {
            return res.status(200).json({ message: '', result: true, data: null });
          }

          // const query = 'UPDATE invoices set order_status = ? where order_id = ? and order_status != ? and status = ?';
          // const values = [orderStatus, orderId, ORDER_STATUS.Invalid, 1];
          // await connection.query(query, values);

          // const selectQuery = 'SELECT * FROM invoices where order_id = ? and status = ?';
          // const selectValues = [orderId, 1];
          // const [rows] = await connection.query(selectQuery, selectValues);
          // if (Array.isArray(rows) && rows.length === 1) {
          //   const row = rows[0] as mysql.RowDataPacket;

          //   let invoiceEventMessage = `Invoice ${orderId} new event: invoice_invalid`;
          //   let invoiceEventCreateDate = new Date().getTime();
          //   let invoiceEventCreateQuery = `INSERT INTO invoice_events (invoice_id, order_id, message, created_date, status) VALUES (?, ?, ?, ?, ?)`;
          //   let invoiceEventCreateValues = [row.id, row.order_id, invoiceEventMessage, invoiceEventCreateDate, 1];
          //   await connection.query(invoiceEventCreateQuery, invoiceEventCreateValues);

          //   return res.status(200).json({ message: '', result: true, data: null });
          // }
        }

        return res.status(200).json({ message: 'Something wrong', result: false, data: null });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
