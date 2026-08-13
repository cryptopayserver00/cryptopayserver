import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Copy,
  User,
  Globe,
  Compass,
  ExternalLink,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpDown,
  Sprout,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Check,
} from 'lucide-react'

// shadcn/ui 组件导入
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 外部状态与工具函数
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import {
  BLOCKCHAIN,
  BLOCKCHAINNAMES,
  CHAINNAMES,
  CHAINS,
  COINS,
} from '@/packages/constants/blockchain'
import { FindChainIdsByChainNames, GetBlockchainAddressUrlByChainIds } from '@/utils/web3'
import { CURRENCY_SYMBOLS, WALLET_ITEM_TYPE } from '@/packages/constants'
import { OmitMiddleString } from '@/utils/strings'
import { GetImgSrcByChain } from '@/utils/qrcode'
import BitcoinSVG from '@/assets/chain/bitcoin.svg'
import { useShallow } from 'zustand/react/shallow'

type CoinType = {
  coin: string
  price: string
  number: number
  unit: string
  balance: string
  marketCap: string
  twentyFourHVol: string
  twentyFourHChange: string
}

type WalletType = {
  walletId: number
  walletName: string
  address: string
  chainId: CHAINS
  coins: CoinType[]
  totalBalance: number
  currency: string
  currencySymbol: string
}

export default function MyAssets() {
  const [assetWallet, setAssetWallet] = useState<WalletType>()
  const [chainName, setChainName] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN)
  const [alignment, setAlignment] = useState<string>(WALLET_ITEM_TYPE.TOKENS)
  const [blockchain, setBlockchain] = useState<BLOCKCHAIN>()
  const [selectCoin, setSelectCoin] = useState<COINS>()

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const { walletId } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
    }))
  )

  const { storeId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const getAssetWallet = async (
    net: CHAINNAMES,
    walletId: number,
    storeId: number,
    network: string
  ) => {
    try {
      const response: any = await axios.get(Http.find_wallet_balance_by_network, {
        params: {
          wallet_id: walletId,
          store_id: storeId,
          chain_id: FindChainIdsByChainNames(net),
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setAssetWallet(response.data)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    getAssetWallet(chainName, walletId, storeId, network)

    const targetBlockchain = BLOCKCHAINNAMES.find(
      (item: BLOCKCHAIN) =>
        (network === 'mainnet' ? item.isMainnet : !item.isMainnet) && item.name === chainName
    )

    setBlockchain(targetBlockchain)
    setSelectCoin(targetBlockchain?.coins[0]?.name)
  }, [chainName, walletId, storeId, network])

  const handleCopyAddress = async () => {
    if (!assetWallet?.address) return
    await navigator.clipboard.writeText(String(assetWallet.address))
    setSnackMessage('Successfully copied')
    setSnackSeverity('success')
    setSnackOpen(true)
  }

  const selectedCoinData = assetWallet?.coins.find((c) => c.coin === selectCoin)
  const selectedCoinMeta = blockchain?.coins.find((c) => c.name === selectCoin)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* 头部标题与资产概览 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">My Assets</h2>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {assetWallet?.currencySymbol}
            {assetWallet?.totalBalance ? assetWallet.totalBalance.toFixed(2) : '0.00'}
          </h1>
        </div>

        {/* 顶部操作区：复制地址、网络选择、钱包名称 */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAddress}
            className="flex items-center gap-2 rounded-full border-border/60 bg-background hover:bg-accent"
          >
            <span>{OmitMiddleString(String(assetWallet?.address || ''))}</span>
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>

          <Select value={chainName} onValueChange={(val) => setChainName(val as CHAINNAMES)}>
            <SelectTrigger className="w-[160px] rounded-full border-border/60">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent>
              {CHAINNAMES &&
                Object.entries(CHAINNAMES).map(([key, val]) => (
                  <SelectItem value={val} key={key}>
                    <div className="flex items-center gap-2">
                      <Image
                        src={GetImgSrcByChain(FindChainIdsByChainNames(val))}
                        alt={val}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="font-medium">{val}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button variant="secondary" size="sm" className="flex items-center gap-2 rounded-full">
            <User className="h-4 w-4" />
            <span>{assetWallet?.walletName || 'Wallet'}</span>
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* 主体二栏布局 */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* 左侧：Tab 导航与各类列表 (占 5 列) */}
        <div className="space-y-4 lg:col-span-5">
          <Tabs value={alignment} onValueChange={setAlignment} className="w-full">
            <TabsList className="grid w-full grid-cols-5 rounded-xl bg-muted p-1">
              {Object.entries(WALLET_ITEM_TYPE).map(([key, val]) => (
                <TabsTrigger key={key} value={val} className="capitalize text-xs sm:text-sm">
                  {val}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* 1. TOKENS 列表 */}
          {alignment === WALLET_ITEM_TYPE.TOKENS && (
            <div className="space-y-2">
              {blockchain?.coins.map((coin, idx) => {
                const coinWallet = assetWallet?.coins.find((f) => f.coin === coin.name)
                const changeNum = Number(coinWallet?.twentyFourHChange || 0)
                const isSelected = selectCoin === coin.name

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectCoin(coin.name)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl p-3.5 transition-all duration-200 border ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5 shadow-sm'
                        : 'border-transparent hover:border-border hover:bg-accent/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {coin.icon && (
                        <Image
                          src={coin.icon}
                          width={36}
                          height={36}
                          alt={coin.name}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold leading-none">{coin.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {coinWallet ? coinWallet.number.toFixed(coin.displayDecimals) : '0'}{' '}
                          {coin.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {assetWallet?.currencySymbol}
                        {parseFloat(String(coinWallet?.balance || 0)).toFixed(2)}
                      </p>
                      <div
                        className={`flex items-center justify-end text-xs font-medium ${
                          changeNum >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {changeNum >= 0 ? (
                          <TrendingUp className="mr-0.5 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-0.5 h-3 w-3" />
                        )}
                        {parseFloat(String(changeNum)).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 2. NFTS 列表 */}
          {alignment === WALLET_ITEM_TYPE.NFTS && (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <Card key={item} className="overflow-hidden transition-all hover:shadow-md">
                  <div className="relative aspect-square w-full bg-muted">
                    <Image src="/chain/base.svg" alt="NFT" fill className="object-cover" />
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">The shooting</p>
                    <p className="font-bold text-sm truncate">The shooting/Rabbit #{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 3. DEFI 列表 */}
          {alignment === WALLET_ITEM_TYPE.DEFI && (
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border p-4 bg-card">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-bold">Ethereum Position</p>
                    <p className="text-xs text-muted-foreground">0.00 ETH</p>
                  </div>
                </div>
                <p className="font-semibold">{CURRENCY_SYMBOLS['USD']}0.00</p>
              </div>
            </div>
          )}

          {/* 4. TRANSACTIONS 交易历史 */}
          {alignment === WALLET_ITEM_TYPE.TRANSACTIONS && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                April 23, 2025
              </p>
              {[1, 2].map((tx) => (
                <Card key={tx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image src={BitcoinSVG} alt="icon" width={32} height={32} />
                      <div>
                        <p className="text-sm font-medium">Native Transfer</p>
                        <p className="text-xs text-muted-foreground">
                          {OmitMiddleString(String(assetWallet?.address || ''))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-rose-500">-0.001 ETH</p>
                    </div>
                  </div>

                  <div className="flex justify-center my-1">
                    <div className="rounded-full bg-muted p-1">
                      <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image src={BitcoinSVG} alt="icon" width={32} height={32} />
                      <div>
                        <p className="text-sm font-medium">To Address</p>
                        <p className="text-xs text-muted-foreground">
                          {OmitMiddleString(String(assetWallet?.address || ''))}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold">0.001 ETH</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 5. SPENDING CAPS 授权管理 */}
          {alignment === WALLET_ITEM_TYPE.SPENDINGCAPS && (
            <Card className="p-5">
              <h3 className="font-semibold text-base mb-2">Spending Caps</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A spending cap is a set permission granted to a specific smart contract, allowing it
                to spend or utilize a defined amount of tokens from your wallet. You can revoke
                these permissions at any time.
              </p>
            </Card>
          )}
        </div>

        {/* 右侧：详细视图展示 (占 7 列) */}
        <div className="lg:col-span-7 lg:border-l lg:pl-8">
          {alignment === WALLET_ITEM_TYPE.TOKENS && (
            <div className="space-y-6">
              {/* 代币头部简报 */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  {selectedCoinMeta?.icon && (
                    <Image
                      src={selectedCoinMeta.icon}
                      alt="Coin Icon"
                      width={64}
                      height={64}
                      className="rounded-full shadow-sm"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{selectedCoinMeta?.name}</h3>
                      {selectedCoinMeta?.isMainCoin && <Badge>Main Coin</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Current Price</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xl font-semibold">
                        {assetWallet?.currencySymbol}
                        {selectedCoinData?.price || '0.00'}
                      </span>
                      <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${
                          Number(selectedCoinData?.twentyFourHChange || 0) >= 0
                            ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'
                            : 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                        }`}
                      >
                        {Number(selectedCoinData?.twentyFourHChange || 0) >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {parseFloat(String(selectedCoinData?.twentyFourHChange || 0)).toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 快捷跳转链接 */}
                <div className="flex items-center gap-1">
                  {blockchain?.websiteUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={blockchain.websiteUrl} target="_blank" rel="noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {blockchain?.explorerUrl && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={blockchain.explorerUrl} target="_blank" rel="noreferrer">
                        <Compass className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {selectedCoinMeta?.contractAddress && (
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={GetBlockchainAddressUrlByChainIds(
                          Boolean(blockchain?.isMainnet),
                          assetWallet?.chainId as CHAINS,
                          String(selectedCoinMeta.contractAddress)
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={`/wallets/assets/token?chain=${assetWallet?.chainId}&coin=${selectCoin}`}
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* 持仓余额 Card */}
              <Card className="p-5 bg-gradient-to-br from-card to-accent/20">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Your Balance
                </p>
                <p className="mt-2 text-3xl font-extrabold">
                  {assetWallet?.currencySymbol}
                  {parseFloat(String(selectedCoinData?.balance || 0)).toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedCoinData?.number.toFixed(selectedCoinMeta?.displayDecimals || 4)}{' '}
                  {selectCoin}
                </p>
              </Card>

              {/* 核心功能按钮组 */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                <Button
                  className="flex flex-col items-center justify-center h-20 gap-1 rounded-xl"
                  onClick={() => {}}
                >
                  <ArrowUpRight className="h-5 w-5" />
                  <span className="text-xs">Send</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20 gap-1 rounded-xl"
                  onClick={() => {}}
                >
                  <ArrowDownLeft className="h-5 w-5" />
                  <span className="text-xs">Receive</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20 gap-1 rounded-xl"
                  onClick={() => {}}
                >
                  <ArrowUpDown className="h-5 w-5" />
                  <span className="text-xs">Swap</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20 gap-1 rounded-xl"
                  onClick={() => {}}
                >
                  <Sprout className="h-5 w-5" />
                  <span className="text-xs">Stake</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20 gap-1 rounded-xl"
                  onClick={() => {}}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Buy</span>
                </Button>
                <Button
                  className="flex flex-col items-center justify-center h-20 gap-1 rounded-xl"
                  onClick={() => {}}
                >
                  <Minus className="h-5 w-5" />
                  <span className="text-xs">Sell</span>
                </Button>
              </div>
            </div>
          )}

          {alignment === WALLET_ITEM_TYPE.NFTS && (
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="relative aspect-square w-full max-w-[260px] overflow-hidden rounded-2xl bg-muted border">
                <Image src="/chain/base.svg" alt="NFT preview" fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Monster Suit</p>
                  <h3 className="text-xl font-bold">Monster Suit #4951</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Owner (You)</p>
                    <p className="text-sm font-semibold">
                      {OmitMiddleString(String(assetWallet?.address || ''))}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Floor Price</p>
                    <p className="text-sm font-semibold">-</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">About</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Rue NFTs is a community driven and collaborative project from Crystal Roots LLC
                    and USGMEN.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Token Details</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Token ID</span>
                      <span className="font-medium">884</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Blockchain</span>
                      <span className="font-medium">Base</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Standard</span>
                      <span className="font-medium">ERC-721</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {alignment === WALLET_ITEM_TYPE.DEFI && (
            <div className="flex items-center justify-center h-48 border border-dashed rounded-xl">
              <p className="text-sm text-muted-foreground">No active DeFi positions found</p>
            </div>
          )}

          {alignment === WALLET_ITEM_TYPE.TRANSACTIONS && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Send Transaction</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Apr 23, 2025 at 05:12 pm</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border p-4 bg-card">
                <div>
                  <p className="text-xs text-muted-foreground">From (You)</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Image src={BitcoinSVG} alt="btc" width={20} height={20} />
                    <span className="text-sm font-medium">
                      {OmitMiddleString(String(assetWallet?.address || ''))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">To</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Image src={BitcoinSVG} alt="btc" width={20} height={20} />
                    <span className="text-sm font-medium">
                      {OmitMiddleString(String(assetWallet?.address || ''))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyAddress}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Transaction Details</h4>
                <div className="rounded-xl border p-4 space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Blockchain</span>
                    <span className="font-medium">Base</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Status</span>
                    <span className="flex items-center gap-1 text-emerald-500 font-medium">
                      <Check className="h-4 w-4" /> Success
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Block Number</span>
                    <span className="font-mono text-xs">29305093</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
