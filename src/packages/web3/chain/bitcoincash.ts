import axios from 'axios';
import { TestNetWallet, Wallet } from 'mainnet-js';
import { CHAINIDS, CHAINS, COINS, INNERCHAINNAMES } from 'packages/constants/blockchain';
import { AssetBalance, ChainAccountType, QRCodeText, SendTransaction, TransactionDetail } from '../types';
import { ethers } from 'ethers';
import { FindTokenByChainIdsAndContractAddress } from 'utils/web3';

export class BITCOINCASH {
  static chain = CHAINS.BITCOINCASH;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.BITCOINCASH : CHAINIDS.BITCOINCASH_TESTNET;
  }

  static getChainName(isMainnet: boolean): INNERCHAINNAMES {
    return isMainnet ? INNERCHAINNAMES.BITCOINCASH : INNERCHAINNAMES.BITCOINCASH_TESTNET;
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
        note: 'BITCOINCASH',
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
        note: 'BITCOINCASH',
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
    const regex = `^(${this.getChainName(true)}|${this.getChainName(
      false,
    )}):([^?]+)(\\?token=([^&]+)&amount=((\\d*\\.?\\d+))|\\?amount=((\\d*\\.?\\d+)))$`;

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

  static parseQRCodeText(text: string): QRCodeText {
    const regex = `^(${this.getChainName(true)}|${this.getChainName(
      false,
    )}):([^?]+)(\\?token=([^&]+)&amount=((\\d*\\.?\\d+))|\\?amount=((\\d*\\.?\\d+)))$`;

    try {
      const matchText = text.match(regex);

      let network = 0;
      let networkString = '';
      let address = '';
      let token = '';
      let tokenAddress = '';
      let amount = '';

      if (matchText) {
        networkString = matchText[1];
        address = matchText[2];

        switch (networkString) {
          case INNERCHAINNAMES.BITCOINCASH:
            network = 1;
            break;
          case INNERCHAINNAMES.BITCOINCASH_TESTNET:
            network = 2;
            break;
          default:
            throw new Error('Invalid QR code text format');
        }

        amount = matchText[7];
        token = COINS.BCH;
      }

      return {
        network,
        networkString,
        address,
        token,
        tokenAddress,
        amount,
      };
    } catch (e) {
      console.error(e);
      return {} as QRCodeText;
    }
  }

  static generateQRCodeText(isMainnet: boolean, address: string, amount?: string): string {
    let qrcodeText = `${this.getChainName(isMainnet)}:${address}?`;

    amount = amount || '0';

    qrcodeText += `amount=${amount}`;

    return qrcodeText;
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
      return '0';
    }
  }

  static async getTransactions(isMainnet: boolean, address: string): Promise<TransactionDetail[]> {
    try {
      return [];
    } catch (e) {
      console.error(e);
      return [];
      // throw new Error('can not get the transactions of bch');
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

      const txData = await wallet.send({
        cashaddr: toWalelt?.getDepositAddress(),
        value: parseFloat(req.value),
        unit: 'bch',
      });

      if (txData) {
        return txData.txId as string;
      }

      throw new Error('can not send the transaction of bch');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transactions of bch');
    }
  }
}
