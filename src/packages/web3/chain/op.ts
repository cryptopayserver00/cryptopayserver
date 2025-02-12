import axios from 'axios';
import { ethers, Contract } from 'ethers';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS, COINS } from 'packages/constants/blockchain';
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
import { GetBlockchainTxUrl } from 'utils/chain/op';
import { BigMul } from 'utils/number';
import Big from 'big.js';
import { ERC20Abi } from '../abi/erc20';

export class OP {
  static chain = CHAINS.OPTIMISM;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.OPTIMISM : CHAINIDS.OPTIMISM_SEPOLIA;
  }

  static async getProvider(isMainnet: boolean) {
    return new ethers.JsonRpcProvider(RPC.getRpcByChainIds(this.getChainIds(isMainnet)));
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /optimism:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;
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
    const regex = /optimism:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;

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
    let qrcodeText = `optimism:${address}`;
    const decimal = contractAddress ? await this.getTokenDecimals(isMainnet, contractAddress) : 18;

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
      items.ETH = await this.getETHBalance(isMainnet, address);

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
      throw new Error('can not get the asset balance of op');
    }
  }

  static async getETHBalance(isMainnet: boolean, address: string): Promise<string> {
    try {
      const provider = await this.getProvider(isMainnet);
      const balance = await provider.getBalance(address);
      return ethers.formatUnits(balance, 18);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the bnb balance of op');
    }
  }

  static async getTokenBalance(isMainnet: boolean, address: string, contractAddress: string): Promise<string> {
    try {
      const provider = await this.getProvider(isMainnet);
      const contract = new Contract(contractAddress, ERC20Abi, provider);
      const result = await contract.balanceOf(address);
      const tokenDecimals = await this.getTokenDecimals(isMainnet, contractAddress);

      return ethers.formatUnits(result, tokenDecimals);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the token balance of op');
    }
  }

  static async getTokenDecimals(isMainnet: boolean, contractAddress: string): Promise<number> {
    const decimals = FindDecimalsByChainIdsAndContractAddress(this.getChainIds(isMainnet), contractAddress);
    if (decimals && decimals > 0) {
      return decimals;
    }

    try {
      const provider = await this.getProvider(isMainnet);
      const contract = new Contract(contractAddress, ERC20Abi, provider);
      const decimals = await contract.decimals();
      return decimals;
    } catch (e) {
      console.error(e);
      throw new Error('can not get the decimals of op');
    }
  }

  static async getTokenTransferToAmountAndTokenByInput(isMainnet: boolean, input: string): Promise<any> {
    const iface = new ethers.Interface(ERC20Abi);
    const result = iface.decodeFunctionData('transfer', input);
    const to = result[0];
    const token = FindTokenByChainIdsAndContractAddress(this.getChainIds(isMainnet), to);
    const amount = ethers.formatUnits(result[1]._hex, token.decimals);

    return {
      to,
      amount,
      token,
    };
  }

  static async getTransactionStatus(isMainnet: boolean, hash: string): Promise<TRANSACTIONSTATUS> {
    try {
      const params = [hash];
      const response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.GETTXRECEIPT, params);
      if (!response || response === null) {
        throw new Error('can not get tx by hash');
      }

      const status = parseInt(response.result.status, 16);
      if (status === 1) {
        return TRANSACTIONSTATUS.SUCCESS;
      } else if (status === 0) {
        return TRANSACTIONSTATUS.FAILED;
      }

      throw new Error('can not get tx status of op');
    } catch (e) {
      console.error(e);
      throw new Error('can not get tx status of op');
    }
  }

  static async getTransactions(
    isMainnet: boolean,
    address: string,
    symbol?: string,
  ): Promise<EthereumTransactionDetail[]> {
    try {
      symbol = symbol ? symbol : '';

      const url = `${BLOCKSCAN.baseUrl}/node/op/getTransactions?chain_id=${this.getChainIds(
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
      throw new Error('can not get the transactions of op');
    }
  }

  static async getTransactionDetail(
    isMainnet: boolean,
    hash: string,
    isPending: boolean = false,
  ): Promise<TransactionDetail> {
    const explorerUrl = GetBlockchainTxUrl(isMainnet, hash);

    try {
      throw new Error('can not get the transaction of op');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of op');
    }
  }

  static async estimateGas(isMainnet: boolean, txParams: TransactionRequest): Promise<number> {
    try {
      const response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.EstimateGas, [
        {
          from: txParams.from,
          to: txParams.to,
          value: txParams.value,
        },
      ]);

      if (!response || response === null) {
        throw new Error('can not estimate gas of op');
      }

      const gasLimit = new Big(parseInt(response.result, 16));
      if (gasLimit && gasLimit.gt(0)) {
        return gasLimit.toNumber();
      }

      throw new Error('can not estimate gas of op');
    } catch (e) {
      console.error(e);
      throw new Error('can not estimate gas of op');
    }
  }

  static async getGasPrice(isMainnet: boolean): Promise<ETHGasPrice> {
    try {
      const response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.GETGASPRICE, []);
      if (!response || response === null) {
        throw new Error('can not get the gasPrice');
      }

      const gasPrice = new Big(parseInt(response.result, 16));

      if (gasPrice && gasPrice.gt(0)) {
        return {
          slow: gasPrice.toString(),
          normal: gasPrice.mul(150).div(100).toString(),
          fast: gasPrice.mul(2).toString(),
        };
      }

      throw new Error('can not get gasPrice of op');
    } catch (e) {
      console.error(e);
      throw new Error('can not get gasPrice of op');
    }
  }

  static async getMaxPriorityFeePerGas(isMainnet: boolean): Promise<ETHMaxPriorityFeePerGas> {
    try {
      const response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.MaxPriorityFeePerGas, []);
      if (!response || response === null) {
        throw new Error('can not get maxPriorityFeePerGas of op');
      }

      const maxPriorityFeePerGas = new Big(parseInt(response.result, 16));

      if (maxPriorityFeePerGas) {
        return {
          slow: maxPriorityFeePerGas.toString(),
          normal: maxPriorityFeePerGas.mul(150).div(100).toString(),
          fast: maxPriorityFeePerGas.mul(2).toString(),
        };
      }

      throw new Error('can not get maxPriorityFeePerGas of op');
    } catch (e) {
      console.error(e);
      throw new Error('can not get maxPriorityFeePerGas of op');
    }
  }

  static async getGasLimit(
    isMainnet: boolean,
    contractAddress: string,
    from: string,
    to: string,
    value: string,
  ): Promise<number> {
    if (contractAddress && contractAddress !== '') {
      return 96000;
    }

    const txParams: TransactionRequest = {
      from: from,
      to: to,
      value: ethers.toQuantity(1),
    };

    return await this.estimateGas(isMainnet, txParams);
  }

  static async createTransaction(
    isMainnet: boolean,
    request: CreateEthereumTransaction,
  ): Promise<CreateEthereumTransaction> {
    if (request.contractAddress) {
      return await this.createTokenTransaction(isMainnet, request);
    } else {
      return await this.createETHTransaction(isMainnet, request);
    }
  }

  static async createTokenTransaction(
    isMainnet: boolean,
    request: CreateEthereumTransaction,
  ): Promise<CreateEthereumTransaction> {
    const decimals = await this.getTokenDecimals(isMainnet, request.contractAddress as string);
    const value = ethers.parseUnits(request.value, decimals).toString();
    const iface = new ethers.Interface(ERC20Abi);
    const data = iface.encodeFunctionData('transfer', [request.to, value]);
    request.data = data;
    request.to = request.contractAddress as string;

    if (!request.maxFeePerGas) {
      const price = await this.getGasPrice(isMainnet);
      request.maxFeePerGas = price.normal;
    }

    if (!request.gasLimit) {
      const limit = await this.getGasLimit(
        isMainnet,
        request.contractAddress as string,
        request.from,
        request.to,
        request.value,
      );
      request.gasLimit = limit;
    }

    if (!request.maxPriorityFeePerGas) {
      const fee = await this.getMaxPriorityFeePerGas(isMainnet);
      request.maxPriorityFeePerGas = fee.normal;
    }

    request.value = '0';
    request.type = 2;

    return request;
  }

  static async createETHTransaction(
    isMainnet: boolean,
    request: CreateEthereumTransaction,
  ): Promise<CreateEthereumTransaction> {
    request.value = ethers.parseEther(request.value).toString();
    request.type = 2;
    if (request.maxFeePerGas) {
      request.maxFeePerGas = request.maxFeePerGas;
    } else {
      const price = await this.getGasPrice(isMainnet);
      request.maxFeePerGas = price.normal;
    }

    if (!request.gasLimit) {
      const limit = await this.getGasLimit(
        isMainnet,
        request.contractAddress as string,
        request.from,
        request.to,
        request.value,
      );
      request.gasLimit = limit;
    }

    if (!request.maxPriorityFeePerGas) {
      const fee = await this.getMaxPriorityFeePerGas(isMainnet);
      request.maxPriorityFeePerGas = fee.normal;
    }

    return request;
  }

  static async getNonce(isMainnet: boolean, address: string): Promise<number> {
    try {
      const params = [address, 'latest'];
      const response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.GETNONCE, params);

      if (!response || response === null) {
        throw new Error('can not get nonce of op');
      }

      return parseInt(response.result, 16);
    } catch (e) {
      console.error(e);
      throw new Error('can not get nonce of op');
    }
  }

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {
    if (!request.privateKey || request.privateKey === '') {
      throw new Error('can not get the private key of op');
    }

    const cRequest: CreateEthereumTransaction = {
      chainId: this.getChainIds(isMainnet),
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

    let tx = await this.createTransaction(isMainnet, cRequest);
    tx.nonce = tx.nonce ? tx.nonce : await this.getNonce(isMainnet, tx.from);

    try {
      const provider = await this.getProvider(isMainnet);
      const wallet = new ethers.Wallet(request.privateKey, provider);
      const response = await wallet.sendTransaction(cRequest);
      if (response) {
        return response.hash;
      }

      throw new Error('can not send the transaction of op');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transaction of op');
    }
  }

  static async personalSign(privateKey: string, message: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    const messageBytes = ethers.toUtf8Bytes(message);
    const signature = await wallet.signMessage(messageBytes);
    return signature;
  }
}
