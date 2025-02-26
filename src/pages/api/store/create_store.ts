import type { NextApiRequest, NextApiResponse } from 'next';
import { CHAINS } from 'packages/constants/blockchain';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { NOTIFICATION, NOTIFICATIONS } from 'packages/constants';
import mysql from 'mysql2/promise';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const userId = req.body.user_id;
        const name = req.body.name;
        const currency = req.body.currency;
        const priceSource = req.body.price_source;
        const brandColor = '#000000';
        const website = req.body.website;

        const store = await prisma.stores.create({
          data: {
            user_id: userId,
            name: name,
            currency: currency,
            price_source: priceSource,
            brand_color: brandColor,
            website: website,
            logo_url: '',
            custom_css_url: '',
            allow_anyone_create_invoice: 1,
            add_additional_fee_to_invoice: 1,
            invoice_expires_if_not_paid_full_amount: 1,
            invoice_paid_less_than_precent: 10,
            minimum_expiraion_time_for_refund: 10,
            status: 1,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        // create notification setting
        let ids: number[] = [];
        NOTIFICATIONS.forEach(async (item: NOTIFICATION) => {
          ids.push(item.id);
        });
        const notification_setting = await prisma.notification_settings.create({
          data: {
            user_id: userId,
            store_id: store.id,
            notifications: ids.join(','),
            status: 1,
          },
        });

        if (!notification_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        // create payment setting for blockchain
        const chainValues = Object.values(CHAINS);
        const filteredChainValues = chainValues.filter((value) => typeof value === 'number');
        filteredChainValues.forEach(async (item) => {
          const payment_setting = await prisma.payment_settings.createMany({
            data: [
              {
                user_id: userId,
                chain_id: item,
                network: 1,
                store_id: store.id,
                payment_expire: 30,
                confirm_block: 1,
                show_recommended_fee: 1,
                current_used_address_id: 0,
                status: 1,
              },
              {
                user_id: userId,
                chain_id: item,
                network: 2,
                store_id: store.id,
                payment_expire: 30,
                confirm_block: 1,
                show_recommended_fee: 1,
                current_used_address_id: 0,
                status: 1,
              },
            ],
          });

          if (!payment_setting) {
            return res.status(200).json({ message: '', result: false, data: null });
          }
        });

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: store.id,
            name: store.name,
            currency: store.currency,
            price_source: store.price_source,
          },
        });

      // const createQuery =
      //   'INSERT INTO stores (user_id, name, currency, price_source, brand_color, website, allow_anyone_create_invoice, add_additional_fee_to_invoice, invoice_expires_if_not_paid_full_amount, invoice_paid_less_than_precent, minimum_expiraion_time_for_refund, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      // const createValues = [userId, name, currency, priceSource, brandColor, website, 1, 1, 1, 10, 10, 1];
      // const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
      // const storeId = ResultSetHeader.insertId;
      // if (storeId === 0) {
      //   return res.status(200).json({ message: '', result: false, data: null });
      // }

      // // create notification setting
      // const createNotificationSettingQuery =
      //   'INSERT INTO notification_settings (user_id, store_id, notifications, status) VALUES (?, ?, ?, ?)';
      // let ids: number[] = [];
      // NOTIFICATIONS.forEach(async (item: NOTIFICATION) => {
      //   ids.push(item.id);
      // });
      // const createNotificationSettingValues = [userId, storeId, ids.join(','), 1];
      // await connection.query(createNotificationSettingQuery, createNotificationSettingValues);

      // // create payment setting for blockchain
      // const chainValues = Object.values(CHAINS);
      // const filteredChainValues = chainValues.filter((value) => typeof value === 'number');
      // filteredChainValues.forEach(async (item) => {
      //   let createPaymentSettingQuery =
      //     'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      //   let createPaymentSettingValues = [userId, item, 1, storeId, 30, 1, 1, 1];
      //   await connection.query(createPaymentSettingQuery, createPaymentSettingValues);

      //   createPaymentSettingQuery =
      //     'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      //   createPaymentSettingValues = [userId, item, 2, storeId, 30, 1, 1, 1];
      //   await connection.query(createPaymentSettingQuery, createPaymentSettingValues);
      // });

      // const findQuery = 'SELECT * FROM stores where id = ? and status = ?';
      // const findValues = [storeId, 1];
      // const [rows] = await connection.query(findQuery, findValues);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;
      //   return res.status(200).json({
      //     message: '',
      //     result: true,
      //     data: {
      //       id: row.id,
      //       name: row.name,
      //       currency: row.currency,
      //       price_source: row.price_source,
      //     },
      //   });
      // }

      // return res.status(200).json({ message: '', result: false, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
