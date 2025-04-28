import { generate } from 'random-words';
import { Hex } from 'viem';

export function RandomWords(length: number = 0): string[] {
  return length === 0 ? [generate() as string] : (generate(length) as string[]);
}

export function AddAndShuffleArray(arr: string[], str: string): string[] {
  arr.push(str);
  return arr.sort(() => 0.5 - Math.random());
}

export function GetRandomNumber(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function GetUniqueRandomIndices(max: number, count: number): number[] {
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * max));
  }
  return Array.from(indices);
}

export function OmitMiddleString(str: string, hideLength: number = 5): string {
  if (!str) return '';
  if (str.length <= hideLength * 2) return '...';

  const startPart = str.substring(0, hideLength);
  const endPart = str.substring(str.length - hideLength);

  return `${startPart}...${endPart}`;
}

export function GetSecureRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let result = '';
  const values = new Uint8Array(length);

  crypto.getRandomValues(values);

  values.forEach((value) => {
    result += charset[value % charset.length];
  });

  return result;
}

export function NonstandardCurrencyCode(coin: string): string {
  const asciiBytes = new TextEncoder().encode(coin);

  const buffer = new Uint8Array(20);

  for (let i = 0; i < 20; i++) {
    buffer[i] = i < asciiBytes.length ? asciiBytes[i] : 0;
  }

  if (buffer[0] === 0x00) {
    buffer[0] = 0x01;
  }

  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

export function DecodeNonstandardCurrencyCode(hex: string): string {
  if (hex.length !== 40) {
    throw new Error('Invalid nonstandard currency code: must be 40 characters');
  }

  const bytes = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x00) break;
    result += String.fromCharCode(bytes[i]);
  }

  return result;
}

export function IsHexAddress(value: string): value is Hex {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

export function FormatNumberToEnglish(num: number, decimals: number = 1): string {
  if (isNaN(num) || num === null) {
    return '0';
  }

  if (num === 0) {
    return '0';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const sign = isNegative ? '-' : '';

  const units: { threshold: number; suffix: string }[] = [
    { threshold: 1_000_000_000_000, suffix: 'T' },
    { threshold: 1_000_000_000, suffix: 'B' },
    { threshold: 1_000_000, suffix: 'M' },
    { threshold: 1_000, suffix: 'K' },
    { threshold: 1, suffix: '' },
  ];

  for (const unit of units) {
    if (absNum >= unit.threshold) {
      const formatted = (absNum / unit.threshold).toFixed(decimals);
      const cleaned = parseFloat(formatted).toString();
      return `${sign}${cleaned}${unit.suffix}`;
    }
  }

  return `${sign}${absNum.toFixed(decimals)}`;
}
