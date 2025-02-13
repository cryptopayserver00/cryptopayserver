export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://basescan.org/tx/${hash}` : `https://sepolia.basescan.org/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://basescan.org/address/${hash}` : `https://sepolia.basescan.org/address/${hash}`;
}
