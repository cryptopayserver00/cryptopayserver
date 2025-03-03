import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import { GetAllMainnetChainIds } from 'utils/web3';
import { PrismaClient } from '@prisma/client';
import { BLOCKSCAN } from 'packages/web3/block_scan';
import { WEB3 } from 'packages/web3';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'GET':
        const network = req.query.network;
        const chain_id = req.query.chain_id;
        const address = req.query.address;

        // const wallet = await prisma.wallets.findFirst({
        //   where: {
        //     store_id: Number(storeId),
        //     status: 1,
        //   },
        //   select: {
        //     id: true,
        //   },
        // });

        // if (!wallet) {
        //   return res.status(200).json({ message: '', result: false, data: null });
        // }

        let txs = await BLOCKSCAN.getTransactionsByChainAndAddress(
          chain_id ? WEB3.getChainIds(Number(network) === 1 ? true : false, Number(chain_id)) : undefined,
          address ? String(address) : undefined,
        );

        if (!txs) {
          return res.status(200).json({ message: '', result: false, data: null });
        }

        txs.transactions = txs.transactions.map((item: any) => {
          return {
            ...item,
            chain_id: WEB3.getChains(item.chain_id),
          };
        });

        return res.status(200).json({ message: '', result: true, data: txs });

      // const chainIds = GetAllMainnetChainIds();
      // const formattedChainIds = chainIds.map((id) => `'${id}'`).join(',');

      // let node_own_transactions: any;

      // if (Number(network) === 1) {
      //   node_own_transactions = await prisma.$queryRaw`
      //   SELECT node_own_transactions.*, addresses.chain_id
      //   FROM addresses
      //   JOIN node_own_transactions
      //     ON addresses.address = node_own_transactions.address
      //   WHERE addresses.wallet_id = ${wallet.id}
      //     AND addresses.network = ${network}
      //     AND addresses.status = 1
      //     AND node_own_transactions.chain_id IN (${formattedChainIds})
      //     AND node_own_transactions.status = 1
      //   ORDER BY node_own_transactions.block_timestamp DESC;
      //   `;
      // } else {
      //   node_own_transactions = await prisma.$queryRaw`
      //   SELECT node_own_transactions.*, addresses.chain_id
      //   FROM addresses
      //   JOIN node_own_transactions
      //     ON addresses.address = node_own_transactions.address
      //   WHERE addresses.wallet_id = ${wallet.id}
      //     AND addresses.network = ${network}
      //     AND addresses.status = 1
      //     AND node_own_transactions.chain_id NOT IN (${formattedChainIds})
      //     AND node_own_transactions.status = 1
      //   ORDER BY node_own_transactions.block_timestamp DESC;
      // `;
      // }

      // if (!node_own_transactions || node_own_transactions.length !== 1) {
      //   return res.status(200).json({ message: '', result: false, data: null });
      // }

      // return res.status(200).json({ message: '', result: true, data: node_own_transactions[0] });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: '', result: false, data: e });
  }
}
