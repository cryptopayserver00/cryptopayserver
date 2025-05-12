import Big from 'big.js';

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

export function GenerateOrderIDByTime(): number {
  const now = new Date();

  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');

  const orderIDString = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;

  return parseInt(orderIDString, 10);
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

export function SatoshisToBtc(sats: number): number {
  return sats / 100_000_000;
}
