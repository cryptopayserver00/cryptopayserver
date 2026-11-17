import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { GetAllMainnetChainIds, GetAllTestnetChainIds } from '@/utils/web3'
import { BLOCKSCAN } from '@/packages/web3/block_scan'
import { WEB3 } from '@/packages/web3'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireOwnedStore } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const owned = await requireOwnedStore(req, res, req.query.store_id, req.query.user_id)
    if (!owned) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_transaction', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const storeId = owned.storeId

    const chainId = req.query.chain_id !== undefined && req.query.chain_id !== ''
      ? Number(req.query.chain_id)
      : 0
    if (req.query.chain_id !== undefined && req.query.chain_id !== '' && !Number.isFinite(chainId)) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const address = String(req.query.address || '')
    if (!address) {
      return res.status(200).json({ message: 'Invalid address', result: false, data: null })
    }

    const page = req.query.page
    const pageSize = req.query.page_size

    const wallet = await prisma.wallets.findFirst({
      where: {
        store_id: storeId,
        status: 1,
      },
      select: {
        id: true,
      },
    })

    if (!wallet) {
      return res.status(200).json({
        message: '',
        result: true,
        data: { transactions: [], page: Number(page) || 1, total: 0 },
      })
    }

    const addresses = await prisma.addresses.findMany({
      where: {
        wallet_id: wallet.id,
        network: network,
        status: 1,
      },
      select: {
        address: true,
      },
    })

    const chainIds = Number(network) === 1 ? GetAllMainnetChainIds() : GetAllTestnetChainIds()
    const formattedChainIds = chainIds.map((id) => `${id}`).join(',')

    const formattedAddresses = addresses.map((item) => `${item.address}`).join(',')

    let txs = await BLOCKSCAN.getTransactionsByChainAndAddress(
      chainId ? WEB3.getChainIds(network === 1, chainId).toString() : formattedChainIds,
      address ? String(address) : formattedAddresses,
      Number(page),
      Number(pageSize)
    )

    if (!txs) {
      return res.status(200).json({ message: 'Cannot get txs', result: false, data: null })
    }

    txs.transactions = txs.transactions.map((item: any) => {
      return {
        ...item,
        chain_id: WEB3.getChains(item.chain_id),
      }
    })

    return res.status(200).json({ message: '', result: true, data: txs })

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
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
