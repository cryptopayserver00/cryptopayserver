import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import CryptoJS from 'crypto-js';
import { PrismaClient } from '@prisma/client';

export default async function handle(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const walletId = req.body.wallet_id;
        const password = req.body.password;
        const cryptoPassword = password ? CryptoJS.SHA256(password).toString() : password;

        const wallet = await prisma.wallets.update({
          data: {
            password: cryptoPassword,
          },
          where: {
            id: walletId,
            status: 1,
          },
        });

        if (!wallet) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            is_backup: wallet.is_backup,
          },
        });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
