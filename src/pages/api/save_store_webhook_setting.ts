import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '.';
import { BLOCKSCAN, BlockScanWalletType } from 'packages/web3/block_scan';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;

        const payloadUrl = req.body.payload_url;
        const secret = req.body.secret;
        const showAutomaticRedelivery = req.body.automatic_redelivery;
        const showEnabled = req.body.enabled;
        const eventType = req.body.event_type;

        const createQuery =
          'INSERT INTO webhook_settings (user_id, store_id, payload_url, secret, automatic_redelivery, enabled, event_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const createValues = [userId, storeId, payloadUrl, secret, showAutomaticRedelivery, showEnabled, eventType, 1];
        const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
        const walletId = ResultSetHeader.insertId;
        if (walletId === 0) {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the webhook', result: false, data: e });
  }
}