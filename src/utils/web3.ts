import {
  BLOCKCHAINNAMES,
  CHAINIDS,
  CHAINNAMES,
  CHAINPATHNAMES,
  CHAINS,
  COIN,
  COINS,
} from 'packages/constants/blockchain';
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
  GetBlockchainAddressUrl as GetArbNovaBlockchainAddressUrl,
  GetBlockchainTxUrl as GetArbNovaBlockchainTxUrl,
} from './chain/arbnova';
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
import {
  bitcoin,
  bitcoinTestnet,
  xrplevmTestnet,
  mainnet,
  sepolia,
  tron,
  solana,
  solanaDevnet,
  bsc,
  bscTestnet,
  arbitrum,
  arbitrumNova,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  polygon,
  polygonAmoy,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  AppKitNetwork,
} from '@reown/appkit/networks';

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

export function FindCoinsByMainnetAndName(isMainnet: boolean, name: CHAINNAMES): COINS[] {
  let coins = BLOCKCHAINNAMES.find((item) => item.name === name && item.isMainnet == isMainnet)?.coins as COIN[];
  coins = coins.filter((item) => !item.isMainCoin);
  let coinName: COINS[] = [];
  coins.map((item) => {
    coinName.push(item.name);
  });

  return coinName;
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
    case CHAINNAMES.ARBITRUMNOVA:
      return CHAINS.ARBITRUMNOVA;
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
    case CHAINS.ARBITRUMNOVA:
      return CHAINNAMES.ARBITRUMNOVA;
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

export function FindChainPathNamesByChains(chains: CHAINS): CHAINPATHNAMES {
  switch (chains) {
    case CHAINS.BITCOIN:
      return CHAINPATHNAMES.BITCOIN;
    case CHAINS.LITECOIN:
      return CHAINPATHNAMES.LITECOIN;
    case CHAINS.XRP:
      return CHAINPATHNAMES.XRP;
    case CHAINS.BITCOINCASH:
      return CHAINPATHNAMES.BITCOINCASH;
    case CHAINS.ETHEREUM:
      return CHAINPATHNAMES.ETHEREUM;
    case CHAINS.TRON:
      return CHAINPATHNAMES.TRON;
    case CHAINS.SOLANA:
      return CHAINPATHNAMES.SOLANA;
    case CHAINS.BSC:
      return CHAINPATHNAMES.BSC;
    case CHAINS.ARBITRUM:
      return CHAINPATHNAMES.ARBITRUM;
    case CHAINS.ARBITRUMNOVA:
      return CHAINPATHNAMES.ARBITRUMNOVA;
    case CHAINS.AVALANCHE:
      return CHAINPATHNAMES.AVALANCHE;
    case CHAINS.POLYGON:
      return CHAINPATHNAMES.POLYGON;
    case CHAINS.BASE:
      return CHAINPATHNAMES.BASE;
    case CHAINS.OPTIMISM:
      return CHAINPATHNAMES.OPTIMISM;
    case CHAINS.TON:
      return CHAINPATHNAMES.TON;
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
    case CHAINS.ARBITRUMNOVA:
      return GetArbNovaBlockchainTxUrl(hash);
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
    case CHAINS.ARBITRUMNOVA:
      return GetArbNovaBlockchainAddressUrl(address);
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

export function GetChainIds(isMainnet: boolean, chain: CHAINS): CHAINIDS {
  switch (chain) {
    case CHAINS.BITCOIN:
      return isMainnet ? CHAINIDS.BITCOIN : CHAINIDS.BITCOIN_TESTNET;
    case CHAINS.LITECOIN:
      return isMainnet ? CHAINIDS.LITECOIN : CHAINIDS.LITECOIN_TESTNET;
    case CHAINS.XRP:
      return isMainnet ? CHAINIDS.XRP : CHAINIDS.XRP_TESTNET;
    case CHAINS.BITCOINCASH:
      return isMainnet ? CHAINIDS.BITCOINCASH : CHAINIDS.BITCOINCASH_TESTNET;
    case CHAINS.ETHEREUM:
      return isMainnet ? CHAINIDS.ETHEREUM : CHAINIDS.ETHEREUM_SEPOLIA;
    case CHAINS.TRON:
      return isMainnet ? CHAINIDS.TRON : CHAINIDS.TRON_NILE;
    case CHAINS.SOLANA:
      return isMainnet ? CHAINIDS.SOLANA : CHAINIDS.SOLANA_DEVNET;
    case CHAINS.BSC:
      return isMainnet ? CHAINIDS.BSC : CHAINIDS.BSC_TESTNET;
    case CHAINS.ARBITRUM:
      return isMainnet ? CHAINIDS.ARBITRUM_ONE : CHAINIDS.ARBITRUM_SEPOLIA;
    case CHAINS.ARBITRUMNOVA:
      return CHAINIDS.ARBITRUM_NOVA;
    case CHAINS.AVALANCHE:
      return isMainnet ? CHAINIDS.AVALANCHE : CHAINIDS.AVALANCHE_TESTNET;
    case CHAINS.POLYGON:
      return isMainnet ? CHAINIDS.POLYGON : CHAINIDS.POLYGON_TESTNET;
    case CHAINS.BASE:
      return isMainnet ? CHAINIDS.BASE : CHAINIDS.BASE_SEPOLIA;
    case CHAINS.OPTIMISM:
      return isMainnet ? CHAINIDS.OPTIMISM : CHAINIDS.OPTIMISM_SEPOLIA;
    case CHAINS.TON:
      return isMainnet ? CHAINIDS.TON : CHAINIDS.TON_TESTNET;
    default:
      return CHAINIDS.NONE;
  }
}

export function GetWalletConnectNetwork(chainIds: CHAINIDS): AppKitNetwork | undefined {
  switch (chainIds) {
    case CHAINIDS.BITCOIN:
      return bitcoin;
    case CHAINIDS.BITCOIN_TESTNET:
      return bitcoinTestnet;
    case (CHAINIDS.LITECOIN, CHAINIDS.LITECOIN_TESTNET):
      break;
    case CHAINIDS.XRP:
      break;
    case CHAINIDS.XRP_TESTNET:
      return xrplevmTestnet;
    case (CHAINIDS.BITCOINCASH, CHAINIDS.BITCOINCASH_TESTNET):
      break;
    case CHAINIDS.ETHEREUM:
      return mainnet;
    case CHAINIDS.ETHEREUM_SEPOLIA:
      return sepolia;
    case CHAINIDS.TRON:
      return tron;
    case CHAINIDS.TRON_NILE:
      break;
    case CHAINIDS.SOLANA:
      return solana;
    case CHAINIDS.SOLANA_DEVNET:
      return solanaDevnet;
    case CHAINIDS.BSC:
      return bsc;
    case CHAINIDS.BSC_TESTNET:
      return bscTestnet;
    case CHAINIDS.ARBITRUM_ONE:
      return arbitrum;
    case CHAINIDS.ARBITRUM_NOVA:
      return arbitrumNova;
    case CHAINIDS.ARBITRUM_SEPOLIA:
      return arbitrumSepolia;
    case CHAINIDS.AVALANCHE:
      return avalanche;
    case CHAINIDS.AVALANCHE_TESTNET:
      return avalancheFuji;
    case CHAINIDS.POLYGON:
      return polygon;
    case CHAINIDS.POLYGON_TESTNET:
      return polygonAmoy;
    case CHAINIDS.BASE:
      return base;
    case CHAINIDS.BASE_SEPOLIA:
      return baseSepolia;
    case CHAINIDS.OPTIMISM:
      return optimism;
    case CHAINIDS.OPTIMISM_SEPOLIA:
      return optimismSepolia;
    case (CHAINIDS.TON, CHAINIDS.TON_TESTNET):
      break;
  }

  return undefined;
}
