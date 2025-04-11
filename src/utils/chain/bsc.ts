export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://bscscan.com/tx/${hash}` : `https://testnet.bscscan.com/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://bscscan.com/address/${address}` : `https://testnet.bscscan.com/address/${address}`;
}
