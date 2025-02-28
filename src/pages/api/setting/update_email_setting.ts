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

        if (req.body.smtp_server !== undefined) updateData.smtp_server = req.body.smtp_server;
        if (req.body.port !== undefined) updateData.port = Number(req.body.port);
        if (req.body.sender_email !== undefined) updateData.sender_email = req.body.sender_email;
        if (req.body.login !== undefined) updateData.login = req.body.login;
        if (req.body.password !== undefined) updateData.password = req.body.password;
        if (req.body.show_tls !== undefined) updateData.show_tls = Number(req.body.show_tls);

        const email_setting = await prisma.email_settings.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!email_setting) {
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
