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

  static getTonClient(isMainnet: boolean): TonWeb {
    const url = isMainnet ? 'https://toncenter.com/api/v2/jsonRPC' : 'https://testnet.toncenter.com/api/v2/jsonRPC';
    return new TonWeb(new TonWeb.HttpProvider(url, { apiKey: process.env.TON_API_KEY }));
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

  static checkAddress(isMainnet: boolean, address: string): boolean {
    const tonweb = this.getTonClient(isMainnet);
    return tonweb.Address.isValid(address);
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /ton:(\w+)(\?Fvalue=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;
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
    const decimal = contractAddress ? await this.getTON20Decimals(isMainnet, contractAddress) : 9;

    amount = amount || '0';
    const value = ethers.parseUnits(amount, decimal).toString();

    qrcodeText += `?value=${value}&decimal=${decimal}`;

    if (contractAddress) {
      qrcodeText += `&contractAddress=${contractAddress}`;
    }

    return qrcodeText;
  }

  static async getAssetBalance(isMainnet: boolean, address: string): Promise<AssetBalance> {
    try {
      let items = {} as AssetBalance;
      items.TON = await this.getTONBalance(isMainnet, address);

      const coins = BLOCKCHAINNAMES.find((item) => item.chainId === this.getChainIds(isMainnet))?.coins;
      if (coins && coins.length > 0) {
        const tokens = coins.filter((item) => !item.isMainCoin);

        const promises = tokens.map(async (token) => {
          if (token.contractAddress && token.contractAddress !== '') {
            const balance = await this.getTON20Balance(isMainnet, address, token.contractAddress);
            items[token.symbol] = balance;
          }
        });

        await Promise.all(promises);
      }
      return items;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the asset balance of ton');
    }
  }

  static async getTONBalance(isMainnet: boolean, address: string): Promise<string> {
    try {
      const tonweb = this.getTonClient(isMainnet);
      const balance = await tonweb.provider.getBalance(address);
      const balanceInTON = TonWeb.utils.fromNano(balance);
      return balanceInTON;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the ton balance of ton');
    }
  }

  static async getTON20Balance(isMainnet: boolean, address: string, contractAddress: string): Promise<string> {
    const tonweb = this.getTonClient(isMainnet);
    // const contract = tonweb.Contract(new TonWeb.HttpProvider(url, { apiKey: process.env.TON_API_KEY }), "")
    const wallet = tonweb.wallet.create({ address: contractAddress });

  }

  static async getTON20Decimals(isMainnet: boolean, contractAddress: string): Promise<number> {}

  static async getTransactionDetail(isMainnet: boolean, hash: string): Promise<TransactionDetail> {}

  static async getTransactions(
    isMainnet: boolean,
    address: string,
    symbol?: string,
  ): Promise<EthereumTransactionDetail[]> {}

  static async createTransaction(isMainnet: boolean, request: CreateTonTransaction): Promise<SignedTransaction> {}

  static async createTON20Transaction(isMainnet: boolean, request: CreateTonTransaction): Promise<SignedTransaction> {}

  static async createTONTransaction(isMainnet: boolean, request: CreateTonTransaction): Promise<SignedTransaction> {}

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {}
}
