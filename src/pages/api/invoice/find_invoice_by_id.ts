import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const id = req.query.id;

        const invoice: any = await prisma.$queryRaw`
        SELECT invoices.*, node_own_transactions.hash, node_own_transactions.address, node_own_transactions.from_address, node_own_transactions.to_address, node_own_transactions.transact_type, node_own_transactions.block_timestamp
        FROM invoices
        LEFT JOIN node_own_transactions ON invoices.match_tx_id = node_own_transactions.id
        WHERE invoices.order_id = ${id} AND invoices.status = 1
      `;

        if (!invoice) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            order_id: invoice.order_id,
            amount: invoice.amount,
            buyer_email: invoice.buyer_email,
            crypto: invoice.crypto,
            currency: invoice.currency,
            description: invoice.description,
            destination_address: invoice.destination_address,
            metadata: invoice.metadata,
            notification_email: invoice.notification_email,
            notification_url: invoice.notification_url,
            order_status: invoice.order_status,
            paid: invoice.paid,
            payment_method: invoice.payment_method,
            created_date: invoice.created_date,
            expiration_date: invoice.expiration_date,
            rate: invoice.rate,
            chain_id: invoice.chain_id,
            crypto_amount: invoice.crypto_amount,
            from_address: invoice.from_address,
            to_address: invoice.to_address,
            hash: invoice.hash,
            block_timestamp: invoice.block_timestamp,
            network: invoice.network,
            source_type: invoice.source_type,
          },
        });

      // const query =
      //   'SELECT invoices.*, node_own_transactions.hash, node_own_transactions.address, node_own_transactions.from_address, node_own_transactions.to_address, node_own_transactions.transact_type, node_own_transactions.block_timestamp FROM invoices LEFT JOIN node_own_transactions ON invoices.match_tx_id = node_own_transactions.id WHERE invoices.order_id = ? and invoices.status = ?';
      // const values = [id, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       order_id: row.order_id,
      //       amount: row.amount,
      //       buyer_email: row.buyer_email,
      //       crypto: row.crypto,
      //       currency: row.currency,
      //       description: row.description,
      //       destination_address: row.destination_address,
      //       metadata: row.metadata,
      //       notification_email: row.notification_email,
      //       notification_url: row.notification_url,
      //       order_status: row.order_status,
      //       paid: row.paid,
      //       payment_method: row.payment_method,
      //       created_date: row.created_date,
      //       expiration_date: row.expiration_date,
      //       rate: row.rate,
      //       chain_id: row.chain_id,
      //       crypto_amount: row.crypto_amount,
      //       from_address: row.from_address,
      //       to_address: row.to_address,
      //       hash: row.hash,
      //       block_timestamp: row.block_timestamp,
      //       network: row.network,
      //       source_type: row.source_type,
      //     },
      //   });
      // }

      // return res.status(200).json({ message: 'Something wrong', result: false, data: null });

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
