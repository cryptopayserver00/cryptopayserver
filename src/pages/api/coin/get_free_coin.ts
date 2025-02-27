import type { NextApiRequest, NextApiResponse } from 'next';
import { WEB3 } from 'packages/web3';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { BLOCKSCAN } from 'packages/web3/block_scan';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const amount = req.query.amount;
        const chainId = req.query.chain_id;
        const coin = req.query.coin;
        const address = req.query.address;

        const hash = await BLOCKSCAN.getFreeCoin(
          WEB3.getChainIds(false, Number(chainId)),
          String(address),
          String(coin),
          String(amount),
        );

        if (!hash) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            hash: hash,
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
