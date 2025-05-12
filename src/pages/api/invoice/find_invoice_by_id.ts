import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { PrismaClient } from '@prisma/client';
import { WEB3 } from 'packages/web3';
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';
import { COINS } from 'packages/constants/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const id = req.query.id;

        let invoice = await prisma.invoices.findFirst({
          where: {
            order_id: Number(id),
            status: 1,
          },
        });

        if (!invoice) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const token = FindTokenByChainIdsAndSymbol(
          WEB3.getChainIds(invoice.network === 1 ? true : false, invoice.chain_id),
          invoice.crypto as COINS,
        );

        const store = await prisma.stores.findFirst({
          where: {
            id: invoice.store_id,
            status: 1,
          },
        });

        if (!store) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const qrCodeText = WEB3.generateQRCodeText(
          invoice.network === 1 ? true : false,
          invoice.chain_id,
          invoice.destination_address,
          token.contractAddress,
          invoice.crypto_amount.toFixed(token.decimals),
        );

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            ...invoice,
            crypto_amount: invoice.crypto_amount.toFixed(token.decimals),
            qr_lightning_code_text: invoice.lightning_invoice
              ? `lightning:${invoice.lightning_invoice?.toUpperCase()}`
              : undefined,
            qr_code_text: qrCodeText,
            store_name: store.name,
            store_brand_color: store.brand_color,
            store_logo_url: store.logo_url,
            store_website: store.website,
          },
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
