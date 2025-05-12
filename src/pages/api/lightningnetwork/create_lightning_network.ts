import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { LIGHTNING } from 'packages/lightning';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const network = req.body.network;
        const text = req.body.text;

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

        const find_wallet_lightning_network = await prisma.wallet_lightning_networks.findFirst({
          where: {
            user_id: userId,
            store_id: storeId,
            kind: type,
            server: server,
            status: 1,
          },
        });
        if (find_wallet_lightning_network) {
          // update
          const update_wallet_lightning_network = await prisma.wallet_lightning_networks.findFirst({
            where: {
              id: find_wallet_lightning_network.id,
              server: server,
              status: 1,
            },
          });

          if (!update_wallet_lightning_network) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          return res.status(200).json({ message: '', result: true, data: null });
        }

        const [isAuthorized, data] = await LIGHTNING.testConnection(type as LIGHTNINGNAME, server);
        if (!isAuthorized) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        let id = 0;

        switch (type) {
          case LIGHTNINGNAME.BLINK:
            break;
          case LIGHTNINGNAME.CLIGHTNING:
            break;
          case LIGHTNINGNAME.LNBITS:
            break;
          case LIGHTNINGNAME.LND:
            break;
          case LIGHTNINGNAME.LNDHUB:
            const wallet_lightning_network = await prisma.wallet_lightning_networks.create({
              data: {
                user_id: userId,
                store_id: storeId,
                kind: LIGHTNINGNAME.LNDHUB,
                server: server,
                access_token: data.accessToken,
                refresh_token: data.refreshToken,
                enabled: 1,
                status: 1,
              },
            });

            if (!wallet_lightning_network) {
              return res.status(200).json({ message: '', result: false, data: null });
            }
            id = wallet_lightning_network.id;
            break;
          case LIGHTNINGNAME.OPENNODE:
            break;
          default:
            return res.status(200).json({ message: '', result: false, data: null });
        }

        if (!id) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const wallet_lightning_network_setting = await prisma.wallet_lightning_network_settings.create({
          data: {
            lnd_id: id,
            user_id: userId,
            store_id: storeId,
            show_amount_satoshis: 2,
            show_hop_hint: 2,
            show_unify_url_and_qrcode: 2,
            show_lnurl: 1,
            show_lnurl_classic_mode: 1,
            show_allow_payee_pass_comment: 1,
            status: 1,
          },
        });

        if (!wallet_lightning_network_setting) {
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
