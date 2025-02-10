export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://basescan.io/tx/${hash}` : `https://sepolia.basescan.io/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://basescan.io/address/${hash}` : `https://sepolia.basescan.io/address/${hash}`;
}
