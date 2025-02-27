import type { NextApiRequest, NextApiResponse } from 'next';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const chainId = req.body.chain_id;
        const network = req.body.network;
        const privateKey = req.body.private_key;

        const result = await WEB3.createAccountByPrivateKey(
          Number(network) === 1 ? true : false,
          Number(chainId),
          privateKey,
        );

        if (!result) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: null });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
