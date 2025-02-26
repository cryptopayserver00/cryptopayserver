import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;

        const payloadUrl = req.body.payload_url;
        const secret = req.body.secret;
        const showAutomaticRedelivery = req.body.automatic_redelivery;
        const showEnabled = req.body.enabled;
        const eventType = req.body.event_type;

        const webhook_setting = await prisma.webhook_settings.create({
          data: {
            user_id: userId,
            store_id: storeId,
            payload_url: payloadUrl,
            secret: secret,
            automatic_redelivery: showAutomaticRedelivery,
            enabled: showEnabled,
            event_type: eventType,
            status: 1,
          },
        });

        if (webhook_setting) {
          return res.status(200).json({
            message: '',
            result: true,
            data: {
              id: webhook_setting.id,
            },
          });
        } else {
          return res.status(200).json({
            message: '',
            result: false,
            data: null,
          });
        }

      // const createQuery =
      //   'INSERT INTO webhook_settings (user_id, store_id, payload_url, secret, automatic_redelivery, enabled, event_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      // const createValues = [userId, storeId, payloadUrl, secret, showAutomaticRedelivery, showEnabled, eventType, 1];
      // const [ResultSetHeader]: any = await connection.query(createQuery, createValues);
      // const id = ResultSetHeader.insertId;
      // if (id === 0) {
      //   return res.status(200).json({ message: 'Something wrong', result: false, data: null });
      // }

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: {
      //     id: id,
      //   },
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
