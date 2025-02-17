import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDatabase } from 'packages/db/mysql';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const connection = await connectDatabase();
        const userId = req.body.user_id;
        const storeId = req.body.store_id;
        const chainId = req.body.chain_id;
        const network = req.body.network;
        const privateKey = req.body.private_key;

        const result = await WEB3.createAccountByPrivateKey(
          parseInt(network as string) === 1 ? true : false,
          parseInt(chainId as string),
          privateKey,
        );

        if (result) {
          return res.status(200).json({
            message: '',
            result: true,
            data: result,
          });
        }

        return res.status(200).json({ message: '', result: false, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
