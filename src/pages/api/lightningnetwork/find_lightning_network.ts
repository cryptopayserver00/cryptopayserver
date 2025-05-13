import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { LNDHUB } from 'packages/lightning/core/lndhub';
import { LIGHTNING } from 'packages/lightning';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const userId = req.query.user_id;
        const storeId = req.query.store_id;
        const network = req.query.network;

        const find_lightning_network = await prisma.wallet_lightning_networks.findMany({
          where: {
            user_id: Number(userId),
            store_id: Number(storeId),
            status: 1,
          },
        });

        if (!find_lightning_network) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        let datas: any[] = [];

        if (find_lightning_network.length > 0) {
          for (const item of find_lightning_network) {
            const find_lightning_network_setting = await prisma.wallet_lightning_network_settings.findFirst({
              where: {
                lnd_id: item.id,
              },
            });
            if (!find_lightning_network_setting) {
              return res.status(200).json({ message: '', result: false, data: null });
            }

            let balance = 0;
            switch (item.kind) {
              case LIGHTNINGNAME.BLINK:
                break;
              case LIGHTNINGNAME.CLIGHTNING:
                break;
              case LIGHTNINGNAME.LNBITS:
                break;
              case LIGHTNINGNAME.LND:
                break;
              case LIGHTNINGNAME.LNDHUB:
                let access_token = '';
                if (new Date().getTime() > LNDHUB.accessTokenMaxAge + item.updated_at.getTime()) {
                  // expired
                  const [isAuthorized, data] = await LIGHTNING.testConnection(LIGHTNINGNAME.LNDHUB, item.server);
                  if (!isAuthorized) {
                    break;
                  }
                  const update_lightning_network = await prisma.wallet_lightning_networks.update({
                    data: {
                      access_token: data.accessToken,
                      refresh_token: data.refreshToken,
                    },
                    where: {
                      id: item.id,
                      status: 1,
                    },
                  });
                  if (!update_lightning_network) {
                    break;
                  }

                  access_token = data.access_token;
                } else {
                  access_token = item.access_token;
                }

                balance = await LIGHTNING.getBalance(LIGHTNINGNAME.LNDHUB, item.server, access_token);

                break;
              case LIGHTNINGNAME.OPENNODE:
                break;
              default:
                break;
            }

            datas.push({
              ...item,
              balance: balance,
              text: `type=${item.kind.toLowerCase()};server=${item.server};`,
              show_amount_satoshis: find_lightning_network_setting.show_amount_satoshis,
              show_hop_hint: find_lightning_network_setting.show_hop_hint,
              show_unify_url_and_qrcode: find_lightning_network_setting.show_unify_url_and_qrcode,
              show_lnurl: find_lightning_network_setting.show_lnurl,
              show_lnurl_classic_mode: find_lightning_network_setting.show_lnurl_classic_mode,
              show_allow_payee_pass_comment: find_lightning_network_setting.show_allow_payee_pass_comment,
            });
          }
        }

        return res.status(200).json({ message: '', result: true, data: datas });
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
