export function GetBlockchainTxUrl(hash: string): string {
  return `https://nova.arbiscan.io/tx/${hash}`
}

export function GetBlockchainAddressUrl(isMainnet: boolean, address: string): string {
  return `https://nova.arbiscan.io/address/${address}`
}
