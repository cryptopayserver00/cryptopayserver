import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ArrowDown, ArrowUp, Copy, ExternalLink, Flower2, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain'
import { FindChainNamesByChains } from '@/utils/web3'
import { COINPAIR, COINTOPAIR } from '@/packages/constants'
import { FormatNumberToEnglish, OmitMiddleString } from '@/utils/strings'
import TradingViewWidget from '@/components/Widget/TradingViewWidget'
import { GetImgSrcByChain } from '@/utils/qrcode'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { AssetWalletType } from '@/utils/types'

const AssetsToken = () => {
  const router = useRouter()
  const { chain, coin } = router.query

  const [chainId, setChainId] = useState<CHAINS>()
  const [useCoin, setUseCoin] = useState<COINS>()
  const [assetWallet, setAssetWallet] = useState<AssetWalletType>()
  const [blockchain, setBlockchain] = useState<BLOCKCHAIN>()
  const [coinPair, setCoinPair] = useState<(typeof COINPAIR)[keyof typeof COINPAIR]>(
    COINPAIR.BTCUSDT
  )

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
    walletId: number,
    storeId: number,
    network: string,
    chain: CHAINS,
    coin: COINS
  ) => {
    try {
      setUseCoin(coin)
      setChainId(chain)
      setCoinPair(COINTOPAIR[coin as keyof typeof COINTOPAIR])

      const blockchain = BLOCKCHAINNAMES.find(
        (item: BLOCKCHAIN) =>
          (network === 'mainnet' ? item.isMainnet : !item.isMainnet) &&
          item.name === FindChainNamesByChains(chain)
      )

      setBlockchain(blockchain)

      const response: any = await axios.get(Http.find_wallet_balance_by_network, {
        params: {
          wallet_id: walletId,
          store_id: storeId,
          chain_id: chain,
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
    if (!router.isReady) {
      return
    }

    if (chain && coin) {
      getAssetWallet(walletId, storeId, network, Number(chain), coin as COINS)
    } else {
      getAssetWallet(walletId, storeId, network, CHAINS.BITCOIN, COINS.BTC)
    }
  }, [router.isReady, walletId, storeId, network, chain, coin])

  const activeCoin = assetWallet?.coins.find((item) => item.coin === useCoin)
  const change = Number(activeCoin?.twentyFourHChange)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center">
        {assetWallet?.chainId && (
          <Image
            src={GetImgSrcByChain(assetWallet?.chainId)}
            alt="icon"
            width={40}
            height={40}
            className="h-10 w-10"
          />
        )}
        {assetWallet?.chainId && (
          <span className="pl-2 text-lg font-medium">
            {FindChainNamesByChains(assetWallet?.chainId)}
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={async () => {}}>
            <ArrowUp className="mr-2 h-4 w-4" /> Send
          </Button>
          <Button onClick={async () => {}}>
            <ArrowDown className="mr-2 h-4 w-4" /> Receive
          </Button>
          <Button onClick={async () => {}}>
            <Repeat className="mr-2 h-4 w-4" /> Swap
          </Button>
          <Button onClick={async () => {}}>
            <Flower2 className="mr-2 h-4 w-4" /> Stack
          </Button>
        </div>

        <Button variant="outline" asChild>
          <a href={String(blockchain?.explorerUrl)} target="_blank" rel="noreferrer">
            View on block explorer <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-baseline justify-between pb-4">
            <span className="text-3xl font-bold">
              {assetWallet?.currencySymbol}
              {activeCoin?.price}
            </span>
            {blockchain && (
              <Image
                src={blockchain?.coins.find((item) => item.name === useCoin)?.icon}
                width={40}
                height={40}
                alt="icon"
                className="h-10 w-10"
              />
            )}
          </div>
          <div className="h-[400px]">
            <TradingViewWidget coinPair={coinPair} />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Day change (24hr)</p>
              <p
                className={cn('mt-1 font-bold', change >= 0 ? 'text-emerald-500' : 'text-red-500')}
              >
                {parseFloat(String(activeCoin?.twentyFourHChange)).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market cap</p>
              <p className="mt-1 font-bold">
                {FormatNumberToEnglish(Number(activeCoin?.marketCap))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total volume (24hr)</p>
              <p className="mt-1 font-bold">
                {FormatNumberToEnglish(Number(activeCoin?.twentyFourHVol))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-lg font-bold">Holdings</h3>
            <span className="font-bold">
              {assetWallet?.currencySymbol}
              {assetWallet?.totalBalance.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {blockchain &&
              blockchain.coins.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUseCoin(item.name)
                    setCoinPair(COINTOPAIR[item.name as keyof typeof COINTOPAIR])
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent',
                    item.name === useCoin && 'bg-accent'
                  )}
                >
                  <div className="flex items-center">
                    {item.icon && <Image src={item.icon} width={40} height={40} alt="icon" />}
                    <span className="px-2 font-mono text-sm">
                      {OmitMiddleString(String(assetWallet?.address))}
                    </span>
                    <span
                      role="button"
                      onClick={async (e) => {
                        e.stopPropagation()
                      }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {assetWallet?.currencySymbol}
                      {parseFloat(
                        String(
                          assetWallet?.coins.find((findItem) => findItem.coin === item.name)
                            ?.balance
                        )
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assetWallet?.coins
                        .find((fintItem) => fintItem.coin === item.name)
                        ?.number.toFixed(item.displayDecimals)}{' '}
                      {item.name}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssetsToken
