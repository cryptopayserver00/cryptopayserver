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

        if (req.body.trigger !== undefined) updateData.trigger = Number(req.body.trigger);
        if (req.body.recipients !== undefined) updateData.recipients = req.body.recipients;
        if (req.body.show_send_to_buyer !== undefined)
          updateData.show_send_to_buyer = Number(req.body.show_send_to_buyer);
        if (req.body.subject !== undefined) updateData.subject = req.body.subject;
        if (req.body.body !== undefined) updateData.body = req.body.body;

        const email_rule_setting = await prisma.email_rule_settings.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!email_rule_setting) {
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
