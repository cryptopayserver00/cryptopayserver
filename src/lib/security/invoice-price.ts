import { COINGECKO_IDS } from '@/packages/constants'
import { COINS } from '@/packages/constants/blockchain'
import { CRYPTOPRICE } from '@/packages/web3/crypto_price'
import { BigDiv, BigIsPositive, FormatCryptoAmount } from '@/utils/number'
import Big from 'big.js'

const RATE_TOLERANCE = '0.025' // 2.5%

export type InvoicePriceResult =
  | { ok: true; rate: string; cryptoAmount: string }
  | { ok: false; message: string }

/**
 * Recompute fiat→crypto via node cryptoPrice cache and reject client-supplied
 * rate / crypto_amount that drift beyond tolerance (prevents underpayment).
 */
export async function resolveAndValidateInvoicePrice(params: {
  crypto: string
  currency: string
  amount: number | string
  clientRate: number | string
  clientCryptoAmount: number | string
}): Promise<InvoicePriceResult> {
  const { crypto, currency, amount, clientRate, clientCryptoAmount } = params

  if (!BigIsPositive(amount)) {
    return { ok: false, message: 'Invalid amount' }
  }
  if (!BigIsPositive(clientRate) || !BigIsPositive(clientCryptoAmount)) {
    return { ok: false, message: 'Invalid rate or crypto amount' }
  }

  const geckoId = COINGECKO_IDS[crypto as COINS]
  if (!geckoId) {
    return { ok: false, message: 'Unsupported crypto' }
  }

  const vs = String(currency).toLowerCase()
  let market: any
  try {
    market = await CRYPTOPRICE.getCryptoPriceByCoinGecko(geckoId, vs)
  } catch {
    return { ok: false, message: 'Unable to fetch market rate' }
  }

  const marketRateRaw = market?.[geckoId]?.[vs]
  if (!BigIsPositive(marketRateRaw ?? 0)) {
    return { ok: false, message: 'Unable to fetch market rate' }
  }

  try {
    const marketRate = new Big(String(marketRateRaw))
    const expectedCrypto = new Big(BigDiv(String(amount), marketRate.toString()))
    const rateDrift = new Big(String(clientRate)).minus(marketRate).abs().div(marketRate)
    const amountDrift = new Big(String(clientCryptoAmount))
      .minus(expectedCrypto)
      .abs()
      .div(expectedCrypto)

    if (rateDrift.gt(RATE_TOLERANCE) || amountDrift.gt(RATE_TOLERANCE)) {
      return { ok: false, message: 'Rate or crypto amount out of date' }
    }

    // Persist server-side values so settlement matches market at creation time.
    // Keep as decimal strings; callers convert to Number only for Float DB columns.
    return {
      ok: true,
      rate: FormatCryptoAmount(marketRate.toString(), 12),
      cryptoAmount: FormatCryptoAmount(expectedCrypto.toString(), 12),
    }
  } catch {
    return { ok: false, message: 'Invalid rate or crypto amount' }
  }
}
