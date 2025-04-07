import axios from 'axios';
import { ethers, Contract } from 'ethers';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS } from 'packages/constants/blockchain';
import { RPC } from '../rpc';
import {
  AssetBalance,
  CreateEthereumTransaction,
  EthereumTransactionDetail,
  ETHGasPrice,
  ETHMaxPriorityFeePerGas,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONFUNCS,
  TransactionRequest,
  TRANSACTIONSTATUS,
} from '../types';
import { FindDecimalsByChainIdsAndContractAddress, FindTokenByChainIdsAndContractAddress } from 'utils/web3';
import { BLOCKSCAN } from '../block_scan';
import { GetBlockchainTxUrl } from 'utils/chain/arbnova';
import Big from 'big.js';
import { ERC20Abi } from '../abi/erc20';

export class ARBNOVA {
  static chain = CHAINS.ARBITRUMNOVA;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static getChainIds(): CHAINIDS {
    return CHAINIDS.ARBITRUM_NOVA;
  }

  static async getProvider() {
    return new ethers.JsonRpcProvider(RPC.getRpcByChainIds(this.getChainIds()));
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /arbitrumnova:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;
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
    const regex = /arbitrumnova:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;

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

  static async generateQRCodeText(address: string, contractAddress?: string, amount?: string): Promise<string> {
    let qrcodeText = `arbitrumnova:${address}`;
    const decimal = contractAddress ? await this.getTokenDecimals(contractAddress) : 18;

    amount = amount || '0';
    const value = ethers.parseUnits(amount, decimal).toString();

    qrcodeText += `?value=${value}&decimal=${decimal}`;

    if (contractAddress) {
      qrcodeText += `&contractAddress=${contractAddress}`;
    }

    return qrcodeText;
  }

  static async getAssetBalance(address: string): Promise<AssetBalance> {
    try {
      let items = {} as AssetBalance;
      items.ETH = await this.getETHBalance(address);

      const coins = BLOCKCHAINNAMES.find((item) => item.chainId === this.getChainIds())?.coins;
      if (coins && coins.length > 0) {
        const tokens = coins.filter((item) => !item.isMainCoin);

        const promises = tokens.map(async (token) => {
          if (token.contractAddress && token.contractAddress !== '') {
            const balance = await this.getTokenBalance(address, token.contractAddress);
            items[token.symbol] = balance;
          }
        });

        await Promise.all(promises);
      }
      return items;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the asset balance of arbnova');
    }
  }

  static async getETHBalance(address: string): Promise<string> {
    try {
      const provider = await this.getProvider();
      const balance = await provider.getBalance(address);
      return ethers.formatUnits(balance, 18);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the eth balance of arbnova');
    }
  }

  static async getTokenBalance(address: string, contractAddress: string): Promise<string> {
    try {
      const provider = await this.getProvider();
      const contract = new Contract(contractAddress, ERC20Abi, provider);
      const result = await contract.balanceOf(address);
      const tokenDecimals = await this.getTokenDecimals(contractAddress);

      return ethers.formatUnits(result, tokenDecimals);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the token balance of arbnova');
    }
  }

  static async getTokenDecimals(contractAddress: string): Promise<number> {
    const decimals = FindDecimalsByChainIdsAndContractAddress(this.getChainIds(), contractAddress);
    if (decimals && decimals > 0) {
      return decimals;
    }

    try {
      const provider = await this.getProvider();
      const contract = new Contract(contractAddress, ERC20Abi, provider);
      const decimals = await contract.decimals();
      return decimals;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the decimals of arbnova');
    }
  }

  static async getTokenTransferToAmountAndTokenByInput(input: string): Promise<any> {
    const iface = new ethers.Interface(ERC20Abi);
    const result = iface.decodeFunctionData('transfer', input);
    const to = result[0];
    const token = FindTokenByChainIdsAndContractAddress(this.getChainIds(), to);
    const amount = ethers.formatUnits(result[1]._hex, token.decimals);

    return {
      to,
      amount,
      token,
    };
  }

  static async getTransactionStatus(hash: string): Promise<TRANSACTIONSTATUS> {
    try {
      const params = [hash];
      const response = await RPC.callRPC(this.getChainIds(), TRANSACTIONFUNCS.GETTXRECEIPT, params);
      if (!response || response === null) {
        throw new Error('can not get tx by hash');
      }

      const status = parseInt(response.result.status, 16);
      if (status === 1) {
        return TRANSACTIONSTATUS.SUCCESS;
      } else if (status === 0) {
        return TRANSACTIONSTATUS.FAILED;
      }

      throw new Error('can not get tx status of arbnova');
    } catch (e) {
      console.error(e);
      throw new Error('can not get tx status of arbnova');
    }
  }

  static async getTransactions(address: string, symbol?: string): Promise<EthereumTransactionDetail[]> {
    try {
      symbol = symbol ? symbol : '';

      const url = `${
        BLOCKSCAN.baseUrl
      }/node/arbnova/getTransactions?chain_id=${this.getChainIds()}&address=${address}&asset=${symbol}`;
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
      // throw new Error('can not get the transactions of arbnova');
    }
  }

  static async getTransactionDetail(hash: string, isPending: boolean = false): Promise<TransactionDetail> {
    const explorerUrl = GetBlockchainTxUrl(hash);

    try {
      throw new Error('can not get the transaction of arbnova');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of arbnova');
    }
  }

  static async estimateGas(txParams: TransactionRequest): Promise<number> {
    try {
      const response = await RPC.callRPC(this.getChainIds(), TRANSACTIONFUNCS.EstimateGas, [
        {
          from: txParams.from,
          to: txParams.to,
          value: txParams.value,
        },
      ]);

      if (!response || response === null) {
        throw new Error('can not estimate gas of arbnova');
      }

      const gasLimit = new Big(parseInt(response.result, 16));
      if (gasLimit && gasLimit.gt(0)) {
        return gasLimit.toNumber();
      }

      throw new Error('can not estimate gas of arbnova');
    } catch (e) {
      console.error(e);
      throw new Error('can not estimate gas of arbnova');
    }
  }

  static async getGasPrice(): Promise<ETHGasPrice> {
    try {
      const response = await RPC.callRPC(this.getChainIds(), TRANSACTIONFUNCS.GETGASPRICE, []);
      if (!response || response === null) {
        throw new Error('can not get the gasPrice');
      }

      const gasPrice = new Big(parseInt(response.result, 16));

      if (gasPrice && gasPrice.gt(0)) {
        return {
          slow: gasPrice.mul(0.95).toString(),
          normal: gasPrice.toString(),
          fast: gasPrice.mul(1.2).toString(),
        };
      }

      throw new Error('can not get gasPrice of arbnova');
    } catch (e) {
      console.error(e);
      throw new Error('can not get gasPrice of arbnova');
    }
  }

  static async getMaxPriorityFeePerGas(): Promise<ETHMaxPriorityFeePerGas> {
    try {
      const response = await RPC.callRPC(this.getChainIds(), TRANSACTIONFUNCS.MaxPriorityFeePerGas, []);
      if (!response || response === null) {
        throw new Error('can not get maxPriorityFeePerGas of arbnova');
      }

      const maxPriorityFeePerGas = new Big(parseInt(response.result, 16));

      if (maxPriorityFeePerGas) {
        return {
          slow: maxPriorityFeePerGas.mul(0.95).toString(),
          normal: maxPriorityFeePerGas.toString(),
          fast: maxPriorityFeePerGas.mul(1.2).toString(),
        };
      }

      throw new Error('can not get maxPriorityFeePerGas of arbnova');
    } catch (e) {
      console.error(e);
      throw new Error('can not get maxPriorityFeePerGas of arbnova');
    }
  }

  static async getGasLimit(contractAddress: string, from: string, to: string, value: string): Promise<number> {
    if (contractAddress && contractAddress !== '') {
      return 96000;
    }

    const txParams: TransactionRequest = {
      from: from,
      to: to,
      value: ethers.toQuantity(1),
    };

    return await this.estimateGas(txParams);
  }

  static async createTransaction(request: CreateEthereumTransaction): Promise<CreateEthereumTransaction> {
    if (request.contractAddress) {
      return await this.createTokenTransaction(request);
    } else {
      return await this.createETHTransaction(request);
    }
  }

  static async createTokenTransaction(request: CreateEthereumTransaction): Promise<CreateEthereumTransaction> {
    const decimals = await this.getTokenDecimals(request.contractAddress as string);
    const value = ethers.parseUnits(request.value, decimals).toString();
    const iface = new ethers.Interface(ERC20Abi);
    const data = iface.encodeFunctionData('transfer', [request.to, value]);
    request.data = data;
    request.to = request.contractAddress as string;

    if (!request.maxFeePerGas) {
      const price = await this.getGasPrice();
      request.maxFeePerGas = price.normal;
    }

    if (!request.gasLimit) {
      const limit = await this.getGasLimit(request.contractAddress as string, request.from, request.to, request.value);
      request.gasLimit = limit;
    }

    if (!request.maxPriorityFeePerGas) {
      const fee = await this.getMaxPriorityFeePerGas();
      request.maxPriorityFeePerGas = fee.normal;
    }

    request.value = '0';
    request.type = 2;

    return request;
  }

  static async createETHTransaction(request: CreateEthereumTransaction): Promise<CreateEthereumTransaction> {
    request.value = ethers.parseEther(request.value).toString();
    request.type = 2;
    if (request.maxFeePerGas) {
      request.maxFeePerGas = request.maxFeePerGas;
    } else {
      const price = await this.getGasPrice();
      request.maxFeePerGas = price.normal;
    }

    if (!request.gasLimit) {
      const limit = await this.getGasLimit(request.contractAddress as string, request.from, request.to, request.value);
      request.gasLimit = limit;
    }

    if (!request.maxPriorityFeePerGas) {
      const fee = await this.getMaxPriorityFeePerGas();
      request.maxPriorityFeePerGas = fee.normal;
    }

    return request;
  }

  static async getNonce(address: string): Promise<number> {
    try {
      const params = [address, 'latest'];
      const response = await RPC.callRPC(this.getChainIds(), TRANSACTIONFUNCS.GETNONCE, params);

      if (!response || response === null) {
        throw new Error('can not get nonce of arb');
      }

      return parseInt(response.result, 16);
    } catch (e) {
      console.error(e);
      throw new Error('can not get nonce of arbnova');
    }
  }

  static async sendTransaction(request: SendTransaction): Promise<string> {
    if (!request.privateKey || request.privateKey === '') {
      throw new Error('can not get the private key of arb');
    }

    const cRequest: CreateEthereumTransaction = {
      chainId: this.getChainIds(),
      from: request.from,
      to: request.to,
      privateKey: request.privateKey,
      value: request.value,
      contractAddress: request.coin.contractAddress,
      gasLimit: request.gasLimit as number,

      maxFeePerGas: request.gasPrice as string,
      maxPriorityFeePerGas: request.maxPriorityFeePerGas,
      nonce: request.nonce,
    };

    let tx = await this.createTransaction(cRequest);
    tx.nonce = tx.nonce ? tx.nonce : await this.getNonce(tx.from);

    try {
      const provider = await this.getProvider();
      const wallet = new ethers.Wallet(request.privateKey, provider);
      const response = await wallet.sendTransaction(cRequest);
      if (response) {
        return response.hash;
      }

      throw new Error('can not send the transaction of arbnova');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transaction of arbnova');
    }
  }

  static async personalSign(privateKey: string, message: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    const messageBytes = ethers.toUtf8Bytes(message);
    const signature = await wallet.signMessage(messageBytes);
    return signature;
  }
}
