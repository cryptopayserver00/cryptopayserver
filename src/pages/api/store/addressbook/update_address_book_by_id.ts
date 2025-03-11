import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from 'pages/api';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        const id = req.body.id;

        let updateData: { [key: string]: any } = {};

        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.address !== undefined) updateData.address = req.body.address;
        if (req.body.chain_id !== undefined) updateData.chain_id = Number(req.body.chain_id);
        if (req.body.network !== undefined) updateData.network = Number(req.body.network);

        const find_address_books = await prisma.address_books.findMany({
          where: {
            chain_id: updateData.chain_id,
            address: updateData.address,
            network: updateData.network,
            status: 1,
          },
        });

        if (find_address_books.length >= 1) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const address_book = await prisma.address_books.update({
          data: updateData,
          where: {
            id: id,
            status: 1,
          },
        });

        if (!address_book) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
