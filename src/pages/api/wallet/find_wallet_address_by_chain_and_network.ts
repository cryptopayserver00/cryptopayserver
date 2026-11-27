import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { CHAINS, COINS, ETHEREUM_CATEGORY_CHAINS } from '@/packages/constants/blockchain'
import { prisma } from '@/lib/prisma'
import { rateLimit, requireOwnedWallet } from '@/lib/auth'
import { FindTokenByChainIdsAndSymbol, GetBlockchainAddressUrlByChainIds } from '@/utils/web3'
import { FormatCryptoAmount, GetDisplayDecimalsForSymbol } from '@/utils/number'

function resolveDisplayDecimals(chainIds: number, coin: string): number {
  try {
    const meta = FindTokenByChainIdsAndSymbol(chainIds as any, coin as COINS)
    if (meta?.displayDecimals != null && Number.isFinite(meta.displayDecimals)) {
      return meta.displayDecimals
    }
  } catch {
    // fall through
  }
  return GetDisplayDecimalsForSymbol(coin)
}

/** Trim raw chain balances (e.g. ETH 18dp) to display decimals for UI/API consumers. */
function formatAssetBalance(
  raw: Record<string, string | number> | null | undefined,
  chainIds: number
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [coin, amount] of Object.entries(raw || {})) {
    out[coin] = FormatCryptoAmount(amount, resolveDisplayDecimals(chainIds, coin))
  }
  return out
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const ownedWallet = await requireOwnedWallet(req, res, req.query.wallet_id)
    if (!ownedWallet) return

    if (!(await rateLimit(req, res, { scope: 'rl-find_wallet_address_by_chain_and_netw', limit: 120, windowMs: 15 * 60 * 1000 }))) {
      return
    }
    const walletId = ownedWallet.walletId
    const userId = ownedWallet.userId

    let chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    let dbChainId = chainId
    if (ETHEREUM_CATEGORY_CHAINS.includes(chainId)) {
      dbChainId = CHAINS.ETHEREUM
    }

    const isMainnet = network === 1
    const chainIds = WEB3.getChainIds(isMainnet, chainId)

    const addresses = await prisma.addresses.findMany({
      where: {
        wallet_id: walletId,
        user_id: userId,
        chain_id: dbChainId,
        network: network,
        status: 1,
      },
      select: {
        id: true,
        address: true,
        note: true,
      },
    })

    let newRows: any[] = []
    if (Array.isArray(addresses) && addresses.length > 0) {
      const promises = addresses.map(async (item: any) => {
        const soft = async <T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> => {
          try {
            return await fn()
          } catch (e) {
            console.warn(`[wallet/address] ${label} failed for ${item.address}`, e)
            return fallback
          }
        }

        const rawBalance = await soft('balance', () => WEB3.getAssetBalance(isMainnet, chainId, item.address), {
          // Keep page usable when a chain RPC is down.
        } as any)

        return {
          id: item.id,
          address: item.address,
          note: item.note,
          balance: formatAssetBalance(rawBalance || {}, chainIds),
          status: (await soft(
            'status',
            () => WEB3.checkAccountStatus(isMainnet, chainId, item.address),
            false
          ))
            ? 1
            : 2,
          // Public block-explorer address URL (never BlockScan/node API — those need X-API-Token)
          txUrl: GetBlockchainAddressUrlByChainIds(isMainnet, chainId, item.address),
          transactions: await soft(
            'transactions',
            () => WEB3.getTransactions(isMainnet, chainId, item.address),
            []
          ),
          resource: await soft(
            'resource',
            () => WEB3.getAccountResource(isMainnet, chainId, item.address),
            null
          ),
          trust_line: await soft(
            'trust_line',
            async () => (await WEB3.getTokenTrustLine(isMainnet, chainId, item.address)) || [],
            []
          ),
        }
      })
      newRows = await Promise.all(promises)

      return res.status(200).json({ message: '', result: true, data: newRows })
    }

    return res.status(200).json({ message: '', result: true, data: [] })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
