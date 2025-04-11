export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet
    ? `https://explorer.melroy.org/tx/${hash}`
    : `https://blockexplorer.one/bitcoin-cash/testnet/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet
    ? `https://explorer.melroy.org/address/${address}`
    : `https://blockexplorer.one/bitcoin-cash/testnet/address/${address}`;
}
