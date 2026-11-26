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
    return new Big(String(a || 0)).cmp(new Big(String(b || 0)))
  } catch {
    return 0
  }
}

export function FormatCryptoAmount(value: string | number | null | undefined, maxDecimals = 8): string {
  try {
    if (value === null || value === undefined || value === '') return '0'
    const rounded = new Big(String(value)).round(maxDecimals, Big.roundDown)
    const fixed = rounded.toFixed(maxDecimals)
    return fixed.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '').replace(/\.$/, '') || '0'
  } catch {
    return '0'
  }
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

export function BtcToSatoshis(btc: number): number {
  return parseInt((btc * 100_000_000).toString());
}

export function BtcToMsatoshis(btc: number): number {
  return parseInt((btc * 100_000_000_000).toString());
}

export function SatoshisToBtc(sats: number): number {
  return sats / 100_000_000;
}

export function MsatoshisToBtc(sats: number): number {
  return sats / 100_000_000_000;
}
