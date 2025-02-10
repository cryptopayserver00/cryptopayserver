import axios from 'axios';
import { ethers, Contract } from 'ethers';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS, COINS } from 'packages/constants/blockchain';
import { RPC } from '../rpc';
import {
  AssetBalance,
  CreateEthereumTransaction,
  EthereumTransactionDetail,
  ETHGasPrice,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONFUNCS,
  TransactionRequest,
  TRANSACTIONSTATUS,
} from '../types';
import { FindDecimalsByChainIdsAndContractAddress, FindTokenByChainIdsAndContractAddress } from 'utils/web3';
import { BLOCKSCAN } from '../block_scan';
import { GetBlockchainTxUrl } from 'utils/chain/arb';
import { BigMul } from 'utils/number';
import Big from 'big.js';
import { ERC20Abi } from '../abi/erc20';

export class ARB {
  static chain = CHAINS.ARBITRUM;

  static axiosInstance = axios.create({
    timeout: 10000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.ARBITRUM_ONE : CHAINIDS.ARBITRUM_SEPOLIA;
  }

  static async getProvider(isMainnet: boolean) {
    return new ethers.JsonRpcProvider(RPC.getRpcByChainIds(this.getChainIds(isMainnet)));
  }

  static checkQRCodeText(text: string): boolean {
    const regex = /arbitrum:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;
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
    const regex = /arbitrum:(\w+)(\?value=(\d+)&decimal=(\d+))?(&contractAddress=(\w+))?/;

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
    let qrcodeText = `arbitrum:${address}`;
    const decimal = contractAddress ? await this.getERC20Decimals(isMainnet, contractAddress) : 18;

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
    } catch (e) {
      console.error(e);
      throw new Error('can not get the asset balance of arb');
    }
  }

  static async getETHBalance(isMainnet: boolean, address: string): Promise<string> {
    try {
      const provider = await this.getProvider(isMainnet);
      const balance = await provider.getBalance(address);
      return ethers.formatUnits(balance, 18);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the bnb balance of arb');
    }
  }

  static async getERC20Balance(isMainnet: boolean, address: string, contractAddress: string): Promise<string> {
    try {
      const provider = await this.getProvider(isMainnet);
      const contract = new Contract(contractAddress, ERC20Abi, provider);
      const result = await contract.balanceOf(address);
      const tokenDecimals = await this.getERC20Decimals(isMainnet, contractAddress);

      return ethers.formatUnits(result, tokenDecimals);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the erc20 balance of arb');
    }
  }

  static async getERC20Decimals(isMainnet: boolean, contractAddress: string): Promise<number> {
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
      throw new Error('can not get the decimals of arb');
    }
  }

  static async getERC20TransferToAmountAndTokenByInput(isMainnet: boolean, input: string): Promise<any> {
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

      throw new Error('can not get tx status of arb');
    } catch (e) {
      console.error(e);
      throw new Error('can not get tx status of arb');
    }
  }

  static async getTransactions(
    isMainnet: boolean,
    address: string,
    symbol?: string,
  ): Promise<EthereumTransactionDetail[]> {
    try {
      symbol = symbol ? symbol : '';

      const url = `${BLOCKSCAN.baseUrl}/node/arb/getTransactions?chain_id=${this.getChainIds(
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
      throw new Error('can not get the transactions of arb');
    }
  }

  static async getTransactionDetail(
    isMainnet: boolean,
    hash: string,
    isPending: boolean = false,
  ): Promise<TransactionDetail> {
    const explorerUrl = GetBlockchainTxUrl(isMainnet, hash);

    try {
      throw new Error('can not get the transaction of arb');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of arb');
    }
  }

  static async createTransaction(
    isMainnet: boolean,
    request: CreateEthereumTransaction,
  ): Promise<CreateEthereumTransaction> {
    if (request.contractAddress) {
      return await this.createERC20Transaction(isMainnet, request);
    } else {
      return await this.createETHTransaction(isMainnet, request);
    }
  }

  static async createETHTransaction(
    isMainnet: boolean,
    request: CreateEthereumTransaction,
  ): Promise<CreateEthereumTransaction> {}

  static async createERC20Transaction(
    isMainnet: boolean,
    request: CreateEthereumTransaction,
  ): Promise<CreateEthereumTransaction> {}

  static async getNonce(isMainnet: boolean, address: string): Promise<number> {
    try {
      const params = [address, 'latest'];
      const response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.GETNONCE, params);

      if (!response || response === null) {
        throw new Error('can not get nonce of arb');
      }

      return parseInt(response.result, 16);
    } catch (e) {
      console.error(e);
      throw new Error('can not get nonce of arb');
    }
  }

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {}

  static async personalSign(privateKey: string, message: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    const messageBytes = ethers.toUtf8Bytes(message);
    const signature = await wallet.signMessage(messageBytes);
    return signature;
  }
}
