export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://etherscan.io/tx/${hash}` : `https://sepolia.etherscan.io/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://etherscan.io/address/${address}` : `https://sepolia.etherscan.io/address/${address}`;
}
