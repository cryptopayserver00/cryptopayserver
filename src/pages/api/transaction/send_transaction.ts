import type { NextApiRequest, NextApiResponse } from 'next';
import { CHAINS, COINS, ETHEREUM_CATEGORY_CHAINS } from 'packages/constants/blockchain';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';
import { BTC } from 'packages/web3/chain/btc';
import { GweiToWei } from 'utils/number';
import { PrismaClient } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const prisma = new PrismaClient();
        const walletId = req.body.wallet_id;
        const userId = req.body.user_id;
        const chainId = req.body.chain_id;
        const network = req.body.network;
        const fromAddress = req.body.from_address;
        const toAddress = req.body.to_address;
        const feeRate = req.body.fee_rate;
        const value = req.body.value;
        const coin = req.body.coin;
        const nonce = req.body.nonce;
        const maxFee = req.body.max_fee;
        const maxPriortyFee = req.body.max_priorty_fee;
        const gasLimit = req.body.gas_limit;
        const memo = req.body.memo;

        let dbChainId = chainId || 0;

        if (ETHEREUM_CATEGORY_CHAINS.includes(parseInt(dbChainId as string))) {
          dbChainId = CHAINS.ETHEREUM;
        }

        const address = await prisma.addresses.findFirst({
          where: {
            chain_id: dbChainId,
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
          },
        });

        if (!wallet) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        const hash = await WEB3.sendTransaction(address.network === 1 ? true : false, {
          coin: FindTokenByChainIdsAndSymbol(WEB3.getChainIds(address.network === 1 ? true : false, chainId), coin),
          value: value,
          privateKey: address.private_key,
          mnemonic: wallet.mnemonic,
          feeRate: feeRate,
          btcType: coin === COINS.BTC ? BTC.getType(address.note) : undefined,
          from: address.address,
          to: toAddress,
          gasPrice: maxFee ? GweiToWei(maxFee).toString() : '',
          gasLimit: gasLimit ? gasLimit : '',
          maxPriorityFeePerGas: maxPriortyFee ? GweiToWei(maxPriortyFee).toString() : '',
          nonce: nonce ? nonce : '',
          memo: memo ? memo : '',
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
