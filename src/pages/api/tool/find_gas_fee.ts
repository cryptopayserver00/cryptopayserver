import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';
import { CHAINS, COIN, COINS } from 'packages/constants/blockchain';
import { connectDatabase } from 'packages/db/mysql';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const connection = await connectDatabase();
        const userId = req.query.user_id;
        const chainId = req.query.chain_id;
        const network = req.query.network;
        const coin = req.query.coin;
        const from = req.query.from;
        let to = req.query.to;
        let value = req.query.value;

        if (!to || to === '') {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        if (!value || value === '') {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        if (!coin || coin === '') {
          return res.status(200).json({ message: 'Something wrong', result: false, data: null });
        }

        const addressQuery =
          'SELECT chain_id, private_key, note, network, address FROM addresses where chain_id = ? and network = ? and address = ? and user_id = ? and status = 1';
        const addressValues = [chainId, network, from, userId];
        const [addressRows] = await connection.query(addressQuery, addressValues);
        if (Array.isArray(addressRows) && addressRows.length === 1) {
          const addressRow = addressRows[0] as mysql.RowDataPacket;

          const gas = await WEB3.estimateGasFee(addressRow.network === 1 ? true : false, {
            coin: FindTokenByChainIdsAndSymbol(
              WEB3.getChainIds(addressRow.network === 1 ? true : false, addressRow.chain_id),
              coin as COINS,
            ),
            value: value as string,
            privateKey: addressRow.private_key,
            from: addressRow.address,
            to: to as string,
          });

          return res.status(200).json({ message: '', result: true, data: gas });
        }

        return res.status(500).json({ message: '', result: false, data: '' });
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
