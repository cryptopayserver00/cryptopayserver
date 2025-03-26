import { WalletAccountType, ChainAccountType, AssetBalance, TransactionDetail, SendTransaction } from './types';
import { Bip39 } from './bip39';
import { BTC } from './chain/btc';
import { ETH } from './chain/eth';
import { CHAINIDS, CHAINS, COIN } from 'packages/constants/blockchain';
import { SOLANA } from './chain/solana';
import { BSC } from './chain/bsc';
import { LTC } from './chain/ltc';
import { TRON } from './chain/tron';
import { TON } from './chain/ton';
import { XRP } from './chain/xrp';
import { BITCOINCASH } from './chain/bitcoincash';
import { ARB } from './chain/arb';
import { AVAX } from './chain/avalanche';
import { POL } from './chain/pol';
import { BASE } from './chain/base';
import { OP } from './chain/op';
import { BLOCKSCAN } from './block_scan';

export class WEB3 {
  // support: Import and generate wallet
  static async generateWallet(mnemonic: string = ''): Promise<WalletAccountType> {
    const isGenerate = mnemonic === '' ? true : false;

    if (mnemonic !== '' && !Bip39.validateMnemonic(mnemonic)) throw new Error('Invalid mnemonic');
    mnemonic = mnemonic === '' ? Bip39.generateMnemonic() : mnemonic;

    const seed = await Bip39.generateSeed(mnemonic);

    // mainnet
    const mainnetAccount = await this.createAccountBySeed(true, seed, mnemonic);

    //testnet
    const testnetAccount = await this.createAccountBySeed(false, seed, mnemonic);

    return {
      isGenerate: isGenerate,
      mnemonic: mnemonic,
      account: [...mainnetAccount, ...testnetAccount],
    };
  }

  static async createAccountBySeed(
    isMainnet: boolean,
    seed: Buffer,
    mnemonic: string,
  ): Promise<Array<ChainAccountType>> {
    return await Promise.all([
      ...BTC.createAccountBySeed(isMainnet, seed),
      ETH.createAccountBySeed(isMainnet, seed),
      SOLANA.createAccountBySeed(isMainnet, seed),
      LTC.createAccountBySeed(isMainnet, seed),
      TRON.createAccountBySeed(isMainnet, seed),
      await TON.createAccountBySeed(isMainnet, seed),
      await BITCOINCASH.createAccountBySeed(isMainnet, seed, mnemonic),
      XRP.createAccountBySeed(isMainnet, seed, mnemonic),
    ]);
  }

  static async createAccountByPrivateKey(
    isMainnet: boolean,
    chain: CHAINS,
    privateKey: string,
  ): Promise<Array<ChainAccountType>> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return BTC.createAccountByPrivateKey(isMainnet, privateKey);
      case CHAINS.LITECOIN:
        return Array<ChainAccountType>(LTC.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.XRP:
        // return Array<ChainAccountType>(XRP.createAccountByPrivateKey(isMainnet, privateKey));
        return [];
      case CHAINS.BITCOINCASH:
        return Array<ChainAccountType>(await BITCOINCASH.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.ETHEREUM:
      case CHAINS.BSC:
      case CHAINS.ARBITRUM:
      case CHAINS.AVALANCHE:
      case CHAINS.POLYGON:
      case CHAINS.BASE:
      case CHAINS.OPTIMISM:
        return Array<ChainAccountType>(ETH.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.TRON:
        return Array<ChainAccountType>(TRON.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.SOLANA:
        return Array<ChainAccountType>(SOLANA.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.TON:
        return Array<ChainAccountType>(await TON.createAccountByPrivateKey(isMainnet, privateKey));
      default:
        return [];
    }
  }

  static async checkAccountStatus(isMainnet: boolean, chain: CHAINS, address: string): Promise<number> {
    switch (chain) {
      case CHAINS.XRP:
        return (await XRP.checkAccountStatus(isMainnet, address)) ? 1 : 2;
      default:
        return 0;
    }
  }

  static async checkAddress(isMainnet: boolean, chain: CHAINS, address: string): Promise<boolean> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return BTC.checkAddress(isMainnet, address);
      case CHAINS.LITECOIN:
        return LTC.checkAddress(isMainnet, address);
      case CHAINS.XRP:
        return XRP.checkAddress(isMainnet, address);
      case CHAINS.BITCOINCASH:
        return await BITCOINCASH.checkAddress(isMainnet, address);
      case CHAINS.ETHEREUM:
      case CHAINS.BSC:
      case CHAINS.ARBITRUM:
      case CHAINS.AVALANCHE:
      case CHAINS.POLYGON:
      case CHAINS.BASE:
      case CHAINS.OPTIMISM:
        return ETH.checkAddress(address);
      case CHAINS.TRON:
        return TRON.checkAddress(address);
      case CHAINS.SOLANA:
        return SOLANA.checkAddress(address);
      case CHAINS.TON:
        return TON.checkAddress(isMainnet, address);
      default:
        return false;
    }
  }

  static async getFeeRate(isMainnet: boolean, chain: CHAINS): Promise<any> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return await BTC.getCurrentFeeRate(isMainnet);
      case CHAINS.LITECOIN:
        return await LTC.getCurrentFeeRate(isMainnet);
      case CHAINS.ETHEREUM:
        return await ETH.getGasPrice(isMainnet);
      case CHAINS.BSC:
        return await BSC.getGasPrice(isMainnet);
      case CHAINS.ARBITRUM:
        return await ARB.getGasPrice(isMainnet);
      case CHAINS.BASE:
        return await BASE.getGasPrice(isMainnet);
      case CHAINS.OPTIMISM:
        return await OP.getGasPrice(isMainnet);
      case CHAINS.POLYGON:
        return await POL.getGasPrice(isMainnet);
      case CHAINS.AVALANCHE:
        return await AVAX.getGasPrice(isMainnet);
      case CHAINS.SOLANA:
        return await SOLANA.getFeePerSignature(isMainnet);
      case CHAINS.TON:
        return null;
      case CHAINS.XRP:
        return await XRP.getFee(isMainnet);
      default:
        return null;
    }
  }

  static async estimateGasFee(isMainnet: boolean, req: SendTransaction): Promise<any> {
    switch (req.coin.chainId) {
      case CHAINS.TON:
        return await TON.estimateGasFee(isMainnet, req);
      default:
        return null;
    }
  }

  static getChainIds(isMainnet: boolean, chain: CHAINS): CHAINIDS {
    switch (chain) {
      case CHAINS.BITCOIN:
        return BTC.getChainIds(isMainnet);
      case CHAINS.LITECOIN:
        return LTC.getChainIds(isMainnet);
      case CHAINS.XRP:
        return XRP.getChainIds(isMainnet);
      case CHAINS.BITCOINCASH:
        return BITCOINCASH.getChainIds(isMainnet);
      case CHAINS.ETHEREUM:
        return ETH.getChainIds(isMainnet);
      case CHAINS.TRON:
        return TRON.getChainIds(isMainnet);
      case CHAINS.SOLANA:
        return SOLANA.getChainIds(isMainnet);
      case CHAINS.BSC:
        return BSC.getChainIds(isMainnet);
      case CHAINS.ARBITRUM:
        return ARB.getChainIds(isMainnet);
      case CHAINS.AVALANCHE:
        return AVAX.getChainIds(isMainnet);
      case CHAINS.POLYGON:
        return POL.getChainIds(isMainnet);
      case CHAINS.BASE:
        return BASE.getChainIds(isMainnet);
      case CHAINS.OPTIMISM:
        return OP.getChainIds(isMainnet);
      case CHAINS.TON:
        return TON.getChainIds(isMainnet);
      default:
        return CHAINIDS.NONE;
    }
  }

  static getChains(nodeChain: CHAINIDS): CHAINS {
    switch (nodeChain) {
      case (CHAINIDS.BITCOIN, CHAINIDS.BITCOIN_TESTNET):
        return CHAINS.BITCOIN;
      case (CHAINIDS.LITECOIN, CHAINIDS.LITECOIN_TESTNET):
        return CHAINS.LITECOIN;
      case (CHAINIDS.XRP, CHAINIDS.XRP_TESTNET):
        return CHAINS.XRP;
      case (CHAINIDS.BITCOINCASH, CHAINIDS.BITCOINCASH_TESTNET):
        return CHAINS.BITCOINCASH;
      case (CHAINIDS.ETHEREUM, CHAINIDS.ETHEREUM_SEPOLIA):
        return CHAINS.ETHEREUM;
      case (CHAINIDS.TRON, CHAINIDS.TRON_NILE):
        return CHAINS.TRON;
      case (CHAINIDS.SOLANA, CHAINIDS.SOLANA_DEVNET):
        return CHAINS.SOLANA;
      case (CHAINIDS.BSC, CHAINIDS.BSC_TESTNET):
        return CHAINS.BSC;
      case (CHAINIDS.ARBITRUM_ONE, CHAINIDS.ARBITRUM_SEPOLIA):
        return CHAINS.ARBITRUM;
      case (CHAINIDS.AVALANCHE, CHAINIDS.AVALANCHE_TESTNET):
        return CHAINS.AVALANCHE;
      case (CHAINIDS.POLYGON, CHAINIDS.POLYGON_TESTNET):
        return CHAINS.POLYGON;
      case (CHAINIDS.BASE, CHAINIDS.BASE_SEPOLIA):
        return CHAINS.BASE;
      case (CHAINIDS.OPTIMISM, CHAINIDS.OPTIMISM_SEPOLIA):
        return CHAINS.OPTIMISM;
      case (CHAINIDS.TON, CHAINIDS.TON_TESTNET):
        return CHAINS.TON;
      default:
        return CHAINS.BITCOIN;
    }
  }

  static getBlockchainAddressTransactionUrl(isMainnet: boolean, chain: CHAINS, address: string): string {
    const realChainId = this.getChainIds(isMainnet, chain);

    return BLOCKSCAN.getBlockchainAddressTransactionUrl(realChainId.toString(), address);
  }

  static async getAssetBalance(isMainnet: boolean, chain: CHAINS, address: string): Promise<AssetBalance> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return await BTC.getAssetBalance(isMainnet, address);
      case CHAINS.LITECOIN:
        return await LTC.getAssetBalance(isMainnet, address);
      case CHAINS.XRP:
        return await XRP.getAssetBalance(isMainnet, address);
      case CHAINS.BITCOINCASH:
        return await BITCOINCASH.getAssetBalance(isMainnet, address);
      case CHAINS.ETHEREUM:
        return await ETH.getAssetBalance(isMainnet, address);
      case CHAINS.TRON:
        return await TRON.getAssetBalance(isMainnet, address);
      case CHAINS.SOLANA:
        return await SOLANA.getAssetBalance(isMainnet, address);
      case CHAINS.BSC:
        return await BSC.getAssetBalance(isMainnet, address);
      case CHAINS.ARBITRUM:
        return await ARB.getAssetBalance(isMainnet, address);
      case CHAINS.AVALANCHE:
        return await AVAX.getAssetBalance(isMainnet, address);
      case CHAINS.POLYGON:
        return await POL.getAssetBalance(isMainnet, address);
      case CHAINS.BASE:
        return await BASE.getAssetBalance(isMainnet, address);
      case CHAINS.OPTIMISM:
        return await OP.getAssetBalance(isMainnet, address);
      case CHAINS.TON:
        return await TON.getAssetBalance(isMainnet, address);
      default:
        return {} as AssetBalance;
    }
  }

  static async getNonce(isMainnet: boolean, chain: CHAINS, address: string): Promise<number> {
    switch (chain) {
      case CHAINS.ETHEREUM:
        return await ETH.getNonce(isMainnet, address);
      case CHAINS.BSC:
        return await BSC.getNonce(isMainnet, address);
      case CHAINS.ARBITRUM:
        return await ARB.getNonce(isMainnet, address);
      case CHAINS.OPTIMISM:
        return await OP.getNonce(isMainnet, address);
      case CHAINS.BASE:
        return await BASE.getNonce(isMainnet, address);
      case CHAINS.POLYGON:
        return await POL.getNonce(isMainnet, address);
      case CHAINS.AVALANCHE:
        return await AVAX.getNonce(isMainnet, address);
      default:
        return 0;
    }
  }

  static async getGasLimit(
    isMainnet: boolean,
    chain: CHAINS,
    contractAddress: string,
    from: string,
    to: string,
    value: string,
  ): Promise<number> {
    switch (chain) {
      case CHAINS.ETHEREUM:
        return await ETH.getGasLimit(isMainnet, contractAddress, from, to, value);
      case CHAINS.BSC:
        return await BSC.getGasLimit(isMainnet, contractAddress, from, to, value);
      case CHAINS.ARBITRUM:
        return await ARB.getGasLimit(isMainnet, contractAddress, from, to, value);
      case CHAINS.OPTIMISM:
        return await OP.getGasLimit(isMainnet, contractAddress, from, to, value);
      case CHAINS.BASE:
        return await BASE.getGasLimit(isMainnet, contractAddress, from, to, value);
      case CHAINS.POLYGON:
        return await POL.getGasLimit(isMainnet, contractAddress, from, to, value);
      case CHAINS.AVALANCHE:
        return await AVAX.getGasLimit(isMainnet, contractAddress, from, to, value);
      default:
        return 0;
    }
  }

  static async getMaxPriortyFee(isMainnet: boolean, chain: CHAINS): Promise<any> {
    switch (chain) {
      case CHAINS.ETHEREUM:
        return await ETH.getMaxPriorityFeePerGas(isMainnet);
      case CHAINS.ARBITRUM:
        return await ARB.getMaxPriorityFeePerGas(isMainnet);
      case CHAINS.OPTIMISM:
        return await OP.getMaxPriorityFeePerGas(isMainnet);
      case CHAINS.BASE:
        return await BASE.getMaxPriorityFeePerGas(isMainnet);
      case CHAINS.POLYGON:
        return await POL.getMaxPriorityFeePerGas(isMainnet);
      case CHAINS.AVALANCHE:
        return await AVAX.getMaxPriorityFeePerGas(isMainnet);
      default:
        return 0;
    }
  }

  static async getTransactionDetail(isMainnet: boolean, chain: CHAINS, hash: string): Promise<TransactionDetail> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return await BTC.getTransactionDetail(isMainnet, hash);
      case CHAINS.LITECOIN:
        return await LTC.getTransactionDetail(isMainnet, hash);
      case CHAINS.XRP:
        return await XRP.getTransactionDetail(isMainnet, hash);
      case CHAINS.BITCOINCASH:
        return await BITCOINCASH.getTransactionDetail(isMainnet, hash);
      case CHAINS.ETHEREUM:
        return await ETH.getTransactionDetail(isMainnet, hash);
      case CHAINS.TRON:
        return await TRON.getTransactionDetail(isMainnet, hash);
      case CHAINS.SOLANA:
        return await SOLANA.getTransactionDetail(isMainnet, hash);
      case CHAINS.BSC:
        return await BSC.getTransactionDetail(isMainnet, hash);
      case CHAINS.ARBITRUM:
        return await ARB.getTransactionDetail(isMainnet, hash);
      case CHAINS.AVALANCHE:
        return await AVAX.getTransactionDetail(isMainnet, hash);
      case CHAINS.POLYGON:
        return await POL.getTransactionDetail(isMainnet, hash);
      case CHAINS.BASE:
        return await BASE.getTransactionDetail(isMainnet, hash);
      case CHAINS.OPTIMISM:
        return await OP.getTransactionDetail(isMainnet, hash);
      case CHAINS.TON:
        return await TON.getTransactionDetail(isMainnet, hash);
      default:
        return {} as TransactionDetail;
    }
  }

  static async getTransactions(isMainnet: boolean, chain: CHAINS, address: string, token?: COIN): Promise<any[]> {
    let txs;

    switch (chain) {
      case CHAINS.BITCOIN:
        txs = await BTC.getTransactions(isMainnet, address);
        break;
      case CHAINS.LITECOIN:
        txs = await LTC.getTransactions(isMainnet, address);
        break;
      case CHAINS.XRP:
        txs = await XRP.getTransactions(isMainnet, address);
        break;
      case CHAINS.BITCOINCASH:
        txs = await BITCOINCASH.getTransactions(isMainnet, address);
        break;
      case CHAINS.ETHEREUM:
        txs = await ETH.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.TRON:
        txs = await TRON.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.SOLANA:
        txs = await SOLANA.getTransactions(isMainnet, address);
        break;
      case CHAINS.BSC:
        txs = await BSC.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.ARBITRUM:
        txs = await ARB.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.AVALANCHE:
        txs = await AVAX.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.POLYGON:
        txs = await POL.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.BASE:
        txs = await BASE.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.OPTIMISM:
        txs = await OP.getTransactions(isMainnet, address, token?.symbol);
        break;
      case CHAINS.TON:
        txs = await TON.getTransactions(isMainnet, address, token?.symbol);
        break;
      default:
        return [];
    }

    txs = txs.map((item: any) => {
      return {
        ...item,
        chainId: WEB3.getChains(item.chainId),
      };
    });

    return txs;
  }

  static async sendTransaction(isMainnet: boolean, req: SendTransaction): Promise<string> {
    switch (req.coin.chainId) {
      case CHAINS.BITCOIN:
        return await BTC.sendTransaction(isMainnet, req);
      case CHAINS.LITECOIN:
        return await LTC.sendTransaction(isMainnet, req);
      case CHAINS.XRP:
        return await XRP.sendTransaction(isMainnet, req);
      case CHAINS.BITCOINCASH:
        return await BITCOINCASH.sendTransaction(isMainnet, req);
      case CHAINS.ETHEREUM:
        return await ETH.sendTransaction(isMainnet, req);
      case CHAINS.TRON:
        return await TRON.sendTransaction(isMainnet, req);
      case CHAINS.SOLANA:
        return await SOLANA.sendTransaction(isMainnet, req);
      case CHAINS.BSC:
        return await BSC.sendTransaction(isMainnet, req);
      case CHAINS.ARBITRUM:
        return await ARB.sendTransaction(isMainnet, req);
      case CHAINS.AVALANCHE:
        return await AVAX.sendTransaction(isMainnet, req);
      case CHAINS.POLYGON:
        return await POL.sendTransaction(isMainnet, req);
      case CHAINS.BASE:
        return await BASE.sendTransaction(isMainnet, req);
      case CHAINS.OPTIMISM:
        return await OP.sendTransaction(isMainnet, req);
      case CHAINS.TON:
        return await TON.sendTransaction(isMainnet, req);
      default:
        return '';
    }
  }

  static async getAccountResource(isMainnet: boolean, chain: CHAINS, address: string): Promise<any> {
    switch (chain) {
      case CHAINS.TRON:
        return await TRON.getAccountResource(isMainnet, address);
      default:
        return null;
    }
  }

  static async getTokenTrustLine(isMainnet: boolean, chain: CHAINS, address: string): Promise<any> {
    switch (chain) {
      case CHAINS.XRP:
        return await XRP.getTokenTrustline(isMainnet, address);
      default:
        return null;
    }
  }
}
