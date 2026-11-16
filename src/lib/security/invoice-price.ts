import { COINGECKO_IDS } from '@/packages/constants'
import { COINS } from '@/packages/constants/blockchain'
import { CRYPTOPRICE } from '@/packages/web3/crypto_price'

const RATE_TOLERANCE = 0.025 // 2.5%

export type InvoicePriceResult =
  | { ok: true; rate: number; cryptoAmount: number }
  | { ok: false; message: string }

/**
 * Recompute fiat→crypto using CoinGecko and reject client-supplied rate /
 * crypto_amount that drift beyond tolerance (prevents underpayment settlement).
 */
export async function resolveAndValidateInvoicePrice(params: {
  crypto: string
  currency: string
  amount: number
  clientRate: number
  clientCryptoAmount: number
}): Promise<InvoicePriceResult> {
  const { crypto, currency, amount, clientRate, clientCryptoAmount } = params

  if (!amount || amount <= 0) {
    return { ok: false, message: 'Invalid amount' }
  }
  if (!clientRate || clientRate <= 0 || !clientCryptoAmount || clientCryptoAmount <= 0) {
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

  const marketRate = Number(market?.[geckoId]?.[vs])
  if (!marketRate || marketRate <= 0) {
    return { ok: false, message: 'Unable to fetch market rate' }
  }

  const expectedCrypto = amount / marketRate
  const rateDrift = Math.abs(clientRate - marketRate) / marketRate
  const amountDrift = Math.abs(clientCryptoAmount - expectedCrypto) / expectedCrypto

  if (rateDrift > RATE_TOLERANCE || amountDrift > RATE_TOLERANCE) {
    return { ok: false, message: 'Rate or crypto amount out of date' }
  }

  // Persist server-side values so settlement matches market at creation time.
  return { ok: true, rate: marketRate, cryptoAmount: expectedCrypto }
}
