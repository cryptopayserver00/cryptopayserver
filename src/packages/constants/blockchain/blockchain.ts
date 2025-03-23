import { CHAINNAMES, CHAINS, CHAINIDS } from './chain';
import { COINS } from './coin';

export type COIN = {
  chainId: CHAINS;
  name: COINS;
  isMainCoin: boolean;
  symbol: COINS;
  contractAddress?: string;
  decimals: number;
  displayDecimals: number;
  icon: any;
};

export const BITCOIN_COINS: COIN[] = [
  {
    chainId: CHAINS.BITCOIN,
    name: COINS.BTC,
    isMainCoin: true,
    symbol: COINS.BTC,
    decimals: 8,
    displayDecimals: 8,
    icon: require('assets/coin/btc.svg'),
  },
];

export const LITECOIN_COINS: COIN[] = [
  {
    chainId: CHAINS.LITECOIN,
    name: COINS.LTC,
    isMainCoin: true,
    symbol: COINS.LTC,
    decimals: 8,
    displayDecimals: 8,
    icon: require('assets/coin/ltc.svg'),
  },
];

export const XRP_COINS: COIN[] = [
  {
    chainId: CHAINS.XRP,
    name: COINS.XRP,
    isMainCoin: true,
    symbol: COINS.XRP,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/xrp.svg'),
  },
];

export const BITCOINCASH_COINS: COIN[] = [
  {
    chainId: CHAINS.BITCOINCASH,
    name: COINS.BCH,
    isMainCoin: true,
    symbol: COINS.BCH,
    decimals: 8,
    displayDecimals: 8,
    icon: require('assets/coin/bch.svg'),
  },
];

export const ETHEREUM_COINS: COIN[] = [
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.DAI,
    isMainCoin: false,
    symbol: COINS.DAI,
    decimals: 18,
    displayDecimals: 2,
    contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    icon: require('assets/coin/dai.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.SHIB,
    isMainCoin: false,
    symbol: COINS.SHIB,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    icon: require('assets/coin/shib.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.LINK,
    isMainCoin: false,
    symbol: COINS.LINK,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    icon: require('assets/coin/link.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.UNI,
    isMainCoin: false,
    symbol: COINS.UNI,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    icon: require('assets/coin/uni.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.WBTC,
    isMainCoin: false,
    symbol: COINS.WBTC,
    decimals: 8,
    displayDecimals: 8,
    contractAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    icon: require('assets/coin/wbtc.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.WETH,
    isMainCoin: false,
    symbol: COINS.WETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    icon: require('assets/coin/weth.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.POL,
    isMainCoin: false,
    symbol: COINS.POL,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    icon: require('assets/coin/pol.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.ARB,
    isMainCoin: false,
    symbol: COINS.ARB,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1',
    icon: require('assets/coin/arb.svg'),
  },
];

export const ETHEREUM_SEPOLIA_COINS: COIN[] = [
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xf93D3ae82636bD3d2f62C3EcE339F2171f022Fc0',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0x9b9064B41D71fba74833f921a7ab1E248095648C',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.ETHEREUM,
    name: COINS.DAI,
    isMainCoin: false,
    symbol: COINS.DAI,
    decimals: 18,
    displayDecimals: 2,
    contractAddress: '0x65f0A9f3506B7248e568d1C6EFFbCFC93f82A02C',
    icon: require('assets/coin/dai.svg'),
  },
];

export const TRON_COINS: COIN[] = [
  {
    chainId: CHAINS.TRON,
    name: COINS.TRX,
    isMainCoin: true,
    symbol: COINS.TRX,
    decimals: 6,
    displayDecimals: 4,
    icon: require('assets/coin/trx.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 4,
    contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 4,
    contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.BTC,
    isMainCoin: false,
    symbol: COINS.BTC,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    icon: require('assets/coin/btc.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.LTC,
    isMainCoin: false,
    symbol: COINS.LTC,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: 'TR3DLthpnDdCGabhVDbD3VMsiJoCXY3bZd',
    icon: require('assets/coin/ltc.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.ETH,
    isMainCoin: false,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: 'TRFe3hT5oYhjSZ6f3ji5FJ7YCfrkWnHRvh',
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.DOGE,
    isMainCoin: false,
    symbol: COINS.DOGE,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: 'THbVQp8kMjStKNnf2iCY6NEzThKMK5aBHg',
    icon: require('assets/coin/doge.svg'),
  },
];

export const TRON_NILE_COINS: COIN[] = [
  {
    chainId: CHAINS.TRON,
    name: COINS.TRX,
    isMainCoin: true,
    symbol: COINS.TRX,
    decimals: 6,
    displayDecimals: 4,
    icon: require('assets/coin/trx.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 4,
    contractAddress: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 4,
    contractAddress: 'TEMVynQpntMqkPxP6wXTW2K7e4sM3cRmWz',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.TRON,
    name: COINS.ETH,
    isMainCoin: false,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: 'TAZ4ffZYCbgdRvUQ8ugPD6aab84ja21XWo',
    icon: require('assets/coin/eth.svg'),
  },
];

export const SOLANA_COINS: COIN[] = [
  {
    chainId: CHAINS.SOLANA,
    name: COINS.SOL,
    isMainCoin: true,
    symbol: COINS.SOL,
    decimals: 9,
    displayDecimals: 6,
    icon: require('assets/coin/sol.svg'),
  },
  {
    chainId: CHAINS.SOLANA,
    name: COINS.WSOL,
    isMainCoin: false,
    symbol: COINS.WSOL,
    decimals: 9,
    displayDecimals: 6,
    contractAddress: 'So11111111111111111111111111111111111111112',
    icon: require('assets/coin/sol.svg'),
  },
  {
    chainId: CHAINS.SOLANA,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.SOLANA,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    icon: require('assets/coin/usdc.svg'),
  },
];

export const SOLANA_DEVNET_COINS: COIN[] = [
  {
    chainId: CHAINS.SOLANA,
    name: COINS.SOL,
    isMainCoin: true,
    symbol: COINS.SOL,
    decimals: 9,
    displayDecimals: 6,
    icon: require('assets/coin/sol.svg'),
  },
  {
    chainId: CHAINS.SOLANA,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
    icon: require('assets/coin/usdc.svg'),
  },
];

export const BSC_COINS: COIN[] = [
  {
    chainId: CHAINS.BSC,
    name: COINS.BNB,
    isMainCoin: true,
    symbol: COINS.BNB,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/bnb.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.BUSD,
    isMainCoin: false,
    symbol: COINS.BUSD,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    icon: require('assets/coin/busd.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x55d398326f99059ff775485246999027b3197955',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.ETH,
    isMainCoin: false,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    icon: require('assets/coin/eth.svg'),
  },
];

export const BSC_TESTNET_COINS: COIN[] = [
  {
    chainId: CHAINS.BSC,
    name: COINS.BNB,
    isMainCoin: true,
    symbol: COINS.BNB,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/bnb.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.BUSD,
    isMainCoin: false,
    symbol: COINS.BUSD,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xf93D3ae82636bD3d2f62C3EcE339F2171f022Fc0',
    icon: require('assets/coin/busd.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x8a10400271f38acea7d22e4968d37e32276ebac5',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x8A34885Ade76107DD62b86DAb41e2A613c3609Bc',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.BSC,
    name: COINS.ETH,
    isMainCoin: false,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xaD3603d21564Bdbd2867dc719724b23992508129',
    icon: require('assets/coin/eth.svg'),
  },
];

export const ARBITRUM_COINS: COIN[] = [
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.WBTC,
    isMainCoin: false,
    symbol: COINS.WBTC,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
    icon: require('assets/coin/wbtc.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.LINK,
    isMainCoin: false,
    symbol: COINS.LINK,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xf97f4df75117a78c1a5a0dbb814af92458539fb4',
    icon: require('assets/coin/link.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.WETH,
    isMainCoin: false,
    symbol: COINS.WETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    icon: require('assets/coin/weth.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.UNI,
    isMainCoin: false,
    symbol: COINS.UNI,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0',
    icon: require('assets/coin/uni.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.DAI,
    isMainCoin: false,
    symbol: COINS.DAI,
    decimals: 18,
    displayDecimals: 2,
    contractAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    icon: require('assets/coin/dai.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.PEPE,
    isMainCoin: false,
    symbol: COINS.PEPE,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x25d887ce7a35172c62febfd67a1856f20faebb00',
    icon: require('assets/coin/pepe.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.ARB,
    isMainCoin: false,
    symbol: COINS.ARB,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x912ce59144191c1204e64559fe8253a0e49e6548',
    icon: require('assets/coin/arb.svg'),
  },
];

export const ARBITRUM_SEPOLIA_COINS: COIN[] = [
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xB66bCDAcEa9c008f5Fa78Aa3E06E081d60c4C045',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.ARBITRUM,
    name: COINS.DAI,
    isMainCoin: false,
    symbol: COINS.DAI,
    decimals: 18,
    displayDecimals: 2,
    contractAddress: '0x07d77913Bc824eDa81Fe18EE9eeC0Cdf81cEa790',
    icon: require('assets/coin/usdt.svg'),
  },
];

export const AVALANCHE_COINS: COIN[] = [
  {
    chainId: CHAINS.AVALANCHE,
    name: COINS.AVAX,
    isMainCoin: true,
    symbol: COINS.AVAX,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/avax.svg'),
  },
  {
    chainId: CHAINS.AVALANCHE,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.AVALANCHE,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.AVALANCHE,
    name: COINS.BTC,
    isMainCoin: false,
    symbol: COINS.BTC,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
    icon: require('assets/coin/btc.svg'),
  },
  {
    chainId: CHAINS.AVALANCHE,
    name: COINS.WBTC,
    isMainCoin: false,
    symbol: COINS.WBTC,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: '0x50b7545627a5162F82A992c33b87aDc75187B218',
    icon: require('assets/coin/wbtc.svg'),
  },
];

export const AVALANCHE_TESTNET_COINS: COIN[] = [
  {
    chainId: CHAINS.AVALANCHE,
    name: COINS.AVAX,
    isMainCoin: true,
    symbol: COINS.AVAX,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/avax.svg'),
  },
];

export const POLYGON_COINS: COIN[] = [
  {
    chainId: CHAINS.POLYGON,
    name: COINS.POL,
    isMainCoin: true,
    symbol: COINS.POL,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/pol.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.WSOL,
    isMainCoin: false,
    symbol: COINS.WSOL,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xd93f7e271cb87c23aaa73edc008a79646d1f9912',
    icon: require('assets/coin/sol.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.WETH,
    isMainCoin: false,
    symbol: COINS.WETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    icon: require('assets/coin/weth.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.BNB,
    isMainCoin: false,
    symbol: COINS.BNB,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3',
    icon: require('assets/coin/bnb.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.LINK,
    isMainCoin: false,
    symbol: COINS.LINK,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xb0897686c545045afc77cf20ec7a532e3120e0f1',
    icon: require('assets/coin/link.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.AVAX,
    isMainCoin: false,
    symbol: COINS.AVAX,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b',
    icon: require('assets/coin/avax.svg'),
  },
  {
    chainId: CHAINS.POLYGON,
    name: COINS.SHIB,
    isMainCoin: false,
    symbol: COINS.SHIB,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x6f8a06447ff6fcf75d803135a7de15ce88c1d4ec',
    icon: require('assets/coin/shib.svg'),
  },
];

export const POLYGON_TESTNET_COINS: COIN[] = [
  {
    chainId: CHAINS.POLYGON,
    name: COINS.POL,
    isMainCoin: true,
    symbol: COINS.POL,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/pol.svg'),
  },
];

export const BASE_COINS: COIN[] = [
  {
    chainId: CHAINS.BASE,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.BASE,
    name: COINS.WBTC,
    isMainCoin: false,
    symbol: COINS.WBTC,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c',
    icon: require('assets/coin/wbtc.svg'),
  },
  {
    chainId: CHAINS.BASE,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.BASE,
    name: COINS.WETH,
    isMainCoin: false,
    symbol: COINS.WETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x4200000000000000000000000000000000000006',
    icon: require('assets/coin/weth.svg'),
  },
];

export const BASE_SEPOLIA_COINS: COIN[] = [
  {
    chainId: CHAINS.BASE,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
];

export const OPTIMISM_COINS: COIN[] = [
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.OP,
    isMainCoin: false,
    symbol: COINS.OP,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x4200000000000000000000000000000000000042',
    icon: require('assets/coin/op.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 4,
    contractAddress: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 4,
    contractAddress: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.WETH,
    isMainCoin: false,
    symbol: COINS.WETH,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x4200000000000000000000000000000000000006',
    icon: require('assets/coin/weth.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.WBTC,
    isMainCoin: false,
    symbol: COINS.WBTC,
    decimals: 8,
    displayDecimals: 6,
    contractAddress: '0x68f180fcce6836688e9084f035309e29bf0a2095',
    icon: require('assets/coin/wbtc.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.DAI,
    isMainCoin: false,
    symbol: COINS.DAI,
    decimals: 18,
    displayDecimals: 2,
    contractAddress: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
    icon: require('assets/coin/dai.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.LINK,
    isMainCoin: false,
    symbol: COINS.LINK,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6',
    icon: require('assets/coin/link.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.W,
    isMainCoin: false,
    symbol: COINS.W,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91',
    icon: require('assets/coin/w.svg'),
  },
];

export const OPTIMISM_SEPOLIA_COINS: COIN[] = [
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.ETH,
    isMainCoin: true,
    symbol: COINS.ETH,
    decimals: 18,
    displayDecimals: 8,
    icon: require('assets/coin/eth.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0xf93D3ae82636bD3d2f62C3EcE339F2171f022Fc0',
    icon: require('assets/coin/usdt.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.USDC,
    isMainCoin: false,
    symbol: COINS.USDC,
    decimals: 6,
    displayDecimals: 2,
    contractAddress: '0x00ab5cfCcA17249c31B0F478c6058Cfd44166e4C',
    icon: require('assets/coin/usdc.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.DAI,
    isMainCoin: false,
    symbol: COINS.DAI,
    decimals: 18,
    displayDecimals: 2,
    contractAddress: '0x9b9064B41D71fba74833f921a7ab1E248095648C',
    icon: require('assets/coin/dai.svg'),
  },
  {
    chainId: CHAINS.OPTIMISM,
    name: COINS.OP,
    isMainCoin: false,
    symbol: COINS.OP,
    decimals: 18,
    displayDecimals: 8,
    contractAddress: '0x257144bEb41Dd19c90aa71c7874D6a725829227b',
    icon: require('assets/coin/op.svg'),
  },
];

export const TON_COINS: COIN[] = [
  {
    chainId: CHAINS.TON,
    name: COINS.TON,
    isMainCoin: true,
    symbol: COINS.TON,
    decimals: 9,
    displayDecimals: 9,
    icon: require('assets/coin/ton.svg'),
  },
  {
    chainId: CHAINS.TON,
    name: COINS.USDT,
    isMainCoin: false,
    symbol: COINS.USDT,
    decimals: 6,
    displayDecimals: 4,
    contractAddress: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    icon: require('assets/coin/usdt.svg'),
  },
];

export const TON_TESTNET_COINS: COIN[] = [
  {
    chainId: CHAINS.TON,
    name: COINS.TON,
    isMainCoin: true,
    symbol: COINS.TON,
    decimals: 9,
    displayDecimals: 9,
    icon: require('assets/coin/ton.svg'),
  },
];

export type BLOCKCHAIN = {
  name: CHAINNAMES;
  desc: string;
  chainId: CHAINIDS;
  explorerUrl?: string;
  websiteUrl?: string;
  isMainnet: boolean;
  rpc?: string[];
  icon?: any;

  coins: COIN[];

  time?: number;
};

export const BLOCKCHAINNAMES: BLOCKCHAIN[] = [
  {
    name: CHAINNAMES.BITCOIN,
    desc: 'Bitcoin is a decentralized digital currency that operates on a peer-to-peer network, enabling secure, anonymous transactions worldwide.',
    chainId: CHAINIDS.BITCOIN,
    explorerUrl: 'https://mempool.space',
    websiteUrl: 'https://bitcoin.org',
    isMainnet: true,
    coins: BITCOIN_COINS,
    rpc: ['https://mempool.space'],
    icon: require('assets/chain/bitcoin.svg'),
  },
  {
    name: CHAINNAMES.BITCOIN,
    desc: 'Bitcoin is a decentralized digital currency that operates on a peer-to-peer network, enabling secure, anonymous transactions worldwide.',
    chainId: CHAINIDS.BITCOIN_TESTNET,
    explorerUrl: 'https://mempool.space/testnet',
    websiteUrl: 'https://bitcoin.org',
    isMainnet: false,
    coins: BITCOIN_COINS,
    rpc: ['https://mempool.space/testnet'],
    icon: require('assets/chain/bitcoin.svg'),
  },
  {
    name: CHAINNAMES.LITECOIN,
    desc: 'Litecoin is a peer-to-peer cryptocurrency created as a faster, more scalable alternative to Bitcoin, with lower transaction fees.',
    chainId: CHAINIDS.LITECOIN,
    explorerUrl: 'https://litecoinspace.org',
    websiteUrl: 'https://litecoin.org',
    isMainnet: true,
    coins: LITECOIN_COINS,
    rpc: ['https://litecoinspace.org'],
    icon: require('assets/chain/litecoin.svg'),
  },
  {
    name: CHAINNAMES.LITECOIN,
    desc: 'Litecoin is a peer-to-peer cryptocurrency created as a faster, more scalable alternative to Bitcoin, with lower transaction fees.',
    chainId: CHAINIDS.LITECOIN_TESTNET,
    explorerUrl: 'https://litecoinspace.org/testnet',
    websiteUrl: 'https://litecoin.org',
    isMainnet: false,
    coins: LITECOIN_COINS,
    rpc: ['https://litecoinspace.org/testnet'],
    icon: require('assets/chain/litecoin.svg'),
  },
  {
    name: CHAINNAMES.XRP,
    desc: 'The XRP Ledger (XRPL) is a decentralized, public blockchain led by a global community of businesses and developers looking to solve problems and create value.',
    chainId: CHAINIDS.XRP,
    explorerUrl: 'livenet.xrpl.org',
    websiteUrl: 'https://xrpl.org',
    isMainnet: true,
    coins: XRP_COINS,
    rpc: [],
    icon: require('assets/chain/xrp.svg'),
  },
  {
    name: CHAINNAMES.XRP,
    desc: 'The XRP Ledger (XRPL) is a decentralized, public blockchain led by a global community of businesses and developers looking to solve problems and create value.',
    chainId: CHAINIDS.XRP_TESTNET,
    explorerUrl: 'https://testnet.xrpl.org/',
    websiteUrl: 'https://xrpl.org',
    isMainnet: false,
    coins: XRP_COINS,
    rpc: [],
    icon: require('assets/chain/xrp.svg'),
  },
  {
    name: CHAINNAMES.BITCOINCASH,
    desc: "Bitcoin Cash is the money of the future. It's borderless. It's secure. It's electronic cash! Info about Bitcoin Cash (BCH) for users, developers, and businesses.",
    chainId: CHAINIDS.BITCOINCASH,
    explorerUrl: 'https://blockexplorer.one/bitcoin-cash/mainnet',
    websiteUrl: 'https://bitcoincash.org',
    isMainnet: true,
    coins: BITCOINCASH_COINS,
    rpc: [],
    icon: require('assets/chain/bitcoincash.svg'),
  },
  {
    name: CHAINNAMES.BITCOINCASH,
    desc: "Bitcoin Cash is the money of the future. It's borderless. It's secure. It's electronic cash! Info about Bitcoin Cash (BCH) for users, developers, and businesses.",
    chainId: CHAINIDS.BITCOINCASH_TESTNET,
    explorerUrl: 'https://blockexplorer.one/bitcoin-cash/testnet',
    websiteUrl: 'https://bitcoincash.org',
    isMainnet: false,
    coins: BITCOINCASH_COINS,
    rpc: [],
    icon: require('assets/chain/bitcoincash.svg'),
  },
  {
    name: CHAINNAMES.ETHEREUM,
    desc: 'Ethereum is a decentralized blockchain platform that supports smart contracts and decentralized applications (dApps), enabling programmable transactions.',
    chainId: CHAINIDS.ETHEREUM,
    explorerUrl: 'https://etherscan.io',
    websiteUrl: 'https://ethereum.org/en',
    isMainnet: true,
    coins: ETHEREUM_COINS,
    rpc: ['https://ethereum-rpc.publicnode.com'],
    icon: require('assets/chain/ethereum.svg'),
  },
  {
    name: CHAINNAMES.ETHEREUM,
    desc: 'Ethereum is a decentralized blockchain platform that supports smart contracts and decentralized applications (dApps), enabling programmable transactions.',
    chainId: CHAINIDS.ETHEREUM_SEPOLIA,
    explorerUrl: 'https://sepolia.etherscan.io',
    websiteUrl: 'https://ethereum.org/en',
    isMainnet: false,
    coins: ETHEREUM_SEPOLIA_COINS,
    rpc: ['https://ethereum-sepolia.publicnode.com'],
    icon: require('assets/chain/ethereum.svg'),
  },
  {
    name: CHAINNAMES.TRON,
    desc: 'Tron is dedicated to accelerating the decentralization of the Internet via blockchain technology and decentralized applications (DApps).',
    chainId: CHAINIDS.TRON,
    explorerUrl: 'https://tronscan.org',
    websiteUrl: 'https://tron.network',
    isMainnet: true,
    coins: TRON_COINS,
    rpc: [],
    icon: require('assets/chain/tron.svg'),
  },
  {
    name: CHAINNAMES.TRON,
    desc: 'Tron is dedicated to accelerating the decentralization of the Internet via blockchain technology and decentralized applications (DApps).',
    chainId: CHAINIDS.TRON_NILE,
    explorerUrl: 'https://tronscan.org',
    websiteUrl: 'https://tron.network',
    isMainnet: false,
    coins: TRON_NILE_COINS,
    rpc: [],
    icon: require('assets/chain/tron.svg'),
  },
  {
    name: CHAINNAMES.SOLANA,
    desc: 'Solana is a high-performance blockchain platform designed for fast, secure, and scalable decentralized applications and cryptocurrency transactions.',
    chainId: CHAINIDS.SOLANA,
    explorerUrl: 'https://explorer.solana.com',
    websiteUrl: 'https://solana.com',
    isMainnet: true,
    coins: SOLANA_COINS,
    rpc: ['https://api.mainnet-beta.solana.com'],
    icon: require('assets/chain/solana.svg'),
  },
  {
    name: CHAINNAMES.SOLANA,
    desc: 'Solana is a high-performance blockchain platform designed for fast, secure, and scalable decentralized applications and cryptocurrency transactions.',
    chainId: CHAINIDS.SOLANA_DEVNET,
    explorerUrl: 'https://explorer.solana.com?cluster=devnet',
    websiteUrl: 'https://solana.com',
    isMainnet: false,
    coins: SOLANA_DEVNET_COINS,
    rpc: ['https://api.devnet.solana.com'],
    icon: require('assets/chain/solana.svg'),
  },
  {
    name: CHAINNAMES.BSC,
    desc: 'Binance Smart Chain (BSC) is a high-speed, low-cost blockchain platform for building decentralized applications and executing smart contracts.',
    chainId: CHAINIDS.BSC,
    explorerUrl: 'https://bscscan.com',
    websiteUrl: 'https://binance.com',
    isMainnet: true,
    coins: BSC_COINS,
    rpc: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org',
      'https://bsc-dataseed4.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://bsc-dataseed4.ninicoin.io',
    ],
    icon: require('assets/chain/bsc.svg'),
  },
  {
    name: CHAINNAMES.BSC,
    desc: 'Binance Smart Chain (BSC) is a high-speed, low-cost blockchain platform for building decentralized applications and executing smart contracts.',
    chainId: CHAINIDS.BSC_TESTNET,
    explorerUrl: 'https://testnet.bscscan.com',
    websiteUrl: 'https://binance.com',
    isMainnet: false,
    coins: BSC_TESTNET_COINS,
    rpc: [
      'https://data-seed-prebsc-1-s1.binance.org:8545',
      'https://data-seed-prebsc-2-s1.binance.org:8545',
      'https://data-seed-prebsc-1-s2.binance.org:8545',
      'https://data-seed-prebsc-2-s2.binance.org:8545',
      'https://data-seed-prebsc-1-s3.binance.org:8545',
      'https://data-seed-prebsc-2-s3.binance.org:8545',
    ],
    icon: require('assets/chain/bsc.svg'),
  },
  {
    name: CHAINNAMES.ARBITRUM,
    desc: 'The ultimate Layer 2 scaling solution designed to enhance your Ethereum experience. Build faster, scale seamlessly, and unlock the full potential of the leading Layer 1 ecosystem.',
    chainId: CHAINIDS.ARBITRUM_ONE,
    explorerUrl: 'https://arbiscan.io',
    websiteUrl: 'https://arbitrum.io',
    isMainnet: true,
    coins: ARBITRUM_COINS,
    rpc: [
      'https://arb1.arbitrum.io/rpc',
      'https://arbitrum.llamarpc.com',
      // 'https://arbitrum.meowrpc.com',
      'https://arbitrum.drpc.org',
      'https://arbitrum-one.publicnode.com',
      'https://arbitrum-one-rpc.publicnode.com',
      'https://1rpc.io/arb',
    ],
    icon: require('assets/chain/arbitrum.svg'),
  },
  {
    name: CHAINNAMES.ARBITRUM,
    desc: 'The ultimate Layer 2 scaling solution designed to enhance your Ethereum experience. Build faster, scale seamlessly, and unlock the full potential of the leading Layer 1 ecosystem.',
    chainId: CHAINIDS.ARBITRUM_SEPOLIA,
    explorerUrl: 'https://sepolia.arbiscan.io',
    websiteUrl: 'https://arbitrum.io',
    isMainnet: false,
    coins: ARBITRUM_SEPOLIA_COINS,
    rpc: ['https://sepolia-rollup.arbitrum.io/rpc'],
    icon: require('assets/chain/arbitrum.svg'),
  },
  {
    name: CHAINNAMES.AVALANCHE,
    desc: 'Avalanche is a smart contracts platform that scales infinitely and regularly finalizes transactions in less than one second. Build anything you want, any way you want, on the eco-friendly blockchain designed for Web3 developers.',
    chainId: CHAINIDS.AVALANCHE,
    explorerUrl: 'https://snowtrace.io',
    websiteUrl: 'https://www.avax.network',
    isMainnet: true,
    coins: AVALANCHE_COINS,
    rpc: [
      'https://avalanche-c-chain-rpc.publicnode.com',
      'https://avalanche.drpc.org',
      // 'https://avax.meowrpc.com',
      'https://1rpc.io/avax/c',
    ],
    icon: require('assets/chain/avalanche.svg'),
  },
  {
    name: CHAINNAMES.AVALANCHE,
    desc: 'Avalanche is a smart contracts platform that scales infinitely and regularly finalizes transactions in less than one second. Build anything you want, any way you want, on the eco-friendly blockchain designed for Web3 developers.',
    chainId: CHAINIDS.AVALANCHE_TESTNET,
    explorerUrl: 'https://testnet.snowtrace.io',
    websiteUrl: 'https://www.avax.network',
    isMainnet: false,
    coins: AVALANCHE_TESTNET_COINS,
    rpc: [
      'https://ava-testnet.public.blastapi.io/ext/bc/C/rpc',
      // 'https://endpoints.omniatech.io/v1/avax/fuji/public',
      'https://api.avax-test.network/ext/bc/C/rpc',
    ],
    icon: require('assets/chain/avalanche.svg'),
  },
  {
    name: CHAINNAMES.POLYGON,
    desc: 'Enabling an infinitely scalable web of sovereign blockchains that feels like a single chain. Powered by ZK tech.',
    chainId: CHAINIDS.POLYGON,
    explorerUrl: 'https://polygonscan.com',
    websiteUrl: 'https://polygon.technology',
    isMainnet: true,
    coins: POLYGON_COINS,
    rpc: ['https://polygon-bor-rpc.publicnode.com', 'https://polygon-pokt.nodies.app', 'https://1rpc.io/matic'],
    icon: require('assets/chain/polygon.svg'),
  },
  {
    name: CHAINNAMES.POLYGON,
    desc: 'Enabling an infinitely scalable web of sovereign blockchains that feels like a single chain. Powered by ZK tech.',
    chainId: CHAINIDS.POLYGON_TESTNET,
    explorerUrl: 'https://amoy.polygonscan.com',
    websiteUrl: 'https://polygon.technology',
    isMainnet: false,
    coins: POLYGON_TESTNET_COINS,
    rpc: [
      'https://polygon-amoy-bor-rpc.publicnode.com',
      'https://rpc-amoy.polygon.technology',
      // 'https://polygon-amoy.drpc.org',
    ],
    icon: require('assets/chain/polygon.svg'),
  },
  {
    name: CHAINNAMES.BASE,
    desc: 'Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain.',
    chainId: CHAINIDS.BASE,
    explorerUrl: 'https://basescan.org',
    websiteUrl: 'https://www.base.org',
    isMainnet: true,
    coins: BASE_COINS,
    rpc: [
      'https://base.llamarpc.com',
      'https://mainnet.base.org',
      'https://developer-access-mainnet.base.org',
      'https://1rpc.io/base',
      'https://base-pokt.nodies.app',
      // 'https://base.meowrpc.com',
      'https://base-rpc.publicnode.com',
      // 'https://base.drpc.org',
    ],
    icon: require('assets/chain/base.svg'),
  },
  {
    name: CHAINNAMES.BASE,
    desc: 'Base is a secure, low-cost, builder-friendly Ethereum L2 built to bring the next billion users onchain.',
    chainId: CHAINIDS.BASE_SEPOLIA,
    explorerUrl: 'https://sepolia.basescan.org',
    websiteUrl: 'https://www.base.org',
    isMainnet: false,
    coins: BASE_SEPOLIA_COINS,
    rpc: [
      'https://base-sepolia-rpc.publicnode.com',
      'https://sepolia.base.org',
      'https://base-sepolia.gateway.tenderly.co',
    ],
    icon: require('assets/chain/base.svg'),
  },
  {
    name: CHAINNAMES.OPTIMISM,
    desc: 'Optimism is a Collective of companies, communities, and citizens working together to reward public goods and build a sustainable future for Ethereum.',
    chainId: CHAINIDS.OPTIMISM,
    explorerUrl: 'https://optimistic.etherscan.io',
    websiteUrl: 'https://www.optimism.io',
    isMainnet: true,
    coins: OPTIMISM_COINS,
    rpc: [
      'https://mainnet.optimism.io',
      'https://optimism-rpc.publicnode.com',
      'https://op-pokt.nodies.app',
      'https://1rpc.io/op',
    ],
    icon: require('assets/chain/optimism.svg'),
  },
  {
    name: CHAINNAMES.OPTIMISM,
    desc: 'Optimism is a Collective of companies, communities, and citizens working together to reward public goods and build a sustainable future for Ethereum.',
    chainId: CHAINIDS.OPTIMISM_SEPOLIA,
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
    websiteUrl: 'https://www.optimism.io',
    isMainnet: false,
    coins: OPTIMISM_SEPOLIA_COINS,
    rpc: [
      'https://sepolia.optimism.io',
      'https://optimism-sepolia.drpc.org',
      // 'https://endpoints.omniatech.io/v1/op/sepolia/public',
    ],
    icon: require('assets/chain/optimism.svg'),
  },
  {
    name: CHAINNAMES.TON,
    desc: 'A decentralized and open internet, created by the community using a technology designed by Telegram.',
    chainId: CHAINIDS.TON,
    explorerUrl: 'https://tonscan.org',
    websiteUrl: 'https://ton.org',
    isMainnet: true,
    coins: TON_COINS,
    rpc: ['https://tonscan.org'],
    icon: require('assets/chain/ton.svg'),
  },
  {
    name: CHAINNAMES.TON,
    desc: 'A decentralized and open internet, created by the community using a technology designed by Telegram.',
    chainId: CHAINIDS.TON_TESTNET,
    explorerUrl: 'https://testnet.tonscan.org',
    websiteUrl: 'https://ton.org',
    isMainnet: false,
    coins: TON_TESTNET_COINS,
    rpc: ['https://testnet.tonscan.org'],
    icon: require('assets/chain/ton.svg'),
  },
];
