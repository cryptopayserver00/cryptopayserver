import type { NextApiRequest, NextApiResponse } from 'next';
import { LIGHTNINGNAME } from 'packages/constants/blockchain';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { LNDHUB } from 'packages/lightning/core/lndhub';
import { LIGHTNING } from 'packages/lightning';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const id = req.body.lightning_id;
        const invoice = req.body.invoice;

        if (!invoice || invoice === '') {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const find_lightning_network = await prisma.wallet_lightning_networks.findFirst({
          where: {
            id: Number(id),
            status: 1,
          },
        });

        if (!find_lightning_network) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        let isPay = false;

        switch (find_lightning_network.kind) {
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
            if (new Date().getTime() > LNDHUB.accessTokenMaxAge + find_lightning_network.updated_at.getTime()) {
              // expired
              const [isAuthorized, data] = await LIGHTNING.testConnection(
                LIGHTNINGNAME.LNDHUB,
                find_lightning_network.server,
              );
              if (!isAuthorized) {
                return res.status(200).json({ message: '', result: false, data: null });
              }
              const update_lightning_network = await prisma.wallet_lightning_networks.update({
                data: {
                  access_token: data.accessToken,
                  refresh_token: data.refreshToken,
                },
                where: {
                  id: find_lightning_network.id,
                  status: 1,
                },
              });
              if (!update_lightning_network) {
                return res.status(200).json({ message: '', result: false, data: null });
              }

              access_token = data.access_token;
            } else {
              access_token = find_lightning_network.access_token;
            }

            isPay = await LIGHTNING.payInvoice(
              LIGHTNINGNAME.LNDHUB,
              find_lightning_network.server,
              invoice,
              access_token,
            );

            break;
          case LIGHTNINGNAME.OPENNODE:
            break;
          default:
            break;
        }

        if (isPay) {
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
