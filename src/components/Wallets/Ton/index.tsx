import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Copy, Settings } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import { EthereumTransactionDetail } from '@/packages/web3/types'
import { GetBlockchainAddressUrl } from '@/utils/chain/ton'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import TonSVG from '@/assets/chain/ton.svg'
import TransactionsTab from '@/components/Tab/TransactionTab'
import { GetImgSrcByCrypto } from '@/utils/qrcode'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useShallow } from 'zustand/react/shallow'
import { EvmWalletType } from '@/utils/types'

const Ton = () => {
  const [isSettings, setIsSettings] = useState<boolean>(false)
  const [wallet, setWallet] = useState<EvmWalletType[]>([])

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

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const onClickRescanAddress = async () => {
    await getTonWalletAddress(walletId, network)
    showSnack('success', 'Successful rescan!')
  }

  const getTonWalletAddress = async (walletId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          wallet_id: walletId,
          chain_id: CHAINS.TON,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let ws: EvmWalletType[] = []
          response.data.forEach(async (item: any) => {
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
        showSnack('error', 'Can not find the data on site!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getTonPaymentSetting = async (userId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: userId,
          chain_id: CHAINS.TON,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        setSettingId(response.data.id)
        setPaymentExpire(response.data.payment_expire)
        setConfirmBlock(response.data.confirm_block)
        setShowRecommendedFee(response.data.show_recommended_fee === 1 ? true : false)
        setCurrentUsedAddressId(
          response.data.current_used_address_id ? response.data.current_used_address_id : 0
        )
      } else {
        showSnack('error', 'The network error occurred. Please try again later.')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
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
        showSnack('success', 'Successful update!')
        await init(walletId, storeId, network)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const init = async (walletId: number, storeId: number, network: string) => {
    await Promise.all([
      await getTonWalletAddress(walletId, network),
      await getTonPaymentSetting(userId, storeId, network),
    ])
  }

  useEffect(() => {
    getTonWalletAddress(walletId, network)
  }, [walletId, network])

  useEffect(() => {
    getTonPaymentSetting(userId, storeId, network)
  }, [userId, storeId, network])

  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pt-10">
          <div className="flex items-center gap-2">
            <Image src={TonSVG} alt="ton" width={50} height={50} className="h-12 w-12" />
            <h2 className="text-lg font-semibold">Ton Wallet</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                window.location.href = '/wallets/ton/send'
              }}
            >
              Send
            </Button>
            <Button
              onClick={() => {
                window.location.href = `/wallets/receive?chainId=${
                  CHAINS.TON
                }&storeId=${storeId}&network=${network}`
              }}
            >
              Receive
            </Button>
            <Button
              onClick={() => {
                window.location.href = '/wallets/manage/privatekey'
              }}
            >
              Private Key
            </Button>
            <Button onClick={onClickRescanAddress}>Rescan address</Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSettings(!isSettings)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-10">
          {isSettings ? (
            <div className="max-w-md">
              <h3 className="text-lg font-semibold">Payment</h3>

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
                    className="pr-20"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
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

              <div className="mt-4 flex items-center gap-3">
                <Switch checked={showRecommendedFee} onCheckedChange={setShowRecommendedFee} />
                <Label className="cursor-pointer" onClick={() => setShowRecommendedFee((v) => !v)}>
                  Show recommended fee
                </Label>
              </div>

              <Button className="mt-6" onClick={updatePaymentSetting}>
                Save Payment Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {wallet &&
                wallet.length > 0 &&
                wallet.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">Ton</p>

                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(item.address)
                            showSnack('success', 'Successfully copy')
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {item.address}
                        </button>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.balance &&
                            Object.entries(item.balance).map(([coin, amount], balanceIndex) => (
                              <Badge
                                key={balanceIndex}
                                variant="outline"
                                className="gap-1.5 px-3 py-1 font-normal"
                              >
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
                            href={GetBlockchainAddressUrl(network === 'mainnet', item.address)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Check onChain
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6">
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
    </div>
  )
}

export default Ton
