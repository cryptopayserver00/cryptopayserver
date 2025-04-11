export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://tronscan.org/#/transaction/${hash}` : `https://nile.tronscan.org/#/transaction/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://tronscan.org/#/address/${address}` : `https://nile.tronscan.org/#/address/${address}`;
}
