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

        const smtpServer = req.body.smtp_server;
        const port = req.body.port;
        const senderEmail = req.body.sender_email;
        const login = req.body.login;
        const password = req.body.password;
        const showTls = req.body.show_tls;

        const email_setting = await prisma.email_settings.update({
          data: {
            smtp_server: smtpServer,
            port: port,
            sender_email: senderEmail,
            login: login,
            password: password,
            show_tls: showTls,
          },
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
