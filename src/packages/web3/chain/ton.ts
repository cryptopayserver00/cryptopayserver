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
import { FindDecimalsByChainIdsAndContractAddress, FindTokenByChainIdsAndContractAddress } from 'utils/web3';
import { GetBlockchainTxUrl } from 'utils/chain/ton';
import { BLOCKSCAN } from '../block_scan';
import { keyPairFromSecretKey, keyPairFromSeed, mnemonicToPrivateKey, mnemonicToWalletKey } from '@ton/crypto';
import {
  Address,
  beginCell,
  fromNano,
  internal,
  JettonMaster,
  JettonWallet,
  SendMode,
  toNano,
  TonClient,
  WalletContractV4,
  WalletContractV5R1,
} from '@ton/ton';
import TonWeb from 'tonweb';

export class TON {
  static chain = CHAINS.TON;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.TON : CHAINIDS.TON_TESTNET;
  }

  static getTonClient(isMainnet: boolean): TonClient {
    const url = isMainnet ? 'https://toncenter.com/api/v2/jsonRPC' : 'https://testnet.toncenter.com/api/v2/jsonRPC';
    return new TonClient({
      endpoint: url,
      apiKey: process.env.TON_API_KEY,
    });
  }

  static getTonWebClient(isMainnet: boolean): TonWeb {
    const url = isMainnet ? 'https://toncenter.com/api/v2/jsonRPC' : 'https://testnet.toncenter.com/api/v2/jsonRPC';
    return new TonWeb(
      new TonWeb.HttpProvider(url, {
        apiKey: process.env.TON_API_KEY,
      }),
    );
  }

  static async createAccountBySeed(isMainnet: boolean, seed: Buffer, mnemonic: string): Promise<ChainAccountType> {
    const path = `m/44'/607'/0'/0/0`;

    try {
      const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
      const publicKey = keyPair.publicKey;

      const wallet = WalletContractV4.create({
        publicKey: publicKey,
        workchain: 0,
      });

      const addressOptions = {
        urlSafe: true,
        bounceable: false,
        testOnly: !isMainnet,
      };

      const address = wallet.address.toString(addressOptions);

      return {
        chain: this.chain,
        address: address,
        privateKey: keyPair.secretKey.toString('hex'),
        note: 'TON',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of ton');
    }
  }

  static async createAccountByPrivateKey(isMainnet: boolean, privateKey: string): Promise<ChainAccountType> {
    try {
      const keypair = keyPairFromSecretKey(Buffer.from(privateKey));

      const wallet = WalletContractV4.create({
        publicKey: keypair.publicKey,
        workchain: 0,
      });

      const addressOptions = {
        urlSafe: true,
        bounceable: false,
        testOnly: !isMainnet,
      };

      const address = wallet.address.toString(addressOptions);

      return {
        chain: this.chain,
        address: address,
        privateKey: privateKey,
        note: 'TON',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of ton');
    }
  }

  static checkAddress(isMainnet: boolean, address: string): boolean {
    try {
      Address.parse(address);
      return true;
    } catch (e) {
      return false;
    }
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
      console.error(e);
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
    const decimal = contractAddress ? await this.getTokenDecimals(isMainnet, contractAddress) : 9;

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
            const balance = await this.getTokenBalance(isMainnet, address, token.contractAddress);
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
      const client = this.getTonClient(isMainnet);

      const balance = await client.getBalance(Address.parse(address));

      return fromNano(balance);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the ton balance of ton');
    }
  }

  static async getTokenBalance(isMainnet: boolean, address: string, contractAddress: string): Promise<string> {
    try {
      const tonweb = this.getTonWebClient(isMainnet);

      // const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonweb.provider, {
      //   adminAddress: new TonWeb.utils.Address(contractAddress),
      //   jettonContentUri: '',
      //   jettonWalletCodeHex: '',
      // });
      // const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(new TonWeb.utils.Address(address));
      // const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider, { address: jettonWalletAddress });
      // const data = await jettonWallet.getData();
      // return data.balance;

      const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider, {
        address: address,
      });
      const result = await jettonWallet.provider.getBalance(contractAddress);
      const tokenDecimals = await this.getTokenDecimals(isMainnet, contractAddress);
      return ethers.formatUnits(result, tokenDecimals);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the token balance of ton');
    }
  }

  static async getTokenDecimals(isMainnet: boolean, contractAddress: string): Promise<number> {
    const decimals = FindDecimalsByChainIdsAndContractAddress(this.getChainIds(isMainnet), contractAddress);
    if (decimals && decimals > 0) {
      return decimals;
    }

    try {
      // const tonweb = this.getTonClient(isMainnet);

      return 0;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the decimals of ton');
    }
  }

  static async getTransactionDetail(isMainnet: boolean, hash: string): Promise<TransactionDetail> {
    try {
      const tonweb = this.getTonClient(isMainnet);
      const explorerUrl = GetBlockchainTxUrl(isMainnet, hash);

      return {
        blockNumber: 0,
        blockTimestamp: 0,
        hash: hash,
        from: '',
        to: '',
        value: '',
        status: TRANSACTIONSTATUS.SUCCESS,
        fee: '',
        url: explorerUrl,
        asset: '',
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of ton');
    }
  }

  static async getTransactions(
    isMainnet: boolean,
    address: string,
    symbol?: string,
  ): Promise<EthereumTransactionDetail[]> {
    try {
      symbol = symbol ? symbol : '';

      const url = `${BLOCKSCAN.baseUrl}/node/ton/getTransactions?chain_id=${this.getChainIds(
        isMainnet,
      )}&address=${address}&asset=${symbol}`;
      const response = await this.axiosInstance.get(url);
      if (response.data.code === 10200 && response.data.data) {
        const txs = response.data.data;

        return txs;
      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
      return [];
      // throw new Error('can not get the transactions of ton');
    }
  }

  static async createTransaction(isMainnet: boolean, request: CreateTonTransaction): Promise<any> {
    if (request.contractAddress) {
      return await this.createTokenTransaction(isMainnet, request);
    } else {
      return await this.createTONTransaction(isMainnet, request);
    }
  }

  static async createTokenTransaction(isMainnet: boolean, request: CreateTonTransaction): Promise<string> {
    if (!request.mnemonic || request.mnemonic === '') {
      throw new Error('can not get the mnemonic of ton');
    }

    if (!request.contractAddress || request.contractAddress === '') {
      throw new Error('can not get the contract address of ton');
    }

    const token = FindTokenByChainIdsAndContractAddress(this.getChainIds(isMainnet), request.contractAddress);

    try {
      const client = this.getTonClient(isMainnet);

      const keyPair = await mnemonicToPrivateKey(request.mnemonic.split(' '));

      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
      });

      const walletContract = client.open(wallet);

      const jettonWallet = JettonWallet.create(wallet.address);

      throw new Error('can not send the transaction of ton');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transaction of ton');
    }
  }

  static async createTONTransaction(isMainnet: boolean, request: CreateTonTransaction): Promise<string> {
    if (!request.mnemonic || request.mnemonic === '') {
      throw new Error('can not get the mnemonic of ton');
    }

    try {
      const client = this.getTonClient(isMainnet);

      const keyPair = await mnemonicToPrivateKey(request.mnemonic.split(' '));

      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
      });

      const walletContract = client.open(wallet);

      const balance = await walletContract.getBalance();
      if (balance < toNano(request.value) + toNano('0.05')) {
        throw new Error('Insufficient balance for transfer and gas');
      }

      const seqno = await walletContract.getSeqno();

      const transfer = walletContract.createTransfer({
        seqno: seqno,
        secretKey: keyPair.secretKey,
        messages: [
          internal({
            to: request.to,
            value: toNano(request.value),
            body: request.memo,
          }),
        ],
        sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
      });

      await walletContract.send(transfer);

      const maxAttempts = 30;
      const delayMs = 1000;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        setTimeout(() => {}, delayMs);

        const newSeqno = await walletContract.getSeqno();
        if (newSeqno > seqno) {
          const transactions = await client.getTransactions(wallet.address, {
            limit: 1,
          });

          if (transactions.length > 0) {
            const tx = transactions[0];
            return tx.hash().toString('hex');
          }
        }
      }

      throw new Error('can not send the transaction of ton');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transaction of ton');
    }
  }

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {
    const cRequest: CreateTonTransaction = {
      mnemonic: String(request.mnemonic),
      privateKey: request.privateKey,
      from: request.from,
      to: request.to,
      value: request.value,
      contractAddress: request.coin.contractAddress,
      memo: String(request.memo),
    };

    const tx = await this.createTransaction(isMainnet, cRequest);
    if (tx) {
      return tx;
    }
    throw new Error('can not send the transaction of ton');
  }

  static async estimateGasFee(isMainnet: boolean, request: SendTransaction): Promise<any> {
    if (!request.privateKey || request.privateKey === '') {
      throw new Error('can not get the private key of ton');
    }

    try {
      // const tonweb = this.getTonClient(isMainnet);

      // const keypair = keyPairFromSecretKey(Buffer.from(request.privateKey));

      // const wallet = tonweb.wallet.create({
      //   publicKey: keypair.publicKey,
      // });

      // const seqno = (await wallet.methods.seqno().call()) || 0;

      // const fee = await wallet.methods
      //   .transfer({
      //     secretKey: new Uint8Array(keypair.secretKey),
      //     toAddress: request.to,
      //     amount: TonWeb.utils.toNano(request.value),
      //     seqno,
      //     payload: 'estimate gas fee',
      //   })
      //   .estimateFee();

      // return TonWeb.utils.fromNano(fee.source_fees.gas_fee.toString());

      return '';
    } catch (e) {
      console.error(e);
      throw new Error('can not estimate gas fee of ton');
    }
  }
}
