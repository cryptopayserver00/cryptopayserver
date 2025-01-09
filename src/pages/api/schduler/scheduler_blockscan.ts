import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { ORDER_STATUS } from 'packages/constants';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();

        const invoiceQuery = 'SELECT * FROM invoices where order_status = ? AND status = ?';
        const invoiceValues = [ORDER_STATUS.Processing, 1];
        const [invoiceRows] = await connection.query(invoiceQuery, invoiceValues);
        if (Array.isArray(invoiceRows) && invoiceRows.length > 0) {
          invoiceRows.forEach(async (item: any) => {
            const txQuery =
              'SELECT * FROM node_own_transactions where address = ? AND transact_type = ? AND token = ? AND amount = ? AND block_timestamp > ? AND status = ?';
            const txValues = [
              item.destination_address,
              'receive',
              item.crypto,
              item.crypto_amount,
              item.created_date,
              1,
            ];
            const [txRows] = await connection.query(txQuery, txValues);

            if (Array.isArray(txRows) && txRows.length === 1) {
              const txRow = txRows[0] as mysql.RowDataPacket;
              // update invoices
              const updateInvoiceQuery =
                'UPDATE invoices set order_status = ?, paid = ?, match_tx_id = ? where id = ? and order_status = ? and status = ?';
              const updateInvoiceValues = [ORDER_STATUS.Settled, 1, txRow.id, item.id, ORDER_STATUS.Processing, 1];
              await connection.query(updateInvoiceQuery, updateInvoiceValues);

              let invoiceEventMessage = `Monitor the transaction hash: ${txRow.hash}`;
              let invoiceEventCreateDate = new Date().getTime();
              let invoiceEventCreateQuery = `INSERT INTO invoice_events (invoice_id, order_id, message, created_date, status) VALUES (?, ?, ?, ?, ?)`;
              let invoiceEventCreateValues = [item.id, item.order_id, invoiceEventMessage, invoiceEventCreateDate, 1];
              await connection.query(invoiceEventCreateQuery, invoiceEventCreateValues);

              invoiceEventMessage = 'Invoice status is Settled';
              invoiceEventCreateDate = new Date().getTime();
              invoiceEventCreateQuery = `INSERT INTO invoice_events (invoice_id, order_id, message, created_date, status) VALUES (?, ?, ?, ?, ?)`;
              invoiceEventCreateValues = [item.id, item.order_id, invoiceEventMessage, invoiceEventCreateDate, 1];
              await connection.query(invoiceEventCreateQuery, invoiceEventCreateValues);
            }
          });
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
