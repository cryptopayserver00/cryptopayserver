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
  return wei / 1_000_000_000;
}

export function GweiToWei(wei: number): number {
  return parseInt((wei * 1_000_000_000).toString());
}

export function GweiToEther(gwei: number): number {
  return gwei / 1_000_000_000;
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
