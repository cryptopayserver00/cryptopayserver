export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://snowtrace.io/tx/${hash}` : `https://testnet.snowtrace.io/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://snowtrace.io/address/${hash}` : `https://testnet.snowtrace.io/address/${hash}`;
}
