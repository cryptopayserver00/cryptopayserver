import {
  BLOCKCHAIN,
  BLOCKCHAINNAMES,
  CHAINNAMES,
  CHAINS,
  COINS,
} from '@/packages/constants/blockchain'
import { EthereumTransactionDetail, SolanaTransactionDetail } from '@/packages/web3/types'

export type RouteType = {
  path: string
  name: string
  title: string
  component: any
  enableSidebar: boolean
  enableHomeHeader: boolean
  enableHomeFooter: boolean
  needLogin: boolean
}

export type CoinBalanceType = {
  [currency: string]: string
}

export type StoreType = {
  id: number
  name: string
  currency: string
  priceSource: string
}

export type OrderType = {
  orderId: number
  amount: number
  buyerEmail: string
  crypto: string
  currency: string
  description: string
  destinationAddress: string
  metadata: string
  notificationEmail: string
  notificationUrl: string
  orderStatus: string
  paid: number
  paymentMethod: string
  createdAt: string
  updatedAt: string
  expirationAt: string
  rate: number
  lightningInvoice: string
  lightningUrl: string
  cryptoAmount: string
  fromAddress: string
  toAddress: string
  hash: string
  blockTimestamp: number
  network: number
  chainId: number
  qrCodeText: string
  qrLightningCodeText: string
  storeName: string
  storeBrandColor: string
  storeLogoUrl: string
  storeWebsite: string
  sourceType: string
}

export type PaymentRequestType = {
  userId: number
  storeId: number
  storeName: string
  storeLogoUrl: string
  storeWebsite: string
  paymentRequestId: number
  network: number
  title: string
  amount: number
  currency: string
  memo: string
  expirationAt: string
  paymentRequestStatus: string
  requesCustomerData: string
  showAllowCustomAmount: boolean
  email: string
}

export type PaymentRequestRowType = {
  orderId: number
  amount: number
  currency: string
  orderStatus: string
}

export type PullPaymentType = {
  userId: number
  storeId: number
  pullPaymentId: number
  network: number
  name: string
  storeName: string
  storeLogoUrl: string
  storeWebsite: string
  amount: number
  currency: string
  showAutoApproveClaim: boolean
  description: string
  pullPaymentStatus: string
  createdAt: string
  updatedAt: string
  expirationAt: string
}

export type PayoutRowType = {
  address: string
  chain: number
  chainName: string
  crypto: string
  cryptoAmount: string
  amount: number
  currency: string
  tx: string
  status: string
}

export type ChainWalletType = {
  id: number
  address: string
  type: string
  balance: any
  txUrl: string
  transactions: any[]
}

export type SolanaWalletType = {
  id: number
  address: string
  type: string
  balance: any
  txUrl: string
  transactions: SolanaTransactionDetail[]
}

export type EvmWalletType = {
  id: number
  address: string
  type: string
  balance: any
  txUrl: string
  transactions: EthereumTransactionDetail[]
}

export type TronWalletType = {
  id: number
  address: string
  type: string
  balance: any
  txUrl: string
  transactions: EthereumTransactionDetail[]
  resource: {
    bandwidth: number
    energy: number
  }
}

export type TronResourceType = {
  bandwidth: number
  energy: number
}

export type XrpWalletType = {
  id: number
  address: string
  type: string
  balance: any
  status: number
  txUrl: string
  transactions: EthereumTransactionDetail[]
  trustLine: XrpTrustLineType[]
}

export type XrpTrustLineType = {
  account: string
  balance: string
  currency: string
  limit: string
  limitPeer: string
  noRipple: boolean
  noRipplePeer: boolean
  qualityIn: number
  qualityOut: number
}

export type XrpFeeType = {
  baseFee: number
  medianFee: number
  minimumFee: number
  openLedgerFee: number
}

export type EvmChainFeeType = {
  high: number
  average: number
  low: number
}

export type EvmMaxPriortyFeeType = {
  fast: number
  normal: number
  slow: number
}

export type UtxoFeeType = {
  fastest: number
  halfHour: number
  hour: number
  economy: number
  minimum: number
}

export type AddressBookRowType = {
  id: number
  chainId: number
  isMainnet: boolean
  name: string
  address: string
}

export type AssetCoinType = {
  coin: string
  price: string
  number: number
  unit: string
  balance: string
  marketCap: string
  twentyFourHVol: string
  twentyFourHChange: string
}

export type AssetWalletType = {
  walletId: number
  walletName: string
  address: string
  chainId: CHAINS
  coins: AssetCoinType[]
  totalBalance: number
  currency: string
  currencySymbol: string
}

export type LightningRowType = {
  id: number
  balance: string
  text: string
  kind: string
  server: string
  accessToken: string
  refreshToken: string
  enabled: boolean
  showAmountSatoshis: boolean
  showHopHint: boolean
  showUnifyUrlAndQrcode: boolean
  showLnurl: boolean
  showLnurlClassicMode: boolean
  showAllowPayeePassComment: boolean
}

export type PrivateKeyRowType = {
  chainId: number
  isMainnet: boolean
  address: string
  privateKey: string
  view: boolean
}

export type BlockchainCoinType = {
  chainId: CHAINS
  icon: any
  name: COINS
  isMainCoin: boolean
  address: string
  enabled: boolean
  scan: boolean
}

export type BlockchainType = {
  icon: any
  name: CHAINNAMES
  desc: string
  coins: BlockchainCoinType[]
}
