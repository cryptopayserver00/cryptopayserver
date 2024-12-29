import { BigNumberish } from 'ethers';
import { CHAINIDS, CHAINS, COIN, COINS } from 'packages/constants/blockchain';

export type WalletAccountType = {
  isGenerate: boolean;
  mnemonic: string;
  account: Array<ChainAccountType>;
};

export type ChainAccountType = {
  chain: CHAINS;
  address: string;
  privateKey?: string;
  note?: string;
  isMainnet: boolean;
};

export enum BTCTYPE {
  NATIVESEGWIT = 'NATIVESEGWIT',
  NESTEDSEGWIT = 'NESTEDSEGWIT',
  TAPROOT = 'TAPROOT',
  LEGACY = 'LEGACY',
}

export type UnspentTransactionOutput = {
  txid: string;
  vout: number;
  value: number;
};

export type BTCFeeRate = {
  fastest: number;
  halfHour: number;
  hour: number;
  economy: number;
  minimum: number;
};

export type ETHGasPrice = {
  fast: string;
  normal: string;
  slow: string;
};

export type ETHMaxPriorityFeePerGas = {
  fast: string;
  normal: string;
  slow: string;
};

export type TransactionDetail = {
  hash: string;
  from?: string;
  to?: string;
  value?: string;
  asset: string;
  fee: string;
  type?: TRANSACTIONTYPE;
  status: TRANSACTIONSTATUS;
  blockTimestamp?: number;
  blockNumber?: number;
  slot?: number;
  url: string;
};

export type EthereumTransactionDetail = {
  chainId: number;
  address: string;
  hash: string;
  amount: string;
  asset: string;
  contractAddress: string;
  type: string;
  category: string;
  status: TRANSACTIONSTATUS;
  blockTimestamp: number;
};

export type SolanaTransactionDetail = {
  from?: string;
  to?: string;
  value?: string;
  chainId: number;
  address: string;
  hash: string;
  asset: string;
  contractAddress: string;
  type: 'Send' | 'Received' | 'None';
  status: TRANSACTIONSTATUS;
  blockTimestamp: number;
};

export enum TRANSACTIONTYPE {
  RECEIVED = 'RECEIVED',
  SEND = 'SEND',
  SWAP = 'SWAP',
}

export enum TRANSACTIONSTATUS {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

export type AssetBalance = {
  [key in COINS]: string;
};

export enum TRANSACTIONFUNCS {
  GETTXBYHASH = 'eth_getTransactionByHash',
  GETTXRECEIPT = 'eth_getTransactionReceipt',
  GETGASPRICE = 'eth_gasPrice',
  EstimateGas = 'eth_estimateGas',
  MaxPriorityFeePerGas = 'eth_maxPriorityFeePerGas',
  GETNONCE = 'eth_getTransactionCount',
}

export type ERC20TransactionDetail = {
  from: string;
  to: string;
  hash: string;
  asset: COINS;
  value: string;
};

export type TransactionRequest = {
  to?: string;
  from?: string;
  nonce?: number;

  gasLimit?: number;
  gasPrice?: number;

  // data?: BytesLike,
  value?: BigNumberish;
  // chainId?: number

  // type?: number;
  // accessList?: AccessListish;

  // maxPriorityFeePerGas?: BigNumberish;
  // maxFeePerGas?: BigNumberish;

  // customData?: Record<string, any>;
  // ccipReadEnabled?: boolean;
};

export type SendTransaction = {
  coin: COIN;
  from: string;
  to: string;
  value: string;
  privateKey: string;
  gasPrice?: string;
  gasLimit?: number;
  maxPriorityFeePerGas?: string;
  feeRate?: number;
  btcType?: BTCTYPE;
  nonce?: number;
};

export type CreateEthereumTransaction = {
  privateKey?: string;
  from: string;
  to: string;
  value: string;
  contractAddress?: string;
  type?: number;
  chainId: CHAINIDS;
  data?: string;
  nonce?: number;
  gasPrice?: string;
  maxFeePerGas?: string;
  gasLimit: number;
  maxPriorityFeePerGas?: string;
};

export type CreateSolanaTransaction = {
  privateKey?: string;
  from: string;
  to: string;
  value: string;
  contractAddress?: string;
};

export type CreateTronTransaction = {
  privateKey?: string;
  from: string;
  to: string;
  value: string;
  contractAddress?: string;
};

export type CreateTonTransaction = {
  privateKey?: string;
  from: string;
  to: string;
  value: string;
  contractAddress?: string;
};
