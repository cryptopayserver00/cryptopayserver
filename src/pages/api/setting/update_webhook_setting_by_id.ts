import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const id = req.body.id;

        const payloadUrl = req.body.payload_url;
        const secret = req.body.secret;
        const showAutomaticRedelivery = req.body.automatic_redelivery;
        const showEnabled = req.body.enabled;
        const eventType = req.body.event_type;

        const webhook_setting = await prisma.webhook_settings.update({
          data: {
            payload_url: payloadUrl,
            secret: secret,
            automatic_redelivery: showAutomaticRedelivery,
            enabled: showEnabled,
            event_type: eventType,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!webhook_setting) {
          return res.status(200).json({
            message: '',
            result: false,
            data: null,
          });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });

      // let updateQuery = 'UPDATE webhook_settings SET ';
      // let updateValues = [];
      // if (payloadUrl) {
      //   updateQuery += 'payload_url = ?,';
      //   updateValues.push(payloadUrl);
      // }
      // if (secret) {
      //   updateQuery += 'secret = ?,';
      //   updateValues.push(secret);
      // }
      // if (showAutomaticRedelivery) {
      //   updateQuery += 'automatic_redelivery = ?,';
      //   updateValues.push(showAutomaticRedelivery);
      // }
      // if (showEnabled) {
      //   updateQuery += 'enabled = ?,';
      //   updateValues.push(showEnabled);
      // }
      // if (eventType) {
      //   updateQuery += 'event_type = ?,';
      //   updateValues.push(eventType);
      // }

      // updateQuery = updateQuery.slice(0, -1);

      // updateQuery += ' WHERE id = ? and status = ?';
      // updateValues.push(id, 1);

      // await connection.query(updateQuery, updateValues);

      // return res.status(200).json({
      //   message: '',
      //   result: true,
      //   data: null,
      // });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
