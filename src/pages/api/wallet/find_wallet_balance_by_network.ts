import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import { CRYPTOPRICE } from '@/packages/web3/crypto_price'
import { COINGECKO_IDS, CURRENCY, CURRENCY_SYMBOLS } from '@/packages/constants'
import {
  BigAdd,
  BigMul,
  FormatCryptoAmount,
  GetDisplayDecimalsForSymbol,
} from '@/utils/number'
import { FindTokenByChainIdsAndSymbol } from '@/utils/web3'
import { prisma } from '@/lib/prisma'
import { assertStoreOwnedByUser, forbidden, rateLimit, requireOwnedWallet } from '@/lib/auth'

interface CoinType {
  coin: string
  price: string
  number: string
  unit: string
  balance: string
  marketCap: string
  twentyFourHVol: string
  twentyFourHChange: string
}

interface CoinMapItem {
  unit: string
  /** Human-unit quantity kept as decimal string (no float). */
  number: string
}

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

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    let chainId = Number(req.query.chain_id)
    if (!chainId) {
      return res.status(200).json({ message: 'Invalid chainId', result: false, data: null })
    }

    const network = Number(req.query.network)
    if (!network) {
      return res.status(200).json({ message: 'Invalid network', result: false, data: null })
    }

    const ownedWallet = await requireOwnedWallet(req, res, req.query.wallet_id)
    if (!ownedWallet) return

    if (
      !(await rateLimit(req, res, {
        scope: 'rl-find_wallet_balance',
        limit: 120,
        windowMs: 15 * 60 * 1000,
      }))
    ) {
      return
    }

    const walletId = ownedWallet.walletId
    const userId = ownedWallet.userId

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
    }

    const wallet = await prisma.wallets.findFirst({
      where: {
        id: walletId,
        user_id: userId,
        status: 1,
      },
      select: {
        name: true,
      },
    })

    if (!wallet) {
      return res.status(200).json({ message: 'Cannot find wallet', result: false, data: null })
    }

    chainId = chainId ? chainId : CHAINS.BITCOIN

    const payment_setting = await prisma.payment_settings.findFirst({
      where: {
        store_id: storeId,
        chain_id: chainId,
        network: network,
        status: 1,
      },
      select: {
        current_used_address_id: true,
      },
    })

    if (!payment_setting) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const find_address = await prisma.addresses.findFirst({
      where: {
        id: payment_setting.current_used_address_id,
        status: 1,
      },
      select: {
        address: true,
      },
    })

    if (!find_address) {
      return res.status(200).json({ message: 'Cannot find', result: false, data: null })
    }

    const address = find_address.address
    const isMainnet = network === 1
    const balance = await WEB3.getAssetBalance(isMainnet, chainId, address)
    const chainIds = WEB3.getChainIds(isMainnet, chainId)
    const currency = CURRENCY['0']
    const currencySymbol = CURRENCY_SYMBOLS[currency]

    const coinMaps: Record<string, CoinMapItem> = {}
    const ids: string[] = []

    for (const [coin, amount] of Object.entries(balance)) {
      const amountStr = String(amount ?? '0')

      if (coinMaps[coin]) {
        coinMaps[coin].number = BigAdd(coinMaps[coin].number, amountStr)
        continue
      }

      coinMaps[coin] = {
        unit: currency,
        number: amountStr,
      }

      const geckoId = COINGECKO_IDS[coin as COINS]
      if (geckoId) {
        ids.push(geckoId)
      }
    }

    const cryptoPrice =
      ids.length > 0
        ? await CRYPTOPRICE.getCryptoPriceByCoinGecko(
            String(ids.length > 1 ? ids.join(',') : ids[0]),
            String(currency)
          )
        : {}

    let totalBalance = '0'

    const coins: CoinType[] = Object.entries(coinMaps).map(([coin, info]) => {
      const priceData = cryptoPrice[COINGECKO_IDS[coin as COINS]] || {}
      const price = String(priceData.usd ?? 0)
      const displayDecimals = resolveDisplayDecimals(chainIds, coin)
      const fiatBalance = FormatCryptoAmount(BigMul(info.number, price), 2)
      const quantity = FormatCryptoAmount(info.number, displayDecimals)

      totalBalance = BigAdd(totalBalance, fiatBalance)

      return {
        coin,
        price: FormatCryptoAmount(price, 8),
        unit: currency,
        number: quantity,
        balance: fiatBalance,
        marketCap: String(priceData.usd_market_cap ?? 0),
        twentyFourHVol: String(priceData.usd_24h_vol ?? 0),
        twentyFourHChange: FormatCryptoAmount(priceData.usd_24h_change ?? 0, 2),
      }
    })

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        walletId: walletId,
        walletName: wallet.name,
        address: address,
        chainId: chainId,
        coins: coins,
        totalBalance: FormatCryptoAmount(totalBalance, 2),
        currency: currency,
        currencySymbol: currencySymbol,
      },
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
