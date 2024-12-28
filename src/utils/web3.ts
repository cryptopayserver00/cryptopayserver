import { BLOCKCHAINNAMES, CHAINIDS, CHAINNAMES, CHAINS, COIN, COINS } from 'packages/constants/blockchain';
import {
  GetBlockchainAddressUrl as GetBTCBlockchainAddressUrl,
  GetBlockchainTxUrl as GetBTCBlockchainTxUrl,
} from './chain/btc';
import {
  GetBlockchainAddressUrl as GetETHBlockchainAddressUrl,
  GetBlockchainTxUrl as GetETHBlockchainTxUrl,
} from './chain/eth';
import {
  GetBlockchainAddressUrl as GetSolanaBlockchainAddressUrl,
  GetBlockchainTxUrl as GetSolanaBlockchainTxUrl,
} from './chain/solana';
import {
  GetBlockchainAddressUrl as GetBscBlockchainAddressUrl,
  GetBlockchainTxUrl as GetBscBlockchainTxUrl,
} from './chain/bsc';
import {
  GetBlockchainAddressUrl as GetLtcBlockchainAddressUrl,
  GetBlockchainTxUrl as GetLtcBlockchainTxUrl,
} from './chain/ltc';
import {
  GetBlockchainAddressUrl as GetTronBlockchainAddressUrl,
  GetBlockchainTxUrl as GetTronBlockchainTxUrl,
} from './chain/tron';

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

export function GetBlockchainTxUrlByChainIds(isMainnet: boolean, chain: CHAINS, hash: string) {
  switch (chain) {
    case CHAINS.BITCOIN:
      return GetBTCBlockchainTxUrl(isMainnet, hash);
    case CHAINS.ETHEREUM:
      return GetETHBlockchainTxUrl(isMainnet, hash);
    case CHAINS.SOLANA:
      return GetSolanaBlockchainTxUrl(isMainnet, hash);
    case CHAINS.BSC:
      return GetBscBlockchainTxUrl(isMainnet, hash);
    case CHAINS.LITECOIN:
      return GetLtcBlockchainTxUrl(isMainnet, hash);
    case CHAINS.TRON:
      return GetTronBlockchainTxUrl(isMainnet, hash);
    default:
      return '';
  }
}

export function GetBlockchainAddressUrlByChainIds(isMainnet: boolean, chain: CHAINS, address: string) {
  switch (chain) {
    case CHAINS.BITCOIN:
      return GetBTCBlockchainAddressUrl(isMainnet, address);
    case CHAINS.ETHEREUM:
      return GetETHBlockchainAddressUrl(isMainnet, address);
    case CHAINS.SOLANA:
      return GetSolanaBlockchainAddressUrl(isMainnet, address);
    case CHAINS.BSC:
      return GetBscBlockchainAddressUrl(isMainnet, address);
    case CHAINS.LITECOIN:
      return GetLtcBlockchainAddressUrl(isMainnet, address);
    case CHAINS.TRON:
      return GetTronBlockchainAddressUrl(isMainnet, address);
    default:
      return '';
  }
}
