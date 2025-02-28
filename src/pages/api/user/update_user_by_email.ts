import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const email = req.body.email;

        let updateData: { [key: string]: any } = {};

        if (req.body.username !== undefined) updateData.username = req.body.username;
        if (req.body.profile_picture_url !== undefined) updateData.profile_picture_url = req.body.profile_picture_url;
        if (req.body.authenticator !== undefined) updateData.authenticator = req.body.authenticator;

        const user = await prisma.users.update({
          data: updateData,
          where: {
            email: email,
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
