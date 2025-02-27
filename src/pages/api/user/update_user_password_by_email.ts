import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const email = req.body.email;
        const oldPwd = req.body.old_password;
        const newPwd = req.body.new_password;

        const oldCryptoPassword = CryptoJS.SHA256(oldPwd).toString();
        const newCryptoPassword = CryptoJS.SHA256(newPwd).toString();

        const user = await prisma.users.update({
          data: {
            password: newCryptoPassword,
          },
          where: {
            email: email,
            password: oldCryptoPassword,
            status: 1,
          },
        });

        if (!user) {
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
