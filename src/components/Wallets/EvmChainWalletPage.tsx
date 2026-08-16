import { useEffect, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import { Copy, Settings, UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { WeiToGwei } from '@/utils/number'
import TransactionsTab from '@/components/Tab/TransactionTab'
import { GetImgSrcByCrypto } from '@/utils/qrcode'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { EvmChainFeeType, ChainWalletType } from '@/utils/types'

type Props = {
  chainId: CHAINS
  displayName: string
  gasTrackerTitle: string
  chainSvg: StaticImageData | string
  sendHref: string
  getBlockchainAddressUrl: (isMainnet: boolean, address: string) => string
  /** Title shown above each wallet card in the holdings list. Defaults to the wallet's own `type`. */
  holdingsTitle?: string
}

const EvmChainWalletPage = ({
  chainId,
  displayName,
  gasTrackerTitle,
  chainSvg,
  sendHref,
  getBlockchainAddressUrl,
  holdingsTitle,
}: Props) => {
  const [isSettings, setIsSettings] = useState<boolean>(false)
  const [wallet, setWallet] = useState<ChainWalletType[]>([])
  const [feeObj, setFeeObj] = useState<EvmChainFeeType>()
  const [settingId, setSettingId] = useState<number>(0)
  const [paymentExpire, setPaymentExpire] = useState<number>(0)
  const [confirmBlock, setConfirmBlock] = useState<number>(0)
  const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false)
  const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0)

  const { network, userId } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
      userId: state.userId,
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

  const onClickRescanAddress = async () => {
    await getWalletAddress(walletId, network)
    setSnackSeverity('success')
    setSnackMessage('Successful rescan!')
    setSnackOpen(true)
  }

  const getWalletAddress = async (walletId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          wallet_id: walletId,
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        const ws: ChainWalletType[] = (response.data ?? []).map((item: any) => ({
          id: item.id,
          address: item.address,
          type: item.note,
          balance: item.balance,
          txUrl: item.txUrl,
          transactions: item.transactions,
        }))

        setWallet(ws)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Can not find the data on site!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const getPaymentSetting = async (userId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: userId,
          chain_id: chainId,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        setSettingId(response.data.id)
        setPaymentExpire(response.data.paymentExpire)
        setConfirmBlock(response.data.confirmBlock)
        setShowRecommendedFee(response.data.showRecommendedFee === 1)
        setCurrentUsedAddressId(
          response.data.currentUsedAddressId ? response.data.currentUsedAddressId : 0
        )
      } else {
        setSnackSeverity('error')
        setSnackMessage('The network error occurred. Please try again later.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const getFeeRate = async (network: string) => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: { chain_id: chainId, network: network === 'mainnet' ? 1 : 2 },
      })
      if (response.result) {
        setFeeObj({
          high: response.data.fast,
          average: response.data.normal,
          low: response.data.slow,
        })
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const updatePaymentSetting = async () => {
    try {
      const response: any = await axios.put(Http.update_payment_setting_by_id, {
        id: settingId,
        payment_expire: paymentExpire,
        confirm_block: confirmBlock,
        show_recommended_fee: showRecommendedFee ? 1 : 2,
        current_used_address_id: currentUsedAddressId,
      })
      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful update!')
        setSnackOpen(true)
        await init(userId, storeId, walletId, network)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const init = async (userId: number, storeId: number, walletId: number, network: string) => {
    await Promise.all([
      getWalletAddress(walletId, network),
      getPaymentSetting(userId, storeId, network),
      getFeeRate(network),
    ])
  }

  useEffect(() => {
    getWalletAddress(walletId, network)
  }, [walletId, network])

  useEffect(() => {
    getPaymentSetting(userId, storeId, network)
  }, [userId, storeId, network])

  useEffect(() => {
    getFeeRate(network)
  }, [network])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <Image src={chainSvg} alt="chain" width={44} height={44} className="h-11 w-11" />
          <h1 className="pl-2 text-xl font-semibold">{displayName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => (window.location.href = sendHref)}>Send</Button>
          <Button
            onClick={() =>
              (window.location.href = `/wallets/receive?chainId=${chainId}&storeId=${storeId}&network=${network}`)
            }
          >
            Receive
          </Button>
          <Button onClick={() => (window.location.href = '/wallets/manage/privatekey')}>
            Private Key
          </Button>
          <Button onClick={onClickRescanAddress}>Rescan address</Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettings(!isSettings)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold">{gasTrackerTitle}</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
          {(['low', 'average', 'high'] as const).map((tier) => (
            <Card key={tier}>
              <CardContent className="py-6">
                <p className="capitalize text-muted-foreground">{tier}</p>
                <p className="mt-2 text-lg font-bold">
                  {WeiToGwei(Number(feeObj?.[tier])).toFixed(3)} gwei
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12">
        {isSettings ? (
          <div className="max-w-xl">
            <h2 className="text-lg font-semibold">Payment</h2>

            <div className="mt-4 space-y-2">
              <Label>The transaction address currently used</Label>
              <Select
                value={String(currentUsedAddressId)}
                onValueChange={(v) => setCurrentUsedAddressId(Number(v))}
              >
                <SelectTrigger className="w-[320px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  {wallet.map((item, index) => (
                    <SelectItem value={String(item.id)} key={index}>
                      {item.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 space-y-2">
              <Label>
                Payment invalid if transactions fails to confirm … after invoice expiration
              </Label>
              <div className="relative w-[220px]">
                <Input
                  type="number"
                  value={paymentExpire}
                  onChange={(e) => setPaymentExpire(Number(e.target.value))}
                  className="pr-16"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  minutes
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Consider the invoice settled when the payment transaction …</Label>
              <Select
                value={String(confirmBlock)}
                onValueChange={(v) => setConfirmBlock(Number(v))}
              >
                <SelectTrigger className="w-[320px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Is unconfirmed</SelectItem>
                  <SelectItem value="1">Has at least 1 confirmation</SelectItem>
                  <SelectItem value="2">Has at least 2 confirmation</SelectItem>
                  <SelectItem value="3">Has at least 6 confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Switch checked={showRecommendedFee} onCheckedChange={setShowRecommendedFee} />
              <Label>Show recommended fee</Label>
            </div>

            <Button className="mt-6" onClick={updatePaymentSetting}>
              Save Payment Settings
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {wallet.map((item, index) => (
              <div key={index}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold">{holdingsTitle ?? item.type}</p>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.address)
                        setSnackMessage('Successfully copy')
                        setSnackSeverity('success')
                        setSnackOpen(true)
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm hover:bg-accent"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      {item.address}
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.balance &&
                        Object.entries(item.balance).map(([coin, amount], balanceIndex) => (
                          <Badge key={balanceIndex} variant="outline" className="gap-1.5 py-1.5">
                            <Image
                              src={GetImgSrcByCrypto(coin as COINS)}
                              alt="logo"
                              width={16}
                              height={16}
                              className="h-4 w-4"
                            />
                            {String(amount)} {coin}
                          </Badge>
                        ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <a href={item.txUrl} target="_blank" rel="noreferrer">
                        Check transactions
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href={getBlockchainAddressUrl(network === 'mainnet', item.address)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Check onChain
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="mt-5">
                  {item.transactions && item.transactions.length > 0 ? (
                    <TransactionsTab rows={item.transactions} />
                  ) : (
                    <p className={cn('text-muted-foreground')}>There are no transactions yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EvmChainWalletPage
