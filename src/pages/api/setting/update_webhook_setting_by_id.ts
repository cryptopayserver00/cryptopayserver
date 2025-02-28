import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.payload_url !== undefined) updateData.payload_url = req.body.payload_url;
        if (req.body.secret !== undefined) updateData.secret = req.body.secret;
        if (req.body.automatic_redelivery !== undefined)
          updateData.automatic_redelivery = Number(req.body.automatic_redelivery);
        if (req.body.enabled !== undefined) updateData.enabled = Number(req.body.enabled);
        if (req.body.event_type !== undefined) updateData.event_type = Number(req.body.event_type);

        const webhook_setting = await prisma.webhook_settings.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!webhook_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
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
