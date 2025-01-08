import type { NextApiRequest, NextApiResponse } from 'next';
import { CHAINS } from 'packages/constants/blockchain';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { NOTIFICATION, NOTIFICATIONS } from 'packages/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const name = req.body.name;
        const currency = req.body.currency;
        const priceSource = req.body.price_source;
        const brandColor = '#000000';
        const website = req.body.website;

        const createQuery =
          'INSERT INTO stores (user_id, name, currency, price_source, brand_color, website, allow_anyone_create_invoice, add_additional_fee_to_invoice, invoice_expires_if_not_paid_full_amount, invoice_paid_less_than_precent, minimum_expiraion_time_for_refund, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const createValues = [userId, name, currency, priceSource, brandColor, website, 1, 1, 1, 10, 10, 1];
        const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
        const storeId = ResultSetHeader.insertId;
        if (storeId === 0) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        // create notification setting
        const createNotificationSettingQuery =
          'INSERT INTO notification_settings (user_id, store_id, notifications, status) VALUES (?, ?, ?, ?)';
        let ids: number[] = [];
        NOTIFICATIONS.forEach(async (item: NOTIFICATION) => {
          ids.push(item.id);
        });
        const createNotificationSettingValues = [userId, storeId, ids.join(','), 1];
        await connection.query(createNotificationSettingQuery, createNotificationSettingValues);

        // create payment setting for blockchain
        const chainValues = Object.values(CHAINS);
        const filteredChainValues = chainValues.filter((value) => typeof value === 'number');
        filteredChainValues.forEach(async (item) => {
          let createPaymentSettingQuery =
            'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
          let createPaymentSettingValues = [userId, item, 1, storeId, 30, 1, 1, 1];
          await connection.query(createPaymentSettingQuery, createPaymentSettingValues);

          createPaymentSettingQuery =
            'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
          createPaymentSettingValues = [userId, item, 2, storeId, 30, 1, 1, 1];
          await connection.query(createPaymentSettingQuery, createPaymentSettingValues);
        });

        const findQuery = 'SELECT * FROM stores where id = ? and status = ?';
        const findValues = [storeId, 1];
        const [rows] = await connection.query(findQuery, findValues);
        return res.status(200).json({ message: '', result: true, data: rows });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
