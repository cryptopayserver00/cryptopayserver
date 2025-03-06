import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from 'pages/api';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();

        let findData: { [key: string]: any } = {};

        if (req.query.store_id !== undefined) findData.store_id = Number(req.query.store_id);
        if (req.query.network !== undefined) findData.network = Number(req.query.network);
        if (req.query.chain_id !== undefined) findData.chain_id = Number(req.query.chain_id);
        findData.status = 1;

        const address_books = await prisma.address_books.findMany({
          where: findData,
          orderBy: {
            id: 'desc',
          },
        });

        if (!address_books) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: address_books,
        });

      case 'POST':
        break;
      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
