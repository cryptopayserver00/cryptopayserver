export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://arbiscan.io/tx/${hash}` : `https://sepolia.arbiscan.io/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://arbiscan.io/address/${address}` : `https://sepolia.arbiscan.io/address/${address}`;
}
