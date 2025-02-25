import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from 'pages/api';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'PUT':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const id = req.body.id;
        const name = req.body.name;
        const address = req.body.address;
        const chainId = req.body.chain_id;

        const address_book = await prisma.address_books.update({
          data: {
            name: name,
            address: address,
            chain_id: chainId,
          },
          where: {
            id: id,
            status: 1,
          },
        });

        if (!address_book) {
          return res.status(200).json({
            message: '',
            result: false,
            data: null,
          });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: null,
        });

      // let updateQuery = 'UPDATE address_books SET ';
      // let updateValues = [];
      // if (name) {
      //   updateQuery += 'name = ?,';
      //   updateValues.push(name);
      // }
      // if (address) {
      //   updateQuery += 'address = ?,';
      //   updateValues.push(address);
      // }
      // if (chainId) {
      //   updateQuery += 'chain_id = ?,';
      //   updateValues.push(chainId);
      // }

      // updateQuery = updateQuery.slice(0, -1);

      // updateQuery += ' WHERE id = ? and status = ?';
      // updateValues.push(id, 1);

      // await connection.query(updateQuery, updateValues);

      // return res.status(200).json({ message: '', result: true, data: null });
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
