import axios from 'axios';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import {
  AssetBalance,
  ChainAccountType,
  CreateTonTransaction,
  EthereumTransactionDetail,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONSTATUS,
} from '../types';
import { ethers } from 'ethers';
import { FindDecimalsByChainIdsAndContractAddress } from 'utils/web3';
import { GetBlockchainTxUrl } from 'utils/chain/ton';
import { BLOCKSCAN } from '../block_scan';
import TonWeb from 'tonweb';
import { keyPairFromSeed, keyPairFromSecretKey } from 'ton-crypto';

export class TON {
  static chain = CHAINS.TON;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.TON : CHAINIDS.TON_TESTNET;
  }

  static createAccountBySeed(isMainnet: boolean, seed: Buffer): ChainAccountType {
    const path = `m/44'/607'/0'/0/0`;

    try {
      const keypair = keyPairFromSeed(seed);
      const publicKey = keypair.publicKey.toString();
      const secretKey = keypair.secretKey.toString();

      return {
        chain: this.chain,
        address: publicKey,
        privateKey: secretKey,
        note: 'Ton',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of ton');
    }
  }

  static createAccountByPrivateKey(isMainnet: boolean, privateKey: string): ChainAccountType {
    try {
      const keypair = keyPairFromSecretKey(Buffer.from(privateKey));

      return {
        chain: this.chain,
        address: keypair.publicKey.toString(),
        privateKey: privateKey,
        note: 'Ton',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of ton');
    }
  }

  static checkAddress(address: string): boolean {
    const tonweb = new TonWeb();
    return tonweb.Address.isValid(address);
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /ton:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;
    try {
      const matchText = text.match(regex);
      if (matchText) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  static parseQRCodeText(text: string): any {
    const regex = /ton:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;

    try {
      const matchText = text.match(regex);
      if (matchText) {
        const address = matchText[1];
        const value = matchText[3] || 0;
        const decimal = matchText[4] || 18;
        const amount = ethers.formatUnits(value, decimal);
        const contractAddress = matchText[6] || undefined;

        return {
          address,
          amount,
          decimal,
          contractAddress,
        };
      } else {
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  static async generateQRCodeText(
    isMainnet: boolean,
    address: string,
    contractAddress?: string,
    amount?: string,
  ): Promise<string> {
    let qrcodeText = `ton:${address}`;
    const decimal = contractAddress ? await this.getTon20Decimals(isMainnet, contractAddress) : 9;

    amount = amount || '0';
    const value = ethers.parseUnits(amount, decimal).toString();

    qrcodeText += `?value=${value}&decimal=${decimal}`;

    if (contractAddress) {
      qrcodeText += `&contractAddress=${contractAddress}`;
    }

    return qrcodeText;
  }

  static async getAssetBalance(isMainnet: boolean, address: string): Promise<AssetBalance> {}

  static async getTonBalance(isMainnet: boolean, address: string): Promise<string> {}

  static async getTON20Balance(isMainnet: boolean, address: string, contractAddress: string): Promise<string> {}

  static async getTON20Decimals(isMainnet: boolean, contractAddress: string): Promise<number> {}

  static async getTransactionDetail(isMainnet: boolean, hash: string): Promise<TransactionDetail> {}

  static async getTransactions(
    isMainnet: boolean,
    address: string,
    symbol?: string,
  ): Promise<EthereumTransactionDetail[]> {}

  static async createTransaction(isMainnet: boolean, request: CreateTonTransaction): Promise<SignedTransaction> {}

  static async createTon20Transaction(isMainnet: boolean, request: CreateTonTransaction): Promise<SignedTransaction> {}

  static async createTONTransaction(isMainnet: boolean, request: CreateTonTransaction): Promise<SignedTransaction> {}

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {}
}
