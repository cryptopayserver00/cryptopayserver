export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://optimistic.etherscan.io/tx/${hash}` : `https://sepolia-optimism.etherscan.io/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, hash: string): string {
  return isMainnet
    ? `https://optimistic.etherscan.io/address/${hash}`
    : `https://sepolia-optimism.etherscan.io/address/${hash}`;
}
