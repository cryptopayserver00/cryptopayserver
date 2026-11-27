import axios from 'axios';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS, COINS, INNERCHAINNAMES } from '@/packages/constants/blockchain';
import {
  AssetBalance,
  ChainAccountType,
  CreateXrpTransaction,
  CreateXrpTrustLineTransaction,
  QRCodeText,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONSTATUS,
  TRANSACTIONTYPE,
} from '../types';
import { Client, dropsToXrp, isValidAddress, Wallet, xrpToDrops } from 'xrpl';
import { ToXrpCurrencyCode } from '@/utils/strings';
import { FindTokenByChainIdsAndContractAddress } from '@/utils/web3';
import { DropsToXrpStr } from '@/utils/number';
import { ethers } from 'ethers';
import { BLOCKSCAN } from '../block_scan';
import { GetBlockchainTxUrl } from '@/utils/chain/xrp';

export class XRP {
  static chain = CHAINS.XRP;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.XRP : CHAINIDS.XRP_TESTNET;
  }

  static getChainName(isMainnet: boolean): INNERCHAINNAMES {
    return isMainnet ? INNERCHAINNAMES.XRP : INNERCHAINNAMES.XRP_TESTNET;
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
          case INNERCHAINNAMES.XRP:
            network = 1;
            break;
          case INNERCHAINNAMES.XRP_TESTNET:
            network = 2;
            break;
          default:
            throw new Error('Invalid QR code text format');
        }

        amount = matchText[7];
        token = COINS.XRP;
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
      return {
        XRP: '0',
      } as AssetBalance;
      // throw new Error('can not get the asset balance of xrp');
    } finally {
      await client.disconnect();
    }
  }

  static async getXrpBalance(isMainnet: boolean, address: string, toXRP: boolean = true): Promise<string> {
    const client = this.getXrpClient(isMainnet);

    try {
      await client.connect();
      // Use integer drops from account_info — client.getXrpBalance() returns a JS number
      // and can introduce float noise (e.g. 53.99999 vs explorer-rounded 54).
      const info = await client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      });
      const drops = String(info.result.account_data?.Balance ?? '0');
      return toXRP ? DropsToXrpStr(drops) : drops;
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
      return null;
      // throw new Error('can not get the trust line of xrp');
    } finally {
      await client.disconnect();
    }
  }

  static async createTokenTrustline(isMainnet: boolean, req: CreateXrpTrustLineTransaction): Promise<string> {
    if (!req.mnemonic || req.mnemonic === '') {
      throw new Error('can not get the mnemonic of xrp');
    }
    if (!req.issuer || !isValidAddress(req.issuer)) {
      throw new Error('invalid xrp token issuer');
    }

    // xrpl IssuedCurrencyAmount.value MUST be a string (number fails: "invalid LimitAmount")
    const limit = String(req.limit ?? '').trim()
    if (!limit || Number(limit) < 0 || !Number.isFinite(Number(limit))) {
      throw new Error('invalid trustline limit');
    }

    const client = this.getXrpClient(isMainnet);

    try {
      await client.connect();

      const wallet = Wallet.fromMnemonic(req.mnemonic);
      if (req.address && wallet.classicAddress !== req.address && wallet.address !== req.address) {
        throw new Error('mnemonic does not match the from address');
      }

      const transaction = await client.autofill({
        TransactionType: 'TrustSet',
        Account: wallet.classicAddress || wallet.address,
        LimitAmount: {
          currency: ToXrpCurrencyCode(String(req.coin)),
          issuer: req.issuer,
          value: limit,
        },
      });

      const signed = wallet.sign(transaction);

      const tx = await client.submitAndWait(signed.tx_blob);
      const meta: any = tx.result.meta
      const engineResult =
        (typeof meta === 'object' && meta?.TransactionResult) ||
        (tx.result as any).engine_result ||
        ''
      if (engineResult && engineResult !== 'tesSUCCESS') {
        throw new Error(`TrustSet failed: ${engineResult}`)
      }

      if (tx.result.hash) {
        return tx.result.hash;
      }

      throw new Error('can not create the trust line of xrp');
    } catch (e) {
      console.error(e);
      const detail = e instanceof Error ? e.message : String(e)
      throw new Error(`can not create the trust line of xrp: ${detail}`);
    } finally {
      await client.disconnect();
    }
  }

  static async getTransactions(isMainnet: boolean, address: string): Promise<TransactionDetail[]> {
    try {
      if (!BLOCKSCAN.isConfigured) return []
      const url = `${BLOCKSCAN.baseUrl}/node/xrp/getTransactions?chain_id=${this.getChainIds(
        isMainnet
      )}&address=${encodeURIComponent(address)}`
      const response = await BLOCKSCAN.axiosInstance.get(url)
      if (response.data.code === 10200 && Array.isArray(response.data.data)) {
        return response.data.data.map((tx: any) => ({
          hash: String(tx.hash || ''),
          asset: String(tx.asset || COINS.XRP || 'XRP'),
          fee: '0',
          value: String(tx.amount || ''),
          type:
            tx.type === 'Send'
              ? TRANSACTIONTYPE.SEND
              : tx.type === 'Received'
                ? TRANSACTIONTYPE.RECEIVED
                : undefined,
          status:
            String(tx.status).toLowerCase() === 'success'
              ? TRANSACTIONSTATUS.SUCCESS
              : TRANSACTIONSTATUS.FAILED,
          blockTimestamp: Number(tx.blockTimestamp || 0),
          url: GetBlockchainTxUrl(isMainnet, String(tx.hash || '')),
        }))
      }
      return []
    } catch (e) {
      console.error(e)
      return []
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

      const baseFee = dropsToXrp(response.result.drops.base_fee)
      const medianFee = dropsToXrp(response.result.drops.median_fee)
      const minimumFee = dropsToXrp(response.result.drops.minimum_fee)
      const openLedgerFee = dropsToXrp(response.result.drops.open_ledger_fee)
      return {
        // snake_case (legacy) + camelCase for Send UI
        base_fee: baseFee,
        median_fee: medianFee,
        minimum_fee: minimumFee,
        open_ledger_fee: openLedgerFee,
        baseFee,
        medianFee,
        minimumFee,
        openLedgerFee,
      }
    } catch (e) {
      console.error(e);
      throw new Error('can not get the fee of xrp');
    } finally {
      await client.disconnect();
    }
  }

  static async createTransaction(isMainnet: boolean, request: CreateXrpTransaction): Promise<string> {
    if (request.contractAddress) {
      return await this.createTokenTransaction(isMainnet, request);
    } else {
      return await this.createXrpTransaction(isMainnet, request);
    }
  }

  static async createTokenTransaction(isMainnet: boolean, request: CreateXrpTransaction): Promise<string> {
    if (!request.mnemonic || request.mnemonic === '') {
      throw new Error('can not get the mnemonic of xrp');
    }

    if (!request.contractAddress || request.contractAddress === '') {
      throw new Error('can not get the contract address of xrp');
    }

    const token = FindTokenByChainIdsAndContractAddress(this.getChainIds(isMainnet), request.contractAddress);
    if (!token) {
      throw new Error('unknown xrp token contract');
    }

    const currency = ToXrpCurrencyCode(String(token.symbol || token.name));
    const issuer = String(request.contractAddress);
    const value = String(request.value);

    const client = this.getXrpClient(isMainnet);

    try {
      const wallet = Wallet.fromMnemonic(request.mnemonic);

      await client.connect();

      // IOU delivery requires the destination to have a TrustLine to this issuer+currency.
      const lines = await client.request({
        command: 'account_lines',
        account: request.to,
        ledger_index: 'validated',
        peer: issuer,
      });
      const okLine = (lines.result.lines || []).some((line: any) => {
        const lineCurrency = String(line.currency || '')
        const currencyMatch =
          lineCurrency === currency ||
          lineCurrency.toUpperCase() === String(token.symbol || token.name).toUpperCase()
        const limit = Number(line.limit)
        return currencyMatch && Number.isFinite(limit) && limit > 0
      })
      if (!okLine) {
        throw new Error(
          `Destination has no TrustLine for ${token.symbol} (issuer ${issuer}). Ask the recipient to add a TrustLine first.`
        )
      }

      const feeXrp = Number(request.feeRate)
      const feeDrops = xrpToDrops(Number.isFinite(feeXrp) && feeXrp > 0 ? feeXrp : 0.00001)

      const transaction = await client.autofill({
        TransactionType: 'Payment',
        Account: wallet.classicAddress || wallet.address,
        Amount: {
          currency,
          value,
          issuer,
        },
        Destination: request.to,
        Fee: feeDrops,
      });

      const signed = wallet.sign(transaction);

      const tx = await client.submitAndWait(signed.tx_blob);
      const meta: any = tx.result.meta
      const engineResult =
        (typeof meta === 'object' && meta?.TransactionResult) ||
        (tx.result as any).engine_result ||
        ''
      if (engineResult && engineResult !== 'tesSUCCESS') {
        const hint =
          engineResult === 'tecPATH_DRY'
            ? ' (no liquidity path — usually missing destination TrustLine or sender balance)'
            : ''
        throw new Error(`Payment failed: ${engineResult}${hint}`)
      }

      if (tx.result.hash) {
        return tx.result.hash;
      }

      throw new Error('can not send the transaction of xrp');
    } catch (e) {
      console.error(e);
      const detail = e instanceof Error ? e.message : String(e)
      throw new Error(detail.startsWith('can not') ? detail : `can not send the transactions of xrp: ${detail}`);
    } finally {
      await client.disconnect();
    }
  }

  static async createXrpTransaction(isMainnet: boolean, request: CreateXrpTransaction): Promise<string> {
    if (!request.mnemonic || request.mnemonic === '') {
      throw new Error('can not get the mnemonic of xrp');
    }

    const client = this.getXrpClient(isMainnet);

    try {
      const wallet = Wallet.fromMnemonic(request.mnemonic);

      await client.connect();
      const transaction = await client.autofill({
        TransactionType: 'Payment',
        Account: wallet.address,
        Amount: xrpToDrops(request.value),
        Destination: request.to,
        Fee: xrpToDrops(Number(request.feeRate)),
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

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {
    const cRequest: CreateXrpTransaction = {
      mnemonic: String(request.mnemonic),
      from: request.from,
      to: request.to,
      value: request.value,
      contractAddress: request.coin.contractAddress,
      feeRate: request.feeRate,
    };

    const tx = await this.createTransaction(isMainnet, cRequest);
    if (tx) {
      return tx;
    }
    throw new Error('can not send the transaction of xrp');
  }
}
