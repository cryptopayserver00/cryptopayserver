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
import { FindTokenByChainIdsAndSymbol } from 'utils/web3';
import { XRP } from './chain/xrp';
import { BITCOINCASH } from './chain/bitcoincash';
import { ARB } from './chain/arb';
import { AVALANCHE } from './chain/avalanche';
import { POL } from './chain/pol';
import { BASE } from './chain/base';
import { OP } from './chain/op';

export class WEB3 {
  // support: Import and generate wallet
  static async generateWallet(mnemonic: string = ''): Promise<WalletAccountType> {
    const isGenerate = mnemonic === '' ? true : false;

    if (mnemonic !== '' && !Bip39.validateMnemonic(mnemonic)) throw new Error('Invalid mnemonic');
    mnemonic = mnemonic === '' ? Bip39.generateMnemonic() : mnemonic;

    const seed = await Bip39.generateSeed(mnemonic);

    // mainnet
    const mainnetAccount = await this.createAccountBySeed(true, seed);

    //testnet
    const testnetAccount = await this.createAccountBySeed(false, seed);

    return {
      isGenerate: isGenerate,
      mnemonic: mnemonic,
      account: [...mainnetAccount, ...testnetAccount],
    };
  }

  static async createAccountBySeed(isMainnet: boolean, seed: Buffer): Promise<Array<ChainAccountType>> {
    return await Promise.all([
      ...BTC.createAccountBySeed(isMainnet, seed),
      ETH.createAccountBySeed(isMainnet, seed),
      SOLANA.createAccountBySeed(isMainnet, seed),
      LTC.createAccountBySeed(isMainnet, seed),
      TRON.createAccountBySeed(isMainnet, seed),
      await TON.createAccountBySeed(isMainnet, seed),
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
      case CHAINS.ETHEREUM:
      case CHAINS.BSC:
        return Array<ChainAccountType>(ETH.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.SOLANA:
        return Array<ChainAccountType>(SOLANA.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.LITECOIN:
        return Array<ChainAccountType>(LTC.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.TRON:
        return Array<ChainAccountType>(TRON.createAccountByPrivateKey(isMainnet, privateKey));
      case CHAINS.TON:
        return Array<ChainAccountType>(await TON.createAccountByPrivateKey(isMainnet, privateKey));
      default:
        return [];
    }
  }

  static checkAddress(isMainnet: boolean, chain: CHAINS, address: string): boolean {
    switch (chain) {
      case CHAINS.BITCOIN:
        return BTC.checkAddress(isMainnet, address);
      case CHAINS.ETHEREUM:
      case CHAINS.BSC:
        return ETH.checkAddress(address);
      case CHAINS.SOLANA:
        return SOLANA.checkAddress(address);
      case CHAINS.LITECOIN:
        return LTC.checkAddress(isMainnet, address);
      case CHAINS.TRON:
        return TRON.checkAddress(address);
      case CHAINS.TON:
        return TON.checkAddress(isMainnet, address);
      default:
        return false;
    }
  }

  static async getFeeRate(isMainnet: boolean, chain: CHAINS): Promise<any> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return BTC.getCurrentFeeRate(isMainnet);
      case CHAINS.ETHEREUM:
        return ETH.getGasPrice(isMainnet);
      case CHAINS.SOLANA:
        return null;
      case CHAINS.BSC:
        return BSC.getGasPrice(isMainnet);
      case CHAINS.LITECOIN:
        return LTC.getCurrentFeeRate(isMainnet);
      case CHAINS.TON:
        return null;
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
        return AVALANCHE.getChainIds(isMainnet);
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

  static async getAssetBalance(isMainnet: boolean, chain: CHAINS, address: string): Promise<AssetBalance> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return await BTC.getAssetBalance(isMainnet, address);
      case CHAINS.ETHEREUM:
        return await ETH.getAssetBalance(isMainnet, address);
      case CHAINS.SOLANA:
        return await SOLANA.getAssetBalance(isMainnet, address);
      case CHAINS.BSC:
        return await BSC.getAssetBalance(isMainnet, address);
      case CHAINS.LITECOIN:
        return await LTC.getAssetBalance(isMainnet, address);
      case CHAINS.TRON:
        return await TRON.getAssetBalance(isMainnet, address);
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
      default:
        return 0;
    }
  }

  static async getMaxPriortyFee(isMainnet: boolean, chain: CHAINS): Promise<any> {
    switch (chain) {
      case CHAINS.ETHEREUM:
        return await ETH.getMaxPriorityFeePerGas(isMainnet);
      default:
        return 0;
    }
  }

  static async getTransactionDetail(isMainnet: boolean, chain: CHAINS, hash: string): Promise<TransactionDetail> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return await BTC.getTransactionDetail(isMainnet, hash);
      case CHAINS.ETHEREUM:
        return await ETH.getTransactionDetail(isMainnet, hash);
      case CHAINS.SOLANA:
        return await SOLANA.getTransactionDetail(isMainnet, hash);
      case CHAINS.BSC:
        return await BSC.getTransactionDetail(isMainnet, hash);
      case CHAINS.LITECOIN:
        return await LTC.getTransactionDetail(isMainnet, hash);
      case CHAINS.TRON:
        return await TRON.getTransactionDetail(isMainnet, hash);
      case CHAINS.TON:
        return await TON.getTransactionDetail(isMainnet, hash);
      default:
        return {} as TransactionDetail;
    }
  }

  static async getTransactions(isMainnet: boolean, chain: CHAINS, address: string, token?: COIN): Promise<any[]> {
    switch (chain) {
      case CHAINS.BITCOIN:
        return await BTC.getTransactions(isMainnet, address);
      case CHAINS.ETHEREUM:
        return await ETH.getTransactions(isMainnet, address, token?.symbol);
      case CHAINS.SOLANA:
        return await SOLANA.getTransactions(isMainnet, address);
      case CHAINS.BSC:
        return await BSC.getTransactions(isMainnet, address, token?.symbol);
      case CHAINS.LITECOIN:
        return await LTC.getTransactions(isMainnet, address);
      case CHAINS.TRON:
        return await TRON.getTransactions(isMainnet, address, token?.symbol);
      case CHAINS.TON:
        return await TON.getTransactions(isMainnet, address, token?.symbol);
      default:
        return [];
    }
  }

  static async sendTransaction(isMainnet: boolean, req: SendTransaction): Promise<string> {
    switch (req.coin.chainId) {
      case CHAINS.BITCOIN:
        return await BTC.sendTransaction(isMainnet, req);
      case CHAINS.ETHEREUM:
        return await ETH.sendTransaction(isMainnet, req);
      case CHAINS.SOLANA:
        return await SOLANA.sendTransaction(isMainnet, req);
      case CHAINS.BSC:
        return await BSC.sendTransaction(isMainnet, req);
      case CHAINS.LITECOIN:
        return await LTC.sendTransaction(isMainnet, req);
      case CHAINS.TRON:
        return await TRON.sendTransaction(isMainnet, req);
      case CHAINS.TON:
        return await TON.sendTransaction(isMainnet, req);
      default:
        return '';
    }
  }
}
