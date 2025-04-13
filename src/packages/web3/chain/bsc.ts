import axios from 'axios';
import { ethers, Contract } from 'ethers';
import { BLOCKCHAINNAMES, CHAINIDS, CHAINS, COINS, INNERCHAINNAMES } from 'packages/constants/blockchain';
import { RPC } from '../rpc';
import {
  AssetBalance,
  CreateEthereumTransaction,
  EthereumTransactionDetail,
  ETHGasPrice,
  QRCodeText,
  SendTransaction,
  TransactionDetail,
  TRANSACTIONFUNCS,
  TransactionRequest,
  TRANSACTIONSTATUS,
} from '../types';
import { FindDecimalsByChainIdsAndContractAddress, FindTokenByChainIdsAndContractAddress } from 'utils/web3';
import { BLOCKSCAN } from '../block_scan';
import { GetBlockchainTxUrl } from 'utils/chain/bsc';
import { BigMul } from 'utils/number';
import Big from 'big.js';
import { ERC20Abi } from '../abi/erc20';

export class BSC {
  static chain = CHAINS.BSC;

  static axiosInstance = axios.create({
    timeout: 50000,
  });

  static getChainIds(isMainnet: boolean): CHAINIDS {
    return isMainnet ? CHAINIDS.BSC : CHAINIDS.BSC_TESTNET;
  }

  static getChainName(isMainnet: boolean): INNERCHAINNAMES {
    return isMainnet ? INNERCHAINNAMES.BSC : INNERCHAINNAMES.BSC_TESTNET;
  }

  static async getProvider(isMainnet: boolean) {
    return new ethers.JsonRpcProvider(RPC.getRpcByChainIds(this.getChainIds(isMainnet)));
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
          case INNERCHAINNAMES.BSC:
            network = 1;
            break;
          case INNERCHAINNAMES.BSC_TESTNET:
            network = 2;
            break;
          default:
            throw new Error('Invalid QR code text format');
        }

        if (matchText[4] !== undefined) {
          tokenAddress = matchText[4];
          amount = matchText[6];

          const coin = FindTokenByChainIdsAndContractAddress(
            this.getChainIds(network === 1 ? true : false),
            tokenAddress,
          );
          token = coin.name;
        } else {
          amount = matchText[7];
          token = COINS.ETH;
        }
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

  static generateQRCodeText(isMainnet: boolean, address: string, contractAddress?: string, amount?: string): string {
    let qrcodeText = `${this.getChainName(isMainnet)}:${address}?`;

    amount = amount || '0';

    if (contractAddress) {
      qrcodeText += `token=${contractAddress}&amount=${amount}`;
    } else {
      qrcodeText += `amount=${amount}`;
    }

    return qrcodeText;
  }

  static async getAssetBalance(isMainnet: boolean, address: string): Promise<AssetBalance> {
    try {
      let items = {} as AssetBalance;
      items.BNB = await this.getBNBBalance(isMainnet, address);

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
      throw new Error('can not get the asset balance of bsc');
    }
  }

  static async getBNBBalance(isMainnet: boolean, address: string): Promise<string> {
    try {
      const provider = await this.getProvider(isMainnet);
      const balance = await provider.getBalance(address);
      return ethers.formatUnits(balance, 18);
    } catch (e) {
      console.error(e);
      throw new Error('can not get the bnb balance of bsc');
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
      throw new Error('can not get the token balance of bsc');
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
      throw new Error('can not get the decimals of bsc');
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

      throw new Error('can not get tx status of bsc');
    } catch (e) {
      console.error(e);
      throw new Error('can not get tx status of bsc');
    }
  }

  static async getTransactions(
    isMainnet: boolean,
    address: string,
    symbol?: string,
  ): Promise<EthereumTransactionDetail[]> {
    try {
      symbol = symbol ? symbol : '';

      const url = `${BLOCKSCAN.baseUrl}/node/bsc/getTransactions?chain_id=${this.getChainIds(
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
      // throw new Error('can not get the transactions of bsc');
    }
  }

  static async getTransactionDetail(
    isMainnet: boolean,
    hash: string,
    isPending: boolean = false,
  ): Promise<TransactionDetail> {
    const explorerUrl = GetBlockchainTxUrl(isMainnet, hash);

    try {
      if (isPending) {
      } else {
        const params = [hash];
        const tx_response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.GETTXBYHASH, params);
        if (!tx_response || tx_response === null) {
          throw new Error('can not get tx by hash');
        }

        let amount: any;
        let to: string;
        let asset: COINS;
        const token = FindTokenByChainIdsAndContractAddress(this.getChainIds(isMainnet), tx_response.result.to);
        if (token) {
          const {
            tokenTo,
            tokenAmount,
            token: COINS,
          } = await this.getTokenTransferToAmountAndTokenByInput(isMainnet, tx_response.result.input);

          amount = tokenAmount;
          to = tokenTo;
          asset = token.symbol;
        } else {
          amount = ethers.formatUnits(tx_response.result.value, 18);
          to = tx_response.to;
          asset = COINS.ETH;
        }

        const receipt_response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.GETTXRECEIPT, params);
        if (!receipt_response || receipt_response === null) {
          throw new Error('can not get tx by hash');
        }

        let tx_status: TRANSACTIONSTATUS = TRANSACTIONSTATUS.PENDING;
        const status = parseInt(receipt_response.result.status, 16);
        if (status === 1) {
          tx_status = TRANSACTIONSTATUS.SUCCESS;
        } else if (status === 0) {
          tx_status = TRANSACTIONSTATUS.FAILED;
        }

        const gasUsed = parseInt(receipt_response.result.gasUsed, 16).toString();
        const gasPrice = parseInt(receipt_response.result.effectiveGasPrice, 16).toString();
        const fee = ethers.formatEther(BigMul(gasUsed, gasPrice).toString());

        return {
          hash: receipt_response.result.transactionHash,
          from: receipt_response.result.from,
          to: to,
          value: amount,
          asset: asset,
          fee: fee,
          status: tx_status,
          blockNumber: parseInt(receipt_response.result.blockNumber, 16),
          url: explorerUrl,
        };
      }

      throw new Error('can not get the transaction of bsc');
    } catch (e) {
      console.error(e);
      throw new Error('can not get the transaction of bsc');
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
        throw new Error('can not estimate gas of bsc');
      }

      const gasLimit = new Big(parseInt(response.result, 16));
      if (gasLimit && gasLimit.gt(0)) {
        return gasLimit.toNumber();
      }

      throw new Error('can not estimate gas of bsc');
    } catch (e) {
      console.error(e);
      throw new Error('can not estimate gas of bsc');
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
          slow: gasPrice.mul(0.95).toString(),
          normal: gasPrice.toString(),
          fast: gasPrice.mul(1.2).toString(),
        };
      }

      throw new Error('can not get gasPrice of bsc');
    } catch (e) {
      console.error(e);
      throw new Error('can not get gasPrice of bsc');
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
      return await this.createBNBTransaction(isMainnet, request);
    }
  }

  static async createBNBTransaction(
    isMainnet: boolean,
    request: CreateEthereumTransaction,
  ): Promise<CreateEthereumTransaction> {
    request.value = ethers.parseEther(request.value).toString();
    request.type = 0;
    if (request.gasPrice) {
      request.gasPrice = request.gasPrice;
    } else {
      const price = await this.getGasPrice(isMainnet);
      request.gasPrice = price.normal;
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

    return request;
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

    if (!request.gasPrice) {
      const price = await this.getGasPrice(isMainnet);
      request.gasPrice = price.normal;
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

    request.value = '0';
    request.type = 0;

    return request;
  }

  static async getNonce(isMainnet: boolean, address: string): Promise<number> {
    try {
      const params = [address, 'latest'];
      const response = await RPC.callRPC(this.getChainIds(isMainnet), TRANSACTIONFUNCS.GETNONCE, params);

      if (!response || response === null) {
        throw new Error('can not get nonce of bsc');
      }

      return parseInt(response.result, 16);
    } catch (e) {
      console.error(e);
      throw new Error('can not get nonce of bsc');
    }
  }

  static async getFee(isMainnet: boolean, request: CreateEthereumTransaction): Promise<string> {
    const tx = await this.createTransaction(isMainnet, request);
    if (tx.gasPrice) {
      return ethers.formatEther(BigMul(tx.gasPrice, tx.gasLimit.toString()));
    }

    throw new Error('can not get the gas fee of bsc');
  }

  static async sendTransaction(isMainnet: boolean, request: SendTransaction): Promise<string> {
    if (!request.privateKey || request.privateKey === '') {
      throw new Error('can not get the private key of bsc');
    }

    const cRequest: CreateEthereumTransaction = {
      chainId: this.getChainIds(isMainnet),
      from: request.from,
      to: request.to,
      privateKey: request.privateKey,
      value: request.value,
      contractAddress: request.coin.contractAddress,
      gasLimit: request.gasLimit as number,

      gasPrice: request.gasPrice as string,
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

      throw new Error('can not send the transaction of bsc');
    } catch (e) {
      console.error(e);
      throw new Error('can not send the transaction of bsc');
    }
  }

  static async personalSign(privateKey: string, message: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    const messageBytes = ethers.toUtf8Bytes(message);
    const signature = await wallet.signMessage(messageBytes);
    return signature;
  }
}
