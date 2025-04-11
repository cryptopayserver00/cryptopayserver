export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://polygonscan.com/tx/${hash}` : `https://amoy.polygonscan.com/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://polygonscan.com/address/${address}` : `https://amoy.polygonscan.com/address/${address}`;
}
