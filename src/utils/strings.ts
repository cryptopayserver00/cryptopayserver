import { generate } from 'random-words';

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
