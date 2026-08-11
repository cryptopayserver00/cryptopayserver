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
import TransactionsTab from '@/components/Tab/TransactionTab'
import { GetImgSrcByCrypto } from '@/utils/qrcode'

type walletType = {
  id: number
  address: string
  type: string
  balance: any
  txUrl: string
  transactions: any[]
}

type feeType = {
  fastest: number
  halfHour: number
  hour: number
  economy: number
  minimum: number
}

const FEE_TIERS: { key: keyof feeType; label: string }[] = [
  { key: 'minimum', label: 'Minimum' },
  { key: 'economy', label: 'Economy' },
  { key: 'hour', label: 'Hour' },
  { key: 'halfHour', label: 'HalfHour' },
  { key: 'fastest', label: 'Fastest' },
]

type Props = {
  chainId: CHAINS
  displayName: string
  chainSvg: StaticImageData | string
  sendHref: string
  rescanRedirectHref?: string
  showPrivateKeyButton?: boolean
  getBlockchainAddressUrl: (isMainnet: boolean, address: string) => string
}

const UtxoChainWalletPage = ({
  chainId,
  displayName,
  chainSvg,
  sendHref,
  showPrivateKeyButton = false,
  getBlockchainAddressUrl,
}: Props) => {
  const [isSettings, setIsSettings] = useState<boolean>(false)
  const { getWalletId } = useWalletPresistStore((state) => state)
  const { getNetwork, getUserId } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const [wallet, setWallet] = useState<walletType[]>([])
  const [feeObj, setFeeObj] = useState<feeType>()

  const [settingId, setSettingId] = useState<number>(0)
  const [paymentExpire, setPaymentExpire] = useState<number>(0)
  const [confirmBlock, setConfirmBlock] = useState<number>(0)
  const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false)
  const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0)

  const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state)

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
        await init()
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const getWalletAddress = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          wallet_id: getWalletId(),
          chain_id: chainId,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let ws: walletType[] = []
          response.data.forEach((item: any) => {
            ws.push({
              id: item.id,
              address: item.address,
              type: item.note,
              balance: item.balance,
              txUrl: item.tx_url,
              transactions: item.transactions,
            })
          })
          setWallet(ws)
        } else {
          setWallet([])
        }
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

  const getPaymentSetting = async () => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: getUserId(),
          chain_id: chainId,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        setSettingId(response.data.id)
        setPaymentExpire(response.data.payment_expire)
        setConfirmBlock(response.data.confirm_block)
        setShowRecommendedFee(response.data.show_recommended_fee === 1)
        setCurrentUsedAddressId(
          response.data.current_used_address_id ? response.data.current_used_address_id : 0
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

  const getFeeRate = async () => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: { chain_id: chainId, network: getNetwork() === 'mainnet' ? 1 : 2 },
      })
      if (response.result) {
        setFeeObj({
          fastest: response.data.fastest,
          halfHour: response.data.halfHour,
          hour: response.data.hour,
          economy: response.data.economy,
          minimum: response.data.minimum,
        })
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickRescanAddress = async () => {
    await getWalletAddress()
    setSnackSeverity('success')
    setSnackMessage('Successful rescan!')
    setSnackOpen(true)
  }

  const init = async () => {
    await getWalletAddress()
    await getPaymentSetting()
    await getFeeRate()
  }

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <Image src={chainSvg} alt="" width={44} height={44} />
          <h1 className="pl-2 text-xl font-semibold">{displayName}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => (window.location.href = sendHref)}>Send</Button>
          <Button
            onClick={() =>
              (window.location.href = `/wallets/receive?chainId=${chainId}&storeId=${getStoreId()}&network=${getNetwork()}`)
            }
          >
            Receive
          </Button>
          {showPrivateKeyButton && (
            <Button onClick={() => (window.location.href = '/wallets/manage/privatekey')}>
              Private Key
            </Button>
          )}
          <Button onClick={onClickRescanAddress}>Rescan address</Button>
          <Button variant="ghost" size="icon" onClick={() => setIsSettings(!isSettings)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold">Transaction Fee</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 text-center sm:grid-cols-5">
          {FEE_TIERS.map(({ key, label }) => (
            <Card key={key}>
              <CardContent className="py-6">
                <p className="text-muted-foreground">{label}</p>
                <p className="mt-2 text-lg font-bold">{feeObj?.[key]} sat/vB</p>
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
                    <p className="text-lg font-bold">{item.type}</p>
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
                        href={getBlockchainAddressUrl(getNetwork() === 'mainnet', item.address)}
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
                    <p className="text-muted-foreground">There are no transactions yet.</p>
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

export default UtxoChainWalletPage
