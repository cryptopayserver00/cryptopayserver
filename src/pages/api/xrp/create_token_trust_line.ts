import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { PrismaClient } from '@prisma/client';
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const walletId = Number(req.body.wallet_id);
        const userId = Number(req.body.user_id);
        const chainId = Number(req.body.chain_id);
        const network = Number(req.body.network);
        const fromAddress = req.body.address;
        const coin = req.body.coin;
        const limit = req.body.limit;

        const address = await prisma.addresses.findFirst({
          where: {
            chain_id: chainId,
            network: network,
            address: fromAddress,
            wallet_id: walletId,
            user_id: userId,
            status: 1,
          },
          select: {
            wallet_id: true,
            private_key: true,
            note: true,
            network: true,
            address: true,
          },
        });

        if (!address) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const wallet = await prisma.wallets.findFirst({
          where: {
            id: address.wallet_id,
            status: 1,
          },
          select: {
            mnemonic: true,
            store_id: true,
          },
        });

        if (!wallet) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const hash = await WEB3.createTokenTrustLine(Number(network) === 1 ? true : false, Number(chainId), {
          mnemonic: wallet.mnemonic,
          address: fromAddress,
          issuer: String(
            FindTokenByChainIdsAndSymbol(WEB3.getChainIds(address.network === 1 ? true : false, chainId), coin)
              .contractAddress,
          ),
          coin: coin,
          limit: limit,
        });

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
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
