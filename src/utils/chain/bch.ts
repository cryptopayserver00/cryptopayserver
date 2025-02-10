export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet
    ? `https://blockexplorer.one/bitcoin-cash/mainnet/tx/${hash}`
    : `https://blockexplorer.one/bitcoin-cash/testnet/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, hash: string): string {
  return isMainnet
    ? `https://blockexplorer.one/bitcoin-cash/mainnet/address/${hash}`
    : `https://blockexplorer.one/bitcoin-cash/testnet/address/${hash}`;
}
