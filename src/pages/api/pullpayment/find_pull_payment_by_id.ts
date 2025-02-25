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
        const pullPaymentId = req.query.id;

        const pull_payments = await prisma.pull_payments.findFirst({
          where: {
            pull_payment_id: typeof pullPaymentId === 'number' ? pullPaymentId : 0,
            status: 1,
          },
        });

        if (!pull_payments) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            user_id: pull_payments.user_id,
            store_id: pull_payments.store_id,
            network: pull_payments.network,
            pull_payment_id: pull_payments.pull_payment_id,
            name: pull_payments.name,
            amount: pull_payments.amount,
            currency: pull_payments.currency,
            description: pull_payments.description,
            show_auto_approve_claim: pull_payments.show_auto_approve_claim,
            created_date: pull_payments.created_at,
            expiration_date: pull_payments.expiration_at,
            pull_payment_status: pull_payments.pull_payment_status,
          },
        });

      // const query = 'SELECT * FROM pull_payments where pull_payment_id = ? and status = ? ';
      // const values = [pullPaymentId, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;

      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       user_id: row.user_id,
      //       store_id: row.store_id,
      //       network: row.network,
      //       pull_payment_id: row.pull_payment_id,
      //       title: row.title,
      //       amount: row.amount,
      //       currency: row.currency,
      //       description: row.description,
      //       show_auto_approve_claim: row.show_auto_approve_claim,
      //       created_date: row.created_date,
      //       expiration_date: row.expiration_date,
      //       pull_payment_status: row.pull_payment_status,
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
