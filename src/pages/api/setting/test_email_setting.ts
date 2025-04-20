import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { EMAIL } from 'utils/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const userId = req.query.user_id;
        const email = req.query.email;

        const email_setting = await prisma.email_settings.findFirst({
          where: {
            store_id: Number(storeId),
            user_id: Number(userId),
            status: 1,
          },
        });

        if (!email_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const subject = 'Test Email';
        const text = 'This is a test email.';

        const result = await EMAIL.sendEmailCore(
          email_setting.smtp_server,
          email_setting.port,
          email_setting.show_tls === 1 ? true : false,
          email_setting.login,
          email_setting.password,
          email_setting.sender_email,
          String(email),
          subject,
          text,
        );

        if (result) {
          return res.status(200).json({ message: '', result: true, data: null });
        } else {
          return res.status(200).json({ message: '', result: false, data: null });
        }

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
