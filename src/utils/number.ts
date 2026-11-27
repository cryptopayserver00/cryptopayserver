import Big from 'big.js'
import { randomBytes } from 'crypto'

// +
export function BigAdd(a: string, b: string): string {
  const num1 = new Big(a);
  const num2 = new Big(b);
  return num1.plus(num2).toString();
}

// -
export function BigSub(a: string, b: string): string {
  const num1 = new Big(a);
  const num2 = new Big(b);
  return num1.minus(num2).toString();
}

// *
export function BigMul(a: string, b: string): string {
  if (a === '0' || b === '0') {
    return '0';
  }

  const num1 = new Big(a);
  const num2 = new Big(b);
  return num1.times(num2).toString();
}

// /
export function BigDiv(a: string, b: string): string {
  if (a === '0' || b === '0') {
    return '0';
  }

  const num1 = new Big(a);
  const num2 = new Big(b);
  return num1.div(num2).toString();
}

/**
 * Cryptographically strong public resource id (15-digit, Number-safe).
 * Name kept for call-site compatibility — no longer time-based / guessable.
 */
export function GenerateOrderIDByTime(): number {
  // 15 digits in [1e14, 1e15) — within Number.MAX_SAFE_INTEGER
  const buf = randomBytes(7) // 56 bits
  let n = 0
  for (let i = 0; i < buf.length; i++) {
    n = n * 256 + buf[i]
  }
  // Map into [1e14, 1e15)
  return 100_000_000_000_000 + (n % 900_000_000_000_000)
}

export function WeiToGwei(wei: number): number {
  return Number(WeiToGweiStr(wei))
}

export function WeiToGweiStr(wei: string | number): string {
  try {
    return BigDiv(String(wei ?? 0), '1000000000')
  } catch {
    return '0'
  }
}

/** 1 XRP = 1_000_000 drops. Prefer this over Number/dropsToXrp float. */
export function DropsToXrpStr(drops: string | number): string {
  try {
    const raw = String(drops ?? '0').trim()
    if (!raw || raw === '0') return '0'
    return BigDiv(raw, '1000000')
  } catch {
    return '0'
  }
}

export function XrpToDropsStr(xrp: string | number): string {
  try {
    return new Big(String(xrp ?? 0)).times('1000000').round(0, Big.roundDown).toString()
  } catch {
    return '0'
  }
}

export function GweiToWei(gwei: number): number {
  try {
    return Number(new Big(String(gwei ?? 0)).times('1000000000').round(0, Big.roundDown).toString())
  } catch {
    return 0
  }
}

export function GweiToEther(gwei: number): number {
  return Number(GweiToEtherStr(gwei))
}

export function GweiToEtherStr(gwei: string | number): string {
  try {
    return BigDiv(String(gwei ?? 0), '1000000000')
  } catch {
    return '0'
  }
}

/** -1 if a < b, 0 if equal, 1 if a > b */
export function BigCmp(a: string | number, b: string | number): number {
  try {
    return new Big(String(a ?? 0)).cmp(new Big(String(b ?? 0)))
  } catch {
    return 0
  }
}

export function BigGt(a: string | number, b: string | number): boolean {
  return BigCmp(a, b) > 0
}

export function BigGte(a: string | number, b: string | number): boolean {
  return BigCmp(a, b) >= 0
}

export function BigLt(a: string | number, b: string | number): boolean {
  return BigCmp(a, b) < 0
}

export function BigLte(a: string | number, b: string | number): boolean {
  return BigCmp(a, b) <= 0
}

export function BigIsPositive(a: string | number): boolean {
  return BigCmp(a, '0') > 0
}

/** Relative + absolute tolerance compare for settlement matching (avoid float epsilon). */
export function BigAlmostEqual(
  a: string | number,
  b: string | number,
  relTol = '1e-9',
  absTol = '1e-12'
): boolean {
  try {
    const left = new Big(String(a ?? 0))
    const right = new Big(String(b ?? 0))
    if (left.eq(right)) return true
    if (right.lte(0) && left.lte(0)) return left.eq(right)
    const diff = left.minus(right).abs()
    const abs = new Big(absTol)
    const rel = right.abs().times(relTol)
    const tol = abs.cmp(rel) >= 0 ? abs : rel
    return diff.lte(tol)
  } catch {
    return false
  }
}

/** UI display decimals by symbol when coin metadata is not in hand. */
const DISPLAY_DECIMALS_BY_SYMBOL: Record<string, number> = {
  BTC: 8,
  LTC: 8,
  BCH: 8,
  ETH: 6,
  BNB: 6,
  MATIC: 6,
  POL: 6,
  AVAX: 6,
  ARB: 6,
  OP: 6,
  SOL: 4,
  TRX: 4,
  TON: 4,
  XRP: 6,
  USDT: 2,
  USDC: 2,
  DAI: 2,
  FDUSD: 2,
  BUSD: 2,
  WBTC: 8,
  WETH: 6,
}

/** Cap for compact UI; full chain decimals stay on-chain / inputs. */
export const CRYPTO_DISPLAY_MAX_DECIMALS = 8

export function GetDisplayDecimalsForSymbol(
  symbol?: string | null,
  fallback = CRYPTO_DISPLAY_MAX_DECIMALS
): number {
  if (!symbol) return fallback
  const key = String(symbol).trim().toUpperCase()
  const hit = DISPLAY_DECIMALS_BY_SYMBOL[key]
  if (typeof hit === 'number') return hit
  // Stablecoin-ish suffixes
  if (key.includes('USD')) return 2
  return fallback
}

/**
 * Format a crypto amount for display: round down, trim trailing zeros.
 * Non-zero dust smaller than the display unit becomes "< 0.00…1".
 */
export function FormatCryptoAmount(
  value: string | number | null | undefined,
  maxDecimals = CRYPTO_DISPLAY_MAX_DECIMALS
): string {
  try {
    if (value === null || value === undefined || value === '') return '0'
    const decimals = Math.max(0, Math.min(Number(maxDecimals) || 0, 18))
    const num = new Big(String(value))
    if (num.eq(0)) return '0'

    const rounded = num.round(decimals, Big.roundDown)
    if (rounded.eq(0) && num.gt(0)) {
      if (decimals <= 0) return '< 1'
      return `< 0.${'0'.repeat(Math.max(0, decimals - 1))}1`
    }

    const fixed = rounded.toFixed(decimals)
    return fixed.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '').replace(/\.$/, '') || '0'
  } catch {
    return '0'
  }
}

/** Prefer coin displayDecimals / symbol map for UI lists and cards. */
export function FormatCryptoDisplay(
  value: string | number | null | undefined,
  opts?: { decimals?: number; coin?: string | null }
): string {
  const decimals =
    typeof opts?.decimals === 'number'
      ? opts.decimals
      : GetDisplayDecimalsForSymbol(opts?.coin, CRYPTO_DISPLAY_MAX_DECIMALS)
  return FormatCryptoAmount(value, Math.min(decimals, CRYPTO_DISPLAY_MAX_DECIMALS))
}

/** Keep only a valid decimal amount string, capped by maxDecimals. */
export function SanitizeAmountInput(raw: string, maxDecimals = 18): string {
  if (!raw) return ''
  let v = String(raw).replace(/[^\d.]/g, '')
  if (maxDecimals <= 0) {
    return v.replace(/\./g, '')
  }
  const firstDot = v.indexOf('.')
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '')
  }
  const [intPart, decPart] = v.split('.')
  if (decPart !== undefined) {
    return `${intPart || '0'}.${decPart.slice(0, maxDecimals)}`
  }
  return intPart
}

export function BtcToSatoshis(btc: string | number): number {
  try {
    return parseInt(
      new Big(String(btc ?? 0)).times('100000000').round(0, Big.roundDown).toString(),
      10
    )
  } catch {
    return 0
  }
}

export function BtcToMsatoshis(btc: string | number): number {
  try {
    return parseInt(
      new Big(String(btc ?? 0)).times('100000000000').round(0, Big.roundDown).toString(),
      10
    )
  } catch {
    return 0
  }
}

export function SatoshisToBtc(sats: string | number): number {
  try {
    return Number(BigDiv(String(sats ?? 0), '100000000'))
  } catch {
    return 0
  }
}

export function MsatoshisToBtc(sats: string | number): number {
  try {
    return Number(BigDiv(String(sats ?? 0), '100000000000'))
  } catch {
    return 0
  }
}
