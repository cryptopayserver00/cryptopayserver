import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { LIGHTNING } from 'packages/lightning';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const network = req.query.network;
        const storeId = req.query.storeId;
        const text = req.query.text;

        if (!text) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const values: Record<string, string> = {};
        String(text)
          .split(';')
          .forEach((line) => {
            const [key, value] = line.split('=');
            if (key && value) {
              values[key] = value;
            }
          });

        if (!values || !values['type'] || !values['server']) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const type = values['type'].toUpperCase();
        const server = values['server'];

        const [isAuthorized, _] = await LIGHTNING.testConnection(type as LIGHTNINGNAME, server);

        if (isAuthorized) {
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
