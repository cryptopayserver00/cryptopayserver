import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const chainId = req.query.chain_id;
        const network = req.query.network;
        const address = req.query.address;

        const nonce = await WEB3.getNonce(Number(network) === 1 ? true : false, Number(chainId), String(address));

        return res.status(200).json({ message: '', result: true, data: nonce });
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
