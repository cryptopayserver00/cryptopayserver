import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { WEB3 } from '@/packages/web3'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import { CRYPTOPRICE } from '@/packages/web3/crypto_price'
import { COINGECKO_IDS, CURRENCY, CURRENCY_SYMBOLS } from '@/packages/constants'
import { BigMul } from '@/utils/number'
import { prisma } from '@/lib/prisma'

type CoinType = {
  coin: string
  price: string
  number: number
  unit: string
  balance: string
  marketCap: string
  twentyFourHVol: string
  twentyFourHChange: string
}

type CoinMapItem = {
  unit: string
  number: number
  price: number
  balance: number
  marketCap: number
  twentyFourHVol: number
  twentyFourHChange: number
  lastUpdatedAt: number
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

    const walletId = Number(req.query.wallet_id)
    if (!walletId) {
      return res.status(200).json({ message: 'Invalid walletId', result: false, data: null })
    }

    const storeId = Number(req.query.store_id)
    if (!storeId) {
      return res.status(200).json({ message: 'Invalid storeId', result: false, data: null })
    }

    const wallet = await prisma.wallets.findFirst({
      where: {
        id: walletId,
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
    const balance = await WEB3.getAssetBalance(network === 1, chainId, address)
    const currency = CURRENCY['0']
    const currencySymbol = CURRENCY_SYMBOLS[currency]

    const coinMaps: Record<string, CoinMapItem> = {}
    const ids: string[] = []

    for (const [coin, amount] of Object.entries(balance)) {
      const value = parseFloat(amount as string)

      if (coinMaps[coin]) {
        coinMaps[coin].number += value
        continue
      }

      coinMaps[coin] = {
        unit: currency,
        number: value,
        price: 0,
        balance: 0,
        marketCap: 0,
        twentyFourHVol: 0,
        twentyFourHChange: 0,
        lastUpdatedAt: 0,
      }

      const geckoId = COINGECKO_IDS[coin as COINS]
      if (geckoId) {
        ids.push(geckoId)
      }
    }

    const cryptoPrice = await CRYPTOPRICE.getCryptoPriceByCoinGecko(
      String(ids.length > 1 ? ids.join(',') : ids[0]),
      String(currency)
    )

    let totalBalance = 0

    const coins: CoinType[] = Object.entries(coinMaps).map(([coin, info]) => {
      const priceData = cryptoPrice[COINGECKO_IDS[coin as COINS]]
      const price = priceData.usd
      const balance = parseFloat(BigMul(info.number.toString(), price))

      info.unit = currency
      info.price = price
      info.balance = balance
      info.marketCap = priceData.usd_market_cap
      info.twentyFourHVol = priceData.usd_24h_vol
      info.twentyFourHChange = priceData.usd_24h_change
      info.lastUpdatedAt = priceData.last_updated_at

      totalBalance += balance

      return {
        coin,
        price,
        unit: currency,
        number: info.number,
        balance: String(balance),
        marketCap: priceData.usd_market_cap,
        twentyFourHVol: priceData.usd_24h_vol,
        twentyFourHChange: priceData.usd_24h_change,
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
        totalBalance: totalBalance,
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
