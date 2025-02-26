import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const walletId = req.query.wallet_id;
        const network = req.query.network;

        const addresses = await prisma.addresses.findMany({
          where: {
            wallet_id: Number(walletId),
            network: Number(network),
            status: 1,
          },
          select: {
            id: true,
            address: true,
            chain_id: true,
            note: true,
          },
        });

        if (!addresses) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        let newRows: any[] = [];
        if (Array.isArray(addresses) && addresses.length > 0) {
          const promises = addresses.map(async (item: any) => {
            return {
              id: item.id,
              address: item.address,
              note: item.note,
              chain_id: item.chain_id,
              balance: await WEB3.getAssetBalance(
                parseInt(network as string) === 1 ? true : false,
                item.chain_id,
                item.address,
              ),
            };
          });
          newRows = await Promise.all(promises);

          return res.status(200).json({ message: '', result: true, data: newRows });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      // const query =
      //   'SELECT id, address, chain_id, note FROM addresses where wallet_id = ? and network = ? and status = ?';
      // const values = [walletId, network, 1];
      // const [rows] = await connection.query(query, values);

      // let newRows: any[] = [];
      // if (Array.isArray(rows) && rows.length > 0) {
      //   const promises = rows.map(async (item: any) => {
      //     return {
      //       id: item.id,
      //       address: item.address,
      //       note: item.note,
      //       chain_id: item.chain_id,
      //       balance: await WEB3.getAssetBalance(
      //         parseInt(network as string) === 1 ? true : false,
      //         item.chain_id,
      //         item.address,
      //       ),
      //     };
      //   });
      //   newRows = await Promise.all(promises);

      //   return res.status(200).json({ message: '', result: true, data: newRows });
      // }

      // return res.status(200).json({ message: '', result: false, data: null });
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
