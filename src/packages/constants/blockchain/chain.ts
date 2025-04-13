export enum CHAINIDS {
  NONE = 0,

  BITCOIN = 2,
  BITCOIN_TESTNET = 3,

  LITECOIN = 6,
  LITECOIN_TESTNET = 7,

  XRP = 8,
  XRP_TESTNET = 9,

  BITCOINCASH = 11,
  BITCOINCASH_TESTNET = 12,

  ETHEREUM = 1,
  ETHEREUM_SEPOLIA = 11155111,

  TRON = 728126428,
  TRON_NILE = 3448148188,

  SOLANA = 101,
  SOLANA_DEVNET = 103,

  BSC = 56,
  BSC_TESTNET = 97,

  ARBITRUM_ONE = 42161,
  ARBITRUM_NOVA = 42170,
  ARBITRUM_SEPOLIA = 421614,

  AVALANCHE = 43114,
  AVALANCHE_TESTNET = 43113,

  POLYGON = 137,
  POLYGON_TESTNET = 80002,

  BASE = 8453,
  BASE_SEPOLIA = 84532,

  OPTIMISM = 10,
  OPTIMISM_SEPOLIA = 11155420,

  TON = 1100,
  TON_TESTNET = 1101,
}

export enum INNERCHAINNAMES {
  BITCOIN = 'bitcoin',
  BITCOIN_TESTNET = 'bitcointestnet',

  LITECOIN = 'litecoin',
  LITECOIN_TESTNET = 'litecointestnet',

  XRP = 'xrp',
  XRP_TESTNET = 'xrptestnet',

  BITCOINCASH = 'bitcoincash',
  BITCOINCASH_TESTNET = 'bitcoincashtestnet',

  ETHEREUM = 'ethereum',
  ETHEREUM_SEPOLIA = 'sepolia',

  TRON = 'tron',
  TRON_NILE = 'tronnile',

  SOLANA = 'solana',
  SOLANA_DEVNET = 'solanadevnet',

  BSC = 'bsc',
  BSC_TESTNET = 'bsctestnet',

  ARBITRUM_ONE = 'arbitrum',
  ARBITRUM_NOVA = 'arbitrumnova',
  ARBITRUM_SEPOLIA = 'arbitrumsepolia',

  AVALANCHE = 'avalanche',
  AVALANCHE_TESTNET = 'avalanchefuji',

  POLYGON = 'polygon',
  POLYGON_TESTNET = 'polygonamoy',

  BASE = 'base',
  BASE_SEPOLIA = 'basesepolia',

  OPTIMISM = 'optimism',
  OPTIMISM_SEPOLIA = 'optimismsepolia',

  TON = 'ton',
  TON_TESTNET = 'tontestnet',
}

export enum CHAINNAMES {
  BITCOIN = 'Bitcoin',
  LITECOIN = 'Litecoin',
  XRP = 'XRP',
  BITCOINCASH = 'Bitcoin Cash',
  ETHEREUM = 'Ethereum',
  TRON = 'Tron',
  SOLANA = 'Solana',
  BSC = 'Binance smart chain',
  ARBITRUM = 'Arbitrum',
  ARBITRUMNOVA = 'Arbitrum Nova',
  AVALANCHE = 'Avalanche',
  POLYGON = 'Polygon',
  BASE = 'Base',
  OPTIMISM = 'Optimism',
  TON = 'Ton',
}

export enum CHAINPATHNAMES {
  BITCOIN = 'bitcoin',
  LITECOIN = 'litecoin',
  XRP = 'xrp',
  BITCOINCASH = 'bitcoincash',
  ETHEREUM = 'ethereum',
  TRON = 'tron',
  SOLANA = 'solana',
  BSC = 'bsc',
  ARBITRUM = 'arbitrum',
  ARBITRUMNOVA = 'arbitrumnova',
  AVALANCHE = 'avalanche',
  POLYGON = 'polygon',
  BASE = 'base',
  OPTIMISM = 'optimism',
  TON = 'ton',
}

export enum CHAINS {
  BITCOIN = 1,
  LITECOIN = 2,
  XRP = 3,
  BITCOINCASH = 4,
  ETHEREUM = 5,
  TRON = 6,
  SOLANA = 7,
  BSC = 8,
  ARBITRUM = 9,
  AVALANCHE = 10,
  POLYGON = 11,
  BASE = 12,
  OPTIMISM = 13,
  TON = 14,
  ARBITRUMNOVA = 15,
}

export const ETHEREUM_CATEGORY_CHAINS: CHAINS[] = [
  CHAINS.ETHEREUM,
  CHAINS.BSC,
  CHAINS.ARBITRUM,
  CHAINS.AVALANCHE,
  CHAINS.ARBITRUMNOVA,
  CHAINS.POLYGON,
  CHAINS.BASE,
  CHAINS.OPTIMISM,
];
