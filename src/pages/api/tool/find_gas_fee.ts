import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';
import { COINS } from 'packages/constants/blockchain';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const userId = req.query.user_id;
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

        const address = await prisma.addresses.findFirst({
          where: {
            chain_id: Number(chainId),
            network: Number(network),
            address: String(from),
            user_id: Number(userId),
            status: 1,
          },
          select: {
            chain_id: true,
            private_key: true,
            note: true,
            network: true,
            address: true,
          },
        });

        if (!address) {
          return res.status(200).json({ message: '', result: false, data: '' });
        }

        const gas = await WEB3.estimateGasFee(address.network === 1 ? true : false, {
          coin: FindTokenByChainIdsAndSymbol(
            WEB3.getChainIds(address.network === 1 ? true : false, address.chain_id),
            coin as COINS,
          ),
          value: value as string,
          privateKey: address.private_key,
          from: address.address,
          to: to as string,
        });

        if (!gas) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        return res.status(200).json({ message: '', result: true, data: gas });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
