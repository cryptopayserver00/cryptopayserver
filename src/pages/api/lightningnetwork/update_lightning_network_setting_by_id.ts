import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.show_amount_satoshis !== undefined)
          updateData.show_amount_satoshis = Number(req.body.show_amount_satoshis);
        if (req.body.show_hop_hint !== undefined) updateData.show_hop_hint = Number(req.body.show_hop_hint);
        if (req.body.show_unify_url_and_qrcode !== undefined)
          updateData.show_unify_url_and_qrcode = Number(req.body.show_unify_url_and_qrcode);
        if (req.body.show_lnurl !== undefined) updateData.show_lnurl = Number(req.body.show_lnurl);
        if (req.body.show_lnurl_classic_mode !== undefined)
          updateData.show_lnurl_classic_mode = Number(req.body.show_lnurl_classic_mode);
        if (req.body.show_allow_payee_pass_comment !== undefined)
          updateData.show_allow_payee_pass_comment = Number(req.body.show_allow_payee_pass_comment);

        const wallet_lightning_network = await prisma.wallet_lightning_networks.update({
          data: {
            enabled: req.body.enabled ? Number(req.body.enabled) : undefined,
          },
          where: {
            id: id,
            status: 1,
          },
        });
        if (!wallet_lightning_network) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const wallet_lightning_network_setting = await prisma.wallet_lightning_network_settings.updateMany({
          data: updateData,
          where: {
            lnd_id: wallet_lightning_network.id,
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
