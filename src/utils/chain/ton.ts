export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://tonscan.org/tx/${hash}` : `https://testnet.tonscan.org/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://tonscan.org/address/${address}` : `https://testnet.tonscan.org/address/${address}`;
}
