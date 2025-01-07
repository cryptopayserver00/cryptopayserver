import type { NextApiRequest, NextApiResponse } from 'next';
import { CHAINS } from 'packages/constants/blockchain';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

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

        const createQuery = 'INSERT INTO stores (user_id, name, currency, price_source, status) VALUES (?, ?, ?, ?, ?)';
        const createValues = [userId, name, currency, priceSource, 1];
        const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
        const storeId = ResultSetHeader.insertId;
        if (storeId === 0) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        // create payment setting for btc chain
        let createPaymentSettingQuery =
          'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee) VALUES (?, ?, ?, ?, ?, ?, ?)';
        let createPaymentSettingValues = [userId, CHAINS.BITCOIN, 1, storeId, 30, 1, 1];
        await connection.query(createPaymentSettingQuery, createPaymentSettingValues);

        createPaymentSettingQuery =
          'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee) VALUES (?, ?, ?, ?, ?, ?, ?)';
        createPaymentSettingValues = [userId, CHAINS.BITCOIN, 2, storeId, 30, 1, 1];
        await connection.query(createPaymentSettingQuery, createPaymentSettingValues);

        // create payment setting for eth chain
        createPaymentSettingQuery =
          'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee) VALUES (?, ?, ?, ?, ?, ?, ?)';
        createPaymentSettingValues = [userId, CHAINS.ETHEREUM, 1, storeId, 30, 1, 1];
        await connection.query(createPaymentSettingQuery, createPaymentSettingValues);

        createPaymentSettingQuery =
          'INSERT INTO payment_settings (user_id, chain_id, network, store_id, payment_expire, confirm_block, show_recommended_fee) VALUES (?, ?, ?, ?, ?, ?, ?)';
        createPaymentSettingValues = [userId, CHAINS.ETHEREUM, 2, storeId, 30, 1, 1];
        await connection.query(createPaymentSettingQuery, createPaymentSettingValues);

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
