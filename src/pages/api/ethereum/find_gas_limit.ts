import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';
import { COINS } from 'packages/constants/blockchain';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const chainId = req.query.chain_id;
        const network = req.query.network;
        const coin = req.query.coin;
        const from = req.query.from;
        let to = req.query.to;
        let value = req.query.value;

        if (!to || to === '') {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        if (!value || value === '') {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        if (!coin || coin === '') {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const token = FindTokenByChainIdsAndSymbol(
          WEB3.getChainIds(Number(network) === 1 ? true : false, Number(chainId)),
          coin as COINS,
        );

        const gas = await WEB3.getGasLimit(
          Number(network) === 1 ? true : false,
          Number(chainId),
          String(token.contractAddress),
          String(from),
          String(to),
          String(value),
        );

        return res.status(200).json({ message: '', result: true, data: gas });
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
