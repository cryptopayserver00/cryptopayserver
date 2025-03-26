import axios from 'axios';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import { AssetBalance, ChainAccountType, SendTransaction, TransactionDetail } from '../types';
import { Client, convertHexToString, dropsToXrp, isValidAddress, Wallet, xrpToDrops } from 'xrpl';

export class XRP {
  static chain = CHAINS.XRP;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.XRP : CHAINIDS.XRP_TESTNET;
  }

  static getXrpClient(isMainnet: boolean): Client {
    const url = isMainnet ? 'wss://xrplcluster.com' : 'wss://s.altnet.rippletest.net:51233';
    return new Client(url);
  }

  static createAccountBySeed(isMainnet: boolean, seed: Buffer, mnemonic: string): ChainAccountType {
    try {
      const wallet = Wallet.fromMnemonic(mnemonic);

      return {
        chain: this.chain,
        address: wallet.address as string,
        privateKey: wallet.privateKey,
        note: 'XRP',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of xrp');
    }
  }

  static createAccountByPrivateKey(isMainnet: boolean, privateKey: string): ChainAccountType {
    try {
      const wallet = Wallet.fromSecret(privateKey);

      return {
        chain: this.chain,
        address: wallet.address as string,
        privateKey: privateKey,
        note: 'XRP',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of xrp');
    }
  }

  static async checkAccountStatus(isMainnet: boolean, address: string): Promise<boolean> {
    const client = this.getXrpClient(isMainnet);

    try {
      await client.connect();

      await client.request({
        command: 'account_info',
        account: address,
      });

      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      await client.disconnect();
    }
  }

  static checkAddress(isMainnet: boolean, address: string): boolean {
    return isValidAddress(address);
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /xrp:(\w+)\?amount=([\d.]+)/;
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
    const regex = /xrp:(\w+)\?amount=([\d.]+)/;

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

  static async getAssetBalance(isMainnet: boolean, address: string, toXRP: boolean = true): Promise<AssetBalance> {
    const client = this.getXrpClient(isMainnet);

    try {
      await client.connect();

      let items = {} as AssetBalance;
      items.XRP = await this.getXrpBalance(isMainnet, address, toXRP);

      const coins = BLOCKCHAINNAMES.find((item) => item.chainId === this.getChainIds(isMainnet))?.coins;
      if (coins && coins.length > 0) {
        const tokens = coins.filter((item) => !item.isMainCoin);

        const balances = await client.request({
          command: 'account_lines',
          account: address,
          ledger_index: 'validated',
        });

        const promises = tokens.map(async (token) => {
          if (token.contractAddress && token.contractAddress !== '') {
            let balance = '0';
            balances.result.lines &&
              balances.result.lines.length > 0 &&
              balances.result.lines.map((lineItem) => {
                if (lineItem.account == token.contractAddress) {
                  balance = lineItem.balance;
                }
              });
            items[token.symbol] = balance;
          }
        });

        await Promise.all(promises);
      }
      return items;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the asset balance of xrp');
    } finally {
      await client.disconnect();
    }
  }

  static async getXrpBalance(isMainnet: boolean, address: string, toXRP: boolean = true): Promise<string> {
    const client = this.getXrpClient(isMainnet);

    try {
      await client.connect();
      const balance = await client.getXrpBalance(address);

      return toXRP ? balance.toString() : xrpToDrops(balance);
    } catch (e) {
      console.error(e);
      return '0';
    } finally {
      await client.disconnect();
    }
  }

  static async getTokenTrustline(isMainnet: boolean, address: string): Promise<any> {
    const client = this.getXrpClient(isMainnet);

    try {
      await client.connect();

      const balances = await client.request({
        command: 'account_lines',
        account: address,
        ledger_index: 'validated',
      });

      return balances.result.lines;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the trust line of xrp');
    } finally {
      await client.disconnect();
    }
  }

  static async getTransactions(isMainnet: boolean, address: string): Promise<TransactionDetail[]> {
    try {
      return [];
    } catch (e) {
      console.error(e);
      return [];
      // throw new Error('can not get the transactions of xrp');
    }
  }

  static async getTransactionDetail(isMainnet: boolean, hash: string, address?: string): Promise<TransactionDetail> {
    try {
      throw new Error('can not get the transaction of xrp');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of xrp');
    }
  }

  static async getFee(isMainnet: boolean): Promise<any> {
    const client = this.getXrpClient(isMainnet);

    try {
      await client.connect();

      const response = await client.request({
        command: 'fee',
      });

      return {
        base_fee: dropsToXrp(response.result.drops.base_fee),
        median_fee: dropsToXrp(response.result.drops.median_fee),
        minimum_fee: dropsToXrp(response.result.drops.minimum_fee),
        open_ledger_fee: dropsToXrp(response.result.drops.open_ledger_fee),
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not get the fee of xrp');
    } finally {
      await client.disconnect();
    }
  }

  static async sendTransaction(isMainnet: boolean, req: SendTransaction): Promise<string> {
    if (!req.mnemonic || req.mnemonic === '') {
      throw new Error('can not get the mnemonic of xrp');
    }

    const client = this.getXrpClient(isMainnet);

    try {
      const wallet = Wallet.fromMnemonic(req.mnemonic);

      await client.connect();
      const transaction = await client.autofill({
        TransactionType: 'Payment',
        Account: wallet.address,
        Amount: xrpToDrops(req.value),
        Destination: req.to,
        Fee: xrpToDrops(Number(req.feeRate)),
      });

      const signed = wallet.sign(transaction);

      const tx = await client.submitAndWait(signed.tx_blob);

      if (tx.result.hash) {
        return tx.result.hash;
      }

      throw new Error('can not send the transaction of xrp');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transactions of xrp');
    } finally {
      await client.disconnect();
    }
  }
}
