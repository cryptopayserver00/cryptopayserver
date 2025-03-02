import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const storeId = req.query.store_id;
        const chainId = req.query.chain_id;
        const network = req.query.network;

        const payment_setting = await prisma.payment_settings.findFirst({
          where: {
            store_id: Number(storeId),
            chain_id: Number(chainId),
            network: Number(network),
            status: 1,
          },
          select: {
            current_used_address_id: true,
          },
        });

        if (!payment_setting) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const address = await prisma.addresses.findFirst({
          where: {
            id: payment_setting.current_used_address_id,
            status: 1,
          },
          select: {
            address: true,
          },
        });

        if (!address) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const balance = await WEB3.getAssetBalance(
          Number(network) === 1 ? true : false,
          Number(chainId),
          address.address,
        );

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            address: address.address,
            balance: balance,
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
