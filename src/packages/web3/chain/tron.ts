import axios from 'axios';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import {
  AssetBalance,
  ChainAccountType,
  CreateTronTransaction,
  EthereumTransactionDetail,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONSTATUS,
} from '../types';
import { HDKey } from 'ethereum-cryptography/hdkey';
import { TronWeb } from 'tronweb';
import { ethers } from 'ethers';
import { FindDecimalsByChainIdsAndContractAddress } from 'utils/web3';
import { TRC20Abi } from '../abi/trc20';
import { GetBlockchainTxUrl } from 'utils/chain/tron';
import { BLOCKSCAN } from '../block_scan';
import { SignedTransaction } from 'tronweb/lib/esm/types';

export class TRON {
  static chain = CHAINS.TRON;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.TRON : CHAINIDS.TRON_NILE;
  }

  static async getTronClient(isMainnet: boolean) {
    return new TronWeb({
      fullHost: isMainnet ? 'https://api.trongrid.io' : 'https://nile.trongrid.io',
      headers: {
        'TRON-PRO-API-KEY': isMainnet ? process.env.TRON_API_KEY_MAINNET : process.env.TRON_API_KEY_NILE,
      },
    });
  }

  static createAccountBySeed(isMainnet: boolean, seed: Buffer): ChainAccountType {
    const path = `m/44'/195'/0'/0/0`;

    try {
      const hdkey = HDKey.fromMasterSeed(Uint8Array.from(seed)).derive(path);

      const privateKey = Buffer.from(hdkey.privateKey as Uint8Array).toString('hex');
      const address = TronWeb.address.fromPrivateKey(privateKey) as string;

      return {
        chain: this.chain,
        address: address,
        privateKey: privateKey,
        note: 'Tron',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of tron');
    }
  }

  static createAccountByPrivateKey(isMainnet: boolean, privateKey: string): ChainAccountType {
    try {
      const address = TronWeb.address.fromPrivateKey(privateKey) as string;

      return {
        chain: this.chain,
        address: address,
        privateKey: privateKey,
        note: 'Tron',
        isMainnet: isMainnet,
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not create a wallet of tron');
    }
  }

  static checkAddress(address: string): boolean {
    return TronWeb.isAddress(address);
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /tron:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;
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
    const regex = /tron:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;

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
    let qrcodeText = `tron:${address}`;
    const decimal = contractAddress ? await this.getTokenDecimals(isMainnet, contractAddress) : 6;

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
      items.TRX = await this.getTRXBalance(isMainnet, address);

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
      throw new Error('can not get the asset balance of tron');
    }
  }

  static async getTRXBalance(isMainnet: boolean, address: string): Promise<string> {
    try {
      const tronWeb = await this.getTronClient(isMainnet);
      const balance = await tronWeb.trx.getBalance(address);
      return tronWeb.fromSun(balance).toString();
    } catch (e) {
      console.error(e);
      throw new Error('can not get the trx balance of tron');
    }
  }

  static async getTokenBalance(isMainnet: boolean, address: string, contractAddress: string): Promise<string> {
    try {
      const tronWeb = await this.getTronClient(isMainnet);
      tronWeb.setAddress(contractAddress);
      const contract = tronWeb.contract(TRC20Abi, contractAddress);
      const result = await contract.balanceOf(address).call();
      const tokenDecimals = await this.getTokenDecimals(isMainnet, contractAddress);
      return ethers.formatUnits(result, tokenDecimals);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the token balance of tron');
    }
  }

  static async getTokenDecimals(isMainnet: boolean, contractAddress: string): Promise<number> {
    const decimals = FindDecimalsByChainIdsAndContractAddress(this.getChainIds(isMainnet), contractAddress);
    if (decimals && decimals > 0) {
      return decimals;
    }

    try {
      const tronWeb = await this.getTronClient(isMainnet);
      tronWeb.setAddress(contractAddress);

      const contract = tronWeb.contract(TRC20Abi, contractAddress);
      const decimals = await contract.decimals().call();
      return decimals;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the decimals of tron');
    }
  }

  static async getTransactionDetail(isMainnet: boolean, hash: string): Promise<TransactionDetail> {
    try {
      const tronWeb = await this.getTronClient(isMainnet);
      const explorerUrl = GetBlockchainTxUrl(isMainnet, hash);

      const [transaction, transactionInfo]: any = await Promise.all([
        tronWeb.trx.getTransaction(hash),
        tronWeb.trx.getTransactionInfo(hash),
      ]);

      const from = transaction.raw_data.contract[0].parameter.value.owner_address;
      const status =
        transaction.ret[0].contractRet === 'SUCCESS' ? TRANSACTIONSTATUS.SUCCESS : TRANSACTIONSTATUS.FAILED;

      const type = transaction.raw_data.contract[0].type;
      let to = transaction.raw_data.contract[0].parameter.value.to_address;
      let amount = TronWeb.fromSun(transaction.raw_data.contract[0].parameter.value.amount);

      let isContract = false;

      if (type == 'TriggerSmartContract') {
        isContract = true;
        const data = transaction.raw_data.contract[0].parameter.value.data;
        const contractAddress = transaction.raw_data.contract[0].parameter.value.contract_address;
        const decodeData = await this.decodeTokenTransfer(data);
        const { address, value } = decodeData;

        const decimals = await this.getTokenDecimals(isMainnet, contractAddress);

        to = address;

        amount = ethers.formatUnits(value, decimals);
      }

      return {
        blockNumber: transactionInfo.blockNumber,
        blockTimestamp: transactionInfo.blockTimeStamp,
        hash: hash,
        from: await this.fromBase58Address(isMainnet, from),
        to: await this.fromBase58Address(isMainnet, to),
        value: amount.toString(),
        status: status,
        fee: TronWeb.fromSun(transactionInfo.fee).toString(),
        url: explorerUrl,
        asset: '',
      };
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of tron');
    }
  }

  static async getTransactions(
    isMainnet: boolean,
    address: string,
    symbol?: string,
  ): Promise<EthereumTransactionDetail[]> {
    return []
    
    try {
      symbol = symbol ? symbol : '';

      const url = `${BLOCKSCAN.baseUrl}/node/tron/getTransactions?chain_id=${this.getChainIds(
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
      // throw new Error('can not get the transactions of tron');
    }
  }

  static decodeTokenTransfer(txData: string): any {
    if (txData.slice(0, 8) !== 'a9059cbb') {
      return null;
    }
    try {
      const abiCoder = new ethers.AbiCoder();
      const decodedData = abiCoder.decode(['address', 'uint256'], '0x' + txData.slice(8));
      const [address, value] = decodedData;
      return { address, value };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async fromBase58Address(isMainnet: boolean, address: string): Promise<string> {
    try {
      const tronWeb = await this.getTronClient(isMainnet);
      const tronAddress = tronWeb.address.fromHex(address);
      return tronAddress;
    } catch (e) {
      console.error(e);
      return '';
    }
  }

  static async createTransaction(isMainnet: boolean, request: CreateTronTransaction): Promise<SignedTransaction> {
    if (request.contractAddress) {
      return await this.createTokenTransaction(isMainnet, request);
    } else {
      return await this.createTRXTransaction(isMainnet, request);
    }
  }

  static async createTokenTransaction(isMainnet: boolean, request: CreateTronTransaction): Promise<SignedTransaction> {
    try {
      if (!request.contractAddress || request.contractAddress === '') {
        throw new Error('can not get the contractAddress of tron');
      }

      const tronWeb = await this.getTronClient(isMainnet);
      tronWeb.setPrivateKey(request.privateKey as string);

      const decimals = await this.getTokenDecimals(isMainnet, request.contractAddress);
      const value = ethers.parseUnits(request.value, decimals);

      const abi = 'transfer(address,uint256)';

      const options = {
        feeLimit: 80000000,
        callValue: 0,
      };
      const parameter = [
        { type: 'address', value: request.to },
        { type: 'uint256', value: value },
      ];
      const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
        request.contractAddress,
        abi,
        options,
        parameter,
        tronWeb.defaultAddress.hex as string,
      );
      return await tronWeb.trx.sign(transaction.transaction);
    } catch (e) {
      console.error(e);
      throw new Error('can not create the token transactions of tron');
    }
  }

  static async createTRXTransaction(isMainnet: boolean, request: CreateTronTransaction): Promise<SignedTransaction> {
    try {
      const tronWeb = await this.getTronClient(isMainnet);
      tronWeb.setPrivateKey(request.privateKey as string);

      const value = ethers.parseUnits(request.value, 6);

      const transaction = await tronWeb.transactionBuilder.sendTrx(request.to, Number(value), request.from);

      return await tronWeb.trx.sign(transaction);
    } catch (e) {
      console.error(e);
      throw new Error('can not create the trx transactions of tron');
    }
  }

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {
    if (!request.privateKey || request.privateKey === '') {
      throw new Error('can not get the private key of tron');
    }

    const cRequest: CreateTronTransaction = {
      privateKey: request.privateKey,
      from: request.from,
      to: request.to,
      value: request.value,
      contractAddress: request.coin.contractAddress,
    };

    try {
      const tronWeb = await this.getTronClient(isMainnet);
      const tx = await this.createTransaction(isMainnet, cRequest);
      const receipt = await tronWeb.trx.sendRawTransaction(tx);
      if (receipt && receipt.result) {
        return receipt.transaction.txID;
      }

      throw new Error('can not send the transaction of tron');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transaction of tron');
    }
  }
}
