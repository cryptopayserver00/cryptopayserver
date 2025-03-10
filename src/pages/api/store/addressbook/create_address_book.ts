import type { NextApiRequest, NextApiResponse } from 'next';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from 'pages/api';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const network = req.body.network;
        const chainId = req.body.chain_id;

        const name = req.body.name;
        const address = req.body.address;

        const result = await WEB3.checkAddress(Number(network) === 1 ? true : false, Number(chainId), String(address));

        if (!result) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const find_address_book = await prisma.address_books.findFirst({
          where: {
            user_id: userId,
            store_id: storeId,
            chain_id: chainId,
            address: address,
            network: network,
            status: 1,
          },
        });

        if (find_address_book) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const address_book = await prisma.address_books.create({
          data: {
            user_id: userId,
            store_id: storeId,
            chain_id: chainId,
            name: name,
            address: address,
            network: network,
            status: 1,
          },
        });

        if (!address_book) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            id: address_book.id,
          },
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
