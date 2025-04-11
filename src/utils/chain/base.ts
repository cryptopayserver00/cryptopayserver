export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://basescan.org/tx/${hash}` : `https://sepolia.basescan.org/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://basescan.org/address/${address}` : `https://sepolia.basescan.org/address/${address}`;
}
