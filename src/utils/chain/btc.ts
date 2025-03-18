export function GetBlockchainTxUrl(isMainnet: boolean, hash: string): string {
  return isMainnet ? `https://mempool.space/tx/${hash}` : `https://mempool.space/testnet/tx/${hash}`;
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return isMainnet ? `https://mempool.space/address/${address}` : `https://mempool.space/testnet/address/${address}`;
}

export function GetNodeApi(isMainnet: boolean): string {
  return isMainnet ? 'https://mempool.space/api' : 'https://mempool.space/testnet/api';
}

export function GetBlockstreamApi(isMainnet: boolean): string {
  return isMainnet ? 'https://blockstream.info/api' : 'https://blockstream.info/testnet/api';
}
