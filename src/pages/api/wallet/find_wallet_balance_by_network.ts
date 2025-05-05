import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { WEB3 } from 'packages/web3';
import { PrismaClient } from '@prisma/client';
import { CHAINS, COINS, ETHEREUM_CATEGORY_CHAINS } from 'packages/constants/blockchain';
import { CRYPTOPRICE } from 'packages/web3/crypto_price';
import { COINGECKO_IDS, CURRENCY, CURRENCY_SYMBOLS } from 'packages/constants';
import { BigMul } from 'utils/number';

type CoinType = {
  coin: string;
  price: string;
  number: number;
  unit: string;
  balance: string;
  marketCap: string;
  twentyFourHVol: string;
  twentyFourHChange: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const prisma = new PrismaClient();
        const walletId = req.query.wallet_id;
        const storeId = req.query.store_id;
        const network = req.query.network;
        let chainId = Number(req.query.chain_id);

        const wallet = await prisma.wallets.findFirst({
          where: {
            id: Number(walletId),
            status: 1,
          },
          select: {
            name: true,
          },
        });

        if (!wallet) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        chainId = chainId ? chainId : CHAINS.BITCOIN;

        const payment_setting = await prisma.payment_settings.findFirst({
          where: {
            store_id: Number(storeId),
            chain_id: chainId,
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

        const find_address = await prisma.addresses.findFirst({
          where: {
            id: payment_setting.current_used_address_id,
            status: 1,
          },
          select: {
            address: true,
          },
        });

        if (!find_address) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        // let dbChainId = chainId;

        // if (ETHEREUM_CATEGORY_CHAINS.includes(Number(dbChainId))) {
        //   dbChainId = CHAINS.ETHEREUM;
        // }

        // const addresses = await prisma.addresses.findMany({
        //   where: {
        //     wallet_id: Number(walletId),
        //     chain_id: Number(dbChainId),
        //     network: Number(network),
        //     status: 1,
        //   },
        //   select: {
        //     address: true,
        //   },
        // });

        // if (!addresses) {
        //   return res.status(200).json({ message: '', result: false, data: null });
        // }

        const address = find_address.address;
        const balance = await WEB3.getAssetBalance(Number(network) === 1 ? true : false, Number(chainId), address);
        const currency = CURRENCY['0'];
        const currencySymbol = CURRENCY_SYMBOLS[currency];

        let coinMaps: {
          [key in string]: {
            unit: string;
            number: number;
            price: number;
            balance: number;
            marketCap: number;
            twentyFourHVol: number;
            twentyFourHChange: number;
            lastUpdatedAt: number;
          };
        } = {};
        let ids: string[] = [];
        Object.entries(balance).forEach(([coin, amount]) => {
          const value = parseFloat(amount as string);

          if (coinMaps[coin]) {
            coinMaps[coin].number += value;
          } else {
            coinMaps[coin] = {
              unit: currency,
              number: value,
              price: 0,
              balance: 0,
              marketCap: 0,
              twentyFourHVol: 0,
              twentyFourHChange: 0,
              lastUpdatedAt: 0,
            };

            ids.push(COINGECKO_IDS[coin as COINS]);
          }
        });

        const cryptoPrice = await CRYPTOPRICE.getCryptoPriceByCoinGecko(
          String(ids.length > 1 ? ids.join(',') : ids[0]),
          String(currency),
        );

        let totalBalance = 0;

        let coins: CoinType[] = [];

        Object.entries(coinMaps).forEach((item, index: number) => {
          const price = cryptoPrice[COINGECKO_IDS[item[0] as COINS]]['usd'];
          const balance = parseFloat(BigMul(item[1].number.toString(), price));
          const marketCap = cryptoPrice[COINGECKO_IDS[item[0] as COINS]]['usd_market_cap'];
          const twentyFourHVol = cryptoPrice[COINGECKO_IDS[item[0] as COINS]]['usd_24h_vol'];
          const twentyFourHChange = cryptoPrice[COINGECKO_IDS[item[0] as COINS]]['usd_24h_change'];
          const lastUpdatedAt = cryptoPrice[COINGECKO_IDS[item[0] as COINS]]['last_updated_at'];

          item[1].unit = currency;
          item[1].price = price;
          item[1].balance = balance;
          item[1].marketCap = marketCap;
          item[1].twentyFourHVol = twentyFourHVol;
          item[1].twentyFourHChange = twentyFourHChange;
          item[1].lastUpdatedAt = lastUpdatedAt;

          coins.push({
            coin: item[0],
            price: price,
            unit: currency,
            number: item[1].number,
            balance: String(balance),
            marketCap: marketCap,
            twentyFourHVol: twentyFourHVol,
            twentyFourHChange: twentyFourHChange,
          });

          totalBalance += parseFloat(BigMul(item[1].number.toString(), price));
        });

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            walletId: walletId,
            walletName: wallet.name,
            address: address,
            chainId: chainId,
            coins: coins,
            totalBalance: totalBalance,
            currency: currency,
            currencySymbol: currencySymbol,
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
