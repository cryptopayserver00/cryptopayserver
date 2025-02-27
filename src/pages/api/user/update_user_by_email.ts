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

        const username = req.body.username;
        const profilePictureUrl = req.body.profile_picture_url;
        const authenticator = req.body.authenticator;
        const emptyAuthenticator = req.body.empty_authenticator;

        const user = await prisma.users.update({
          where: {
            email: email,
            status: 1,
          },
          data: {
            username: username,
            profile_picture_url: profilePictureUrl,
            authenticator: emptyAuthenticator === 1 ? '' : authenticator,
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
