import { CHAINS, COINS } from 'packages/constants/blockchain';
import QRCode from 'qrcode';

export function GenerateQrCode(content: string) {
  return QRCode.toDataURL(content);
}

export function GetImgSrcByCrypto(crypto: COINS): string {
  const baseUrl = window.location.origin;

  switch (crypto) {
    case COINS.BTC:
      return baseUrl + '/coin/btc.svg';
    case COINS.ETH:
      return baseUrl + '/coin/eth.svg';
    case COINS.USDT:
      return baseUrl + '/coin/usdt.svg';
    case COINS.BNB:
      return baseUrl + '/coin/bnb.svg';
    case COINS.SOL:
      return baseUrl + '/coin/sol.svg';
    case COINS.USDC:
      return baseUrl + '/coin/usdc.svg';
    case COINS.XRP:
      return baseUrl + '/coin/xrp.svg';
    case COINS.TON:
      return baseUrl + '/coin/ton.svg';
    case COINS.DOGE:
      return baseUrl + '/coin/doge.svg';
    case COINS.ADA:
      return baseUrl + '/coin/ada.svg';
    case COINS.TRX:
      return baseUrl + '/coin/trx.svg';
    case COINS.AVAX:
      return baseUrl + '/coin/avax.svg';
    case COINS.SHIB:
      return baseUrl + '/coin/shib.svg';
    case COINS.DOT:
      return baseUrl + '/coin/dot.svg';
    case COINS.LINK:
      return baseUrl + '/coin/link.svg';
    case COINS.BCH:
      return baseUrl + '/coin/bch.svg';
    case COINS.DAI:
      return baseUrl + '/coin/dai.svg';
    case COINS.LTC:
      return baseUrl + '/coin/ltc.svg';
    case COINS.POL:
      return baseUrl + '/coin/pol.svg';
    case COINS.UNI:
      return baseUrl + '/coin/uni.svg';
    case COINS.PEPE:
      return baseUrl + '/coin/pepe.svg';
    case COINS.FIL:
      return baseUrl + '/coin/fil.svg';
    case COINS.ARB:
      return baseUrl + '/coin/arb.svg';
    case COINS.OP:
      return baseUrl + '/coin/op.svg';
    case COINS.FDUSD:
      return baseUrl + '/coin/fdusd.svg';
    case COINS.WIF:
      return baseUrl + '/coin/wif.svg';
    case COINS.NOT:
      return baseUrl + '/coin/not.svg';
    case COINS.BONK:
      return baseUrl + '/coin/bonk.svg';
    case COINS.AAVE:
      return baseUrl + '/coin/aave.svg';
    case COINS.BGB:
      return baseUrl + '/coin/bgb.svg';
    case COINS.FLOKI:
      return baseUrl + '/coin/floki.svg';
    case COINS.JUP:
      return baseUrl + '/coin/jup.svg';
    case COINS.CORE:
      return baseUrl + '/coin/core.svg';
    case COINS.ENS:
      return baseUrl + '/coin/ens.svg';
    case COINS.W:
      return baseUrl + '/coin/w.svg';
    case COINS.CRV:
      return baseUrl + '/coin/crv.svg';
    case COINS.MEW:
      return baseUrl + '/coin/mew.svg';
    case COINS.ETHFI:
      return baseUrl + '/coin/ethfi.svg';
    case COINS.BUSD:
      return baseUrl + '/coin/busd.svg';
    case COINS.WBTC:
      return baseUrl + '/coin/wbtc.svg';
    case COINS.WETH:
      return baseUrl + '/coin/weth.svg';
    case COINS.WSOL:
      return baseUrl + '/coin/sol.svg';

    default:
      return '';
  }
}

export function GetImgSrcByChain(chain: CHAINS): string {
  const baseUrl = window.location.origin;

  switch (chain) {
    case CHAINS.BITCOIN:
      return baseUrl + '/chain/bitcoin.svg';
    case CHAINS.LITECOIN:
      return baseUrl + '/chain/litecoin.svg';
    case CHAINS.XRP:
      return baseUrl + '/chain/xrp.svg';
    case CHAINS.BITCOINCASH:
      return baseUrl + '/chain/bitcoincash.svg';
    case CHAINS.ETHEREUM:
      return baseUrl + '/chain/ethereum.svg';
    case CHAINS.TRON:
      return baseUrl + '/chain/tron.svg';
    case CHAINS.SOLANA:
      return baseUrl + '/chain/solana.svg';
    case CHAINS.BSC:
      return baseUrl + '/chain/bsc.svg';
    case CHAINS.ARBITRUM:
      return baseUrl + '/chain/arbitrum.svg';
    case CHAINS.ARBITRUMNOVA:
      return baseUrl + '/chain/arbitrumnova.svg';
    case CHAINS.AVALANCHE:
      return baseUrl + '/chain/avalanche.svg';
    case CHAINS.POLYGON:
      return baseUrl + '/chain/polygon.svg';
    case CHAINS.BASE:
      return baseUrl + '/chain/base.svg';
    case CHAINS.OPTIMISM:
      return baseUrl + '/chain/optimism.svg';
    case CHAINS.TON:
      return baseUrl + '/chain/ton.svg';

    default:
      return '';
  }
}
