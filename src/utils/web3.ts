import { BLOCKCHAINNAMES, CHAINIDS, CHAINNAMES, CHAINS, COIN, COINS } from 'packages/constants/blockchain';
import {
  GetBlockchainAddressUrl as GetBTCBlockchainAddressUrl,
  GetBlockchainTxUrl as GetBTCBlockchainTxUrl,
} from './chain/btc';
import {
  GetBlockchainAddressUrl as GetLtcBlockchainAddressUrl,
  GetBlockchainTxUrl as GetLtcBlockchainTxUrl,
} from './chain/ltc';
import {
  GetBlockchainAddressUrl as GetXrpBlockchainAddressUrl,
  GetBlockchainTxUrl as GetXrpBlockchainTxUrl,
} from './chain/xrp';
import {
  GetBlockchainAddressUrl as GetBchBlockchainAddressUrl,
  GetBlockchainTxUrl as GetBchBlockchainTxUrl,
} from './chain/bch';
import {
  GetBlockchainAddressUrl as GetETHBlockchainAddressUrl,
  GetBlockchainTxUrl as GetETHBlockchainTxUrl,
} from './chain/eth';
import {
  GetBlockchainAddressUrl as GetTronBlockchainAddressUrl,
  GetBlockchainTxUrl as GetTronBlockchainTxUrl,
} from './chain/tron';
import {
  GetBlockchainAddressUrl as GetSolanaBlockchainAddressUrl,
  GetBlockchainTxUrl as GetSolanaBlockchainTxUrl,
} from './chain/solana';
import {
  GetBlockchainAddressUrl as GetBscBlockchainAddressUrl,
  GetBlockchainTxUrl as GetBscBlockchainTxUrl,
} from './chain/bsc';
import {
  GetBlockchainAddressUrl as GetArbBlockchainAddressUrl,
  GetBlockchainTxUrl as GetArbBlockchainTxUrl,
} from './chain/arb';
import {
  GetBlockchainAddressUrl as GetAvaxBlockchainAddressUrl,
  GetBlockchainTxUrl as GetAvaxBlockchainTxUrl,
} from './chain/avax';
import {
  GetBlockchainAddressUrl as GetPolBlockchainAddressUrl,
  GetBlockchainTxUrl as GetPolBlockchainTxUrl,
} from './chain/pol';
import {
  GetBlockchainAddressUrl as GetBaseBlockchainAddressUrl,
  GetBlockchainTxUrl as GetBaseBlockchainTxUrl,
} from './chain/base';
import {
  GetBlockchainAddressUrl as GetOpBlockchainAddressUrl,
  GetBlockchainTxUrl as GetOpBlockchainTxUrl,
} from './chain/op';
import {
  GetBlockchainAddressUrl as GetTonBlockchainAddressUrl,
  GetBlockchainTxUrl as GetTonBlockchainTxUrl,
} from './chain/ton';

export function FindTokenByChainIdsAndContractAddress(chainIds: CHAINIDS, contractAddress: string): COIN {
  const coins = BLOCKCHAINNAMES.find((item) => item.chainId === chainIds)?.coins;
  const token = coins?.find((item) => item.contractAddress?.toLowerCase() === contractAddress.toLowerCase());
  return token as COIN;
}

export function FindTokenByChainIdsAndSymbol(chainIds: CHAINIDS, symbol: COINS): COIN {
  const coins = BLOCKCHAINNAMES.find((item) => item.chainId === chainIds)?.coins;
  const token = coins?.find((item) => item.symbol?.toLowerCase() === symbol.toLowerCase());
  return token as COIN;
}

export function FindTokensByMainnetAndName(isMainnet: boolean, name: CHAINNAMES): COIN[] {
  return BLOCKCHAINNAMES.find((item) => item.name === name && item.isMainnet == isMainnet)?.coins as COIN[];
}

export function FindTokensByChainIds(chainIds: CHAINIDS): COIN[] {
  return BLOCKCHAINNAMES.find((item) => item.chainId === chainIds)?.coins as COIN[];
}

export function FindDecimalsByChainIdsAndContractAddress(chainIds: CHAINIDS, contractAddress: string): number {
  const coins = BLOCKCHAINNAMES.find((item) => item.chainId === chainIds)?.coins;
  const token = coins?.find((item) => item.contractAddress?.toLowerCase() === contractAddress.toLowerCase());
  return token?.decimals || 0;
}

export function FindChainIdsByChainNames(chainName: CHAINNAMES): CHAINS {
  switch (chainName) {
    case CHAINNAMES.BITCOIN:
      return CHAINS.BITCOIN;
    case CHAINNAMES.LITECOIN:
      return CHAINS.LITECOIN;
    case CHAINNAMES.XRP:
      return CHAINS.XRP;
    case CHAINNAMES.BITCOINCASH:
      return CHAINS.BITCOINCASH;
    case CHAINNAMES.ETHEREUM:
      return CHAINS.ETHEREUM;
    case CHAINNAMES.TRON:
      return CHAINS.TRON;
    case CHAINNAMES.SOLANA:
      return CHAINS.SOLANA;
    case CHAINNAMES.BSC:
      return CHAINS.BSC;
    case CHAINNAMES.ARBITRUM:
      return CHAINS.ARBITRUM;
    case CHAINNAMES.AVALANCHE:
      return CHAINS.AVALANCHE;
    case CHAINNAMES.POLYGON:
      return CHAINS.POLYGON;
    case CHAINNAMES.BASE:
      return CHAINS.BASE;
    case CHAINNAMES.OPTIMISM:
      return CHAINS.OPTIMISM;
    case CHAINNAMES.TON:
      return CHAINS.TON;
  }
}

export function FindChainNamesByChains(chains: CHAINS): CHAINNAMES {
  switch (chains) {
    case CHAINS.BITCOIN:
      return CHAINNAMES.BITCOIN;
    case CHAINS.LITECOIN:
      return CHAINNAMES.LITECOIN;
    case CHAINS.XRP:
      return CHAINNAMES.XRP;
    case CHAINS.BITCOINCASH:
      return CHAINNAMES.BITCOINCASH;
    case CHAINS.ETHEREUM:
      return CHAINNAMES.ETHEREUM;
    case CHAINS.TRON:
      return CHAINNAMES.TRON;
    case CHAINS.SOLANA:
      return CHAINNAMES.SOLANA;
    case CHAINS.BSC:
      return CHAINNAMES.BSC;
    case CHAINS.ARBITRUM:
      return CHAINNAMES.ARBITRUM;
    case CHAINS.AVALANCHE:
      return CHAINNAMES.AVALANCHE;
    case CHAINS.POLYGON:
      return CHAINNAMES.POLYGON;
    case CHAINS.BASE:
      return CHAINNAMES.BASE;
    case CHAINS.OPTIMISM:
      return CHAINNAMES.OPTIMISM;
    case CHAINS.TON:
      return CHAINNAMES.TON;
  }
}

export function GetBlockchainTxUrlByChainIds(isMainnet: boolean, chain: CHAINS, hash: string): string {
  switch (chain) {
    case CHAINS.BITCOIN:
      return GetBTCBlockchainTxUrl(isMainnet, hash);
    case CHAINS.LITECOIN:
      return GetLtcBlockchainTxUrl(isMainnet, hash);
    case CHAINS.XRP:
      return GetXrpBlockchainTxUrl(isMainnet, hash);
    case CHAINS.BITCOINCASH:
      return GetBchBlockchainTxUrl(isMainnet, hash);
    case CHAINS.ETHEREUM:
      return GetETHBlockchainTxUrl(isMainnet, hash);
    case CHAINS.TRON:
      return GetTronBlockchainTxUrl(isMainnet, hash);
    case CHAINS.SOLANA:
      return GetSolanaBlockchainTxUrl(isMainnet, hash);
    case CHAINS.BSC:
      return GetBscBlockchainTxUrl(isMainnet, hash);
    case CHAINS.ARBITRUM:
      return GetArbBlockchainTxUrl(isMainnet, hash);
    case CHAINS.AVALANCHE:
      return GetAvaxBlockchainTxUrl(isMainnet, hash);
    case CHAINS.POLYGON:
      return GetPolBlockchainTxUrl(isMainnet, hash);
    case CHAINS.BASE:
      return GetBaseBlockchainTxUrl(isMainnet, hash);
    case CHAINS.OPTIMISM:
      return GetOpBlockchainTxUrl(isMainnet, hash);
    case CHAINS.TON:
      return GetTonBlockchainTxUrl(isMainnet, hash);
    default:
      return '';
  }
}

export function GetBlockchainAddressUrlByChainIds(isMainnet: boolean, chain: CHAINS, address: string): string {
  switch (chain) {
    case CHAINS.BITCOIN:
      return GetBTCBlockchainAddressUrl(isMainnet, address);
    case CHAINS.LITECOIN:
      return GetLtcBlockchainAddressUrl(isMainnet, address);
    case CHAINS.XRP:
      return GetXrpBlockchainAddressUrl(isMainnet, address);
    case CHAINS.BITCOINCASH:
      return GetBchBlockchainAddressUrl(isMainnet, address);
    case CHAINS.ETHEREUM:
      return GetETHBlockchainAddressUrl(isMainnet, address);
    case CHAINS.TRON:
      return GetTronBlockchainAddressUrl(isMainnet, address);
    case CHAINS.SOLANA:
      return GetSolanaBlockchainAddressUrl(isMainnet, address);
    case CHAINS.BSC:
      return GetBscBlockchainAddressUrl(isMainnet, address);
    case CHAINS.ARBITRUM:
      return GetArbBlockchainAddressUrl(isMainnet, address);
    case CHAINS.AVALANCHE:
      return GetAvaxBlockchainAddressUrl(isMainnet, address);
    case CHAINS.POLYGON:
      return GetPolBlockchainAddressUrl(isMainnet, address);
    case CHAINS.BASE:
      return GetBaseBlockchainAddressUrl(isMainnet, address);
    case CHAINS.OPTIMISM:
      return GetOpBlockchainAddressUrl(isMainnet, address);
    case CHAINS.TON:
      return GetTonBlockchainAddressUrl(isMainnet, address);
    default:
      return '';
  }
}

export function GetAllMainnetChainIds(): CHAINIDS[] {
  return [
    CHAINIDS.BITCOIN,
    CHAINIDS.LITECOIN,
    CHAINIDS.XRP,
    CHAINIDS.BITCOINCASH,
    CHAINIDS.ETHEREUM,
    CHAINIDS.TRON,
    CHAINIDS.SOLANA,
    CHAINIDS.BSC,
    CHAINIDS.ARBITRUM_ONE,
    CHAINIDS.ARBITRUM_NOVA,
    CHAINIDS.AVALANCHE,
    CHAINIDS.POLYGON,
    CHAINIDS.BASE,
    CHAINIDS.OPTIMISM,
    CHAINIDS.TON,
  ];
}

export function GetAllTestnetChainIds(): CHAINIDS[] {
  return [
    CHAINIDS.BITCOIN_TESTNET,
    CHAINIDS.LITECOIN_TESTNET,
    CHAINIDS.XRP_TESTNET,
    CHAINIDS.BITCOINCASH_TESTNET,
    CHAINIDS.ETHEREUM_SEPOLIA,
    CHAINIDS.TRON_NILE,
    CHAINIDS.SOLANA_DEVNET,
    CHAINIDS.BSC_TESTNET,
    CHAINIDS.ARBITRUM_SEPOLIA,
    CHAINIDS.AVALANCHE_TESTNET,
    CHAINIDS.POLYGON_TESTNET,
    CHAINIDS.BASE_SEPOLIA,
    CHAINIDS.OPTIMISM_SEPOLIA,
    CHAINIDS.TON_TESTNET,
  ];
}
