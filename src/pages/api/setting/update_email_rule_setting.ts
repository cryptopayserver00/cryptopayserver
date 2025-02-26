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
        const id = req.body.id;
        const tigger = req.body.tigger;
        const recipients = req.body.recipients;
        const showSendToBuyer = req.body.show_send_to_buyer;
        const subject = req.body.subject;
        const body = req.body.body;

        const email_rule_setting = await prisma.email_rule_settings.update({
          data: {
            tigger: tigger,
            recipients: recipients,
            show_send_to_buyer: showSendToBuyer,
            subject: subject,
            body: body,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!email_rule_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      // let updateQuery = 'UPDATE email_rule_settings SET ';
      // let updateValues = [];
      // if (tigger) {
      //   updateQuery += 'tigger = ?,';
      //   updateValues.push(tigger);
      // }
      // if (recipients) {
      //   updateQuery += 'recipients = ?,';
      //   updateValues.push(recipients);
      // }
      // if (showSendToBuyer) {
      //   updateQuery += 'show_send_to_buyer = ?,';
      //   updateValues.push(showSendToBuyer);
      // }
      // if (subject) {
      //   updateQuery += 'subject = ?,';
      //   updateValues.push(subject);
      // }
      // if (body) {
      //   updateQuery += 'body = ?,';
      //   updateValues.push(body);
      // }

      // updateQuery = updateQuery.slice(0, -1);

      // updateQuery += ' WHERE store_id = ? and user_id = ? and status = ?';
      // updateValues.push(storeId, userId, 1);

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
