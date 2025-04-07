export function GetBlockchainTxUrl(hash: string): string {
  return `https://nova.arbiscan.io/tx/${hash}`;
}

export function GetBlockchainAddressUrl(hash: string): string {
  return `https://nova.arbiscan.io/address/${hash}`;
}
