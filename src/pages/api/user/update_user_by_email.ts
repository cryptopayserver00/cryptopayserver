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

      // let updateQuery = 'UPDATE users SET ';
      // let updateValues = [];
      // if (username) {
      //   updateQuery += 'username = ?,';
      //   updateValues.push(username);
      // }
      // if (profilePictureUrl) {
      //   updateQuery += 'profile_picture_url = ?,';
      //   updateValues.push(profilePictureUrl);
      // }

      // if (emptyAuthenticator === 1) {
      //   updateQuery += 'authenticator = ?,';
      //   updateValues.push('');
      // } else if (authenticator) {
      //   updateQuery += 'authenticator = ?,';
      //   updateValues.push(authenticator);
      // }

      // updateQuery = updateQuery.slice(0, -1);

      // updateQuery += ' WHERE email = ? and status = ?';
      // updateValues.push(email, 1);

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
