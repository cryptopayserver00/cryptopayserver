import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;

        const smtpServer = req.body.smtp_server;
        const port = req.body.port;
        const senderEmail = req.body.sender_email;
        const login = req.body.login;
        const password = req.body.password;
        const showTls = req.body.show_tls;

        let updateQuery = 'UPDATE email_settings SET ';
        let updateValues = [];
        if (smtpServer) {
          updateQuery += 'smtp_server = ?,';
          updateValues.push(smtpServer);
        }
        if (port) {
          updateQuery += 'port = ?,';
          updateValues.push(port);
        }
        if (senderEmail) {
          updateQuery += 'sender_email = ?,';
          updateValues.push(senderEmail);
        }
        if (login) {
          updateQuery += 'login = ?,';
          updateValues.push(login);
        }
        if (password) {
          updateQuery += 'password = ?,';
          updateValues.push(password);
        }
        if (showTls) {
          updateQuery += 'show_tls = ?,';
          updateValues.push(showTls);
        }

        updateQuery = updateQuery.slice(0, -1);

        updateQuery += ' WHERE store_id = ? and user_id = ? and status = ?';
        updateValues.push(storeId, userId, 1);

        await connection.query(updateQuery, updateValues);

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
