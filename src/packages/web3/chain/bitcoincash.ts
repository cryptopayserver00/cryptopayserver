import axios from 'axios';
import { TestNetWallet, Wallet } from 'mainnet-js';
import { CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import { AssetBalance, ChainAccountType, SendTransaction, TransactionDetail } from '../types';
import { Bip39 } from '../bip39';

export class BITCOINCASH {
  static chain = CHAINS.BITCOINCASH;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.BITCOINCASH : CHAINIDS.BITCOINCASH_TESTNET;
  }

  static async createAccountBySeed(isMainnet: boolean, seed: Buffer, mnemonic: string): Promise<ChainAccountType> {
    const path = `m/44'/1'/145'/0/0`;

    try {
      let wallet;

      if (isMainnet) {
        wallet = await Wallet.fromSeed(mnemonic, path);
      } else {
        wallet = await TestNetWallet.fromSeed(mnemonic, path);
      }

      return {
        chain: this.chain,
        address: wallet.address as string,
        privateKey: wallet.privateKeyWif,
        note: 'BitcoinCash',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of bch');
    }
  }

  static async createAccountByPrivateKey(isMainnet: boolean, privateKey: string): Promise<ChainAccountType> {
    try {
      let wallet;

      if (isMainnet) {
        wallet = await Wallet.fromWIF(privateKey);
      } else {
        wallet = await TestNetWallet.fromWIF(privateKey);
      }

      return {
        chain: this.chain,
        address: wallet.address as string,
        privateKey: privateKey,
        note: 'BitcoinCash',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of bch');
    }
  }

  static async checkAddress(isMainnet: boolean, address: string): Promise<boolean> {
    try {
      if (isMainnet) {
        await Wallet.watchOnly(address);
      } else {
        await TestNetWallet.watchOnly(address);
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /bitcoincash:(\w+)\?amount=([\d.]+)/;
    try {
      const matchText = text.match(regex);
      if (matchText) {
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  static parseQRCodeText(text: string): any {
    const regex = /bitcoincash:(\w+)\?amount=([\d.]+)/;

    try {
      const matchText = text.match(regex);
      if (matchText) {
        const address = matchText[1];
        const amount = matchText[2] || 0;

        return {
          address,
          amount,
        };
      } else {
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  static async getAssetBalance(isMainnet: boolean, address: string, toBCH: boolean = true): Promise<AssetBalance> {
    let items = {} as AssetBalance;
    items.BCH = await this.getBalance(isMainnet, address, toBCH);
    return items;
  }

  static async getBalance(isMainnet: boolean, address: string, toBCH: boolean = true): Promise<string> {
    try {
      let wallet;

      if (isMainnet) {
        wallet = await Wallet.watchOnly(address);
      } else {
        wallet = await TestNetWallet.watchOnly(address);
      }

      return toBCH ? (await wallet.getBalance('bch')).toString() : (await wallet.getBalance('sat')).toString();
    } catch (e) {
      console.error(e);
      throw new Error('can not get the balance of bch');
    }
  }

  static async getTransactions(isMainnet: boolean, address: string): Promise<TransactionDetail[]> {
    try {
      throw new Error('can not get the transactions of bch');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transactions of bch');
    }
  }

  static async getTransactionDetail(isMainnet: boolean, hash: string, address?: string): Promise<TransactionDetail> {
    try {
      throw new Error('can not get the transaction of bch');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of bch');
    }
  }

  static async sendTransaction(isMainnet: boolean, req: SendTransaction): Promise<string> {
    if (!req.privateKey || req.privateKey === '') {
      throw new Error('can not get the private key of bch');
    }

    try {
      let wallet, toWalelt;

      if (isMainnet) {
        wallet = await Wallet.fromWIF(req.privateKey);

        toWalelt = await Wallet.watchOnly(req.to);
      } else {
        wallet = await TestNetWallet.fromWIF(req.privateKey);

        toWalelt = await TestNetWallet.watchOnly(req.to);
      }

      const txData = await wallet.send([
        {
          cashaddr: toWalelt?.getDepositAddress(),
          value: req.value,
          unit: 'bch',
        },
      ]);

      if (txData) {
        return txData.txId as string;
      }

      throw new Error('can not send transaction of bch');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transactions of bch');
    }
  }
}
