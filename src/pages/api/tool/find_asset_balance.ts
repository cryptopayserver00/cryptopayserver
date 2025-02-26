import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import mysql from 'mysql2/promise';
import { WEB3 } from 'packages/web3';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        // const connection = await connectDatabase();
        const userId = req.query.user_id;
        const storeId = req.query.store_id;
        const chainId = req.query.chain_id;
        const network = req.query.network;

        const payment_setting = await prisma.payment_settings.findFirst({
          where: {
            user_id: Number(userId),
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
          parseInt(network as string) === 1 ? true : false,
          parseInt(chainId as string),
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

      // const query =
      //   'SELECT current_used_address_id FROM payment_settings where user_id = ? and store_id = ? and chain_id = ? and network = ? and status = ?';
      // const values = [userId, storeId, chainId, network, 1];
      // const [rows] = await connection.query(query, values);
      // if (Array.isArray(rows) && rows.length === 1) {
      //   const row = rows[0] as mysql.RowDataPacket;

      //   const addressQuery = 'SELECT address FROM addresses where id = ? and status = 1';
      //   const addressValues = [row.current_used_address_id];
      //   const [addressRows] = await connection.query(addressQuery, addressValues);

      //   if (Array.isArray(addressRows) && addressRows.length === 1) {
      //     const addressRow = addressRows[0] as mysql.RowDataPacket;
      //     const balance = await WEB3.getAssetBalance(
      //       parseInt(network as string) === 1 ? true : false,
      //       parseInt(chainId as string),
      //       addressRow.address,
      //     );

      //     return res.status(200).json({
      //       message: '',
      //       result: true,
      //       data: {
      //         address: addressRow.address,
      //         balance: balance,
      //       },
      //     });
      //   }
      // }
      // return res.status(200).json({ message: '', result: false, data: rows });

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
