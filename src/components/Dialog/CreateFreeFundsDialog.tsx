import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Gift, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CHAINS, COIN, COINS, STABLE_COINS } from '@/packages/constants/blockchain'
import { COINGECKO_IDS } from '@/packages/constants'
import { OmitMiddleString } from '@/utils/strings'
import { FindChainNamesByChains } from '@/utils/web3'
import { FormatCryptoAmount } from '@/utils/number'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

/** Must stay aligned with node freecoin.max-usd */
const FREECOIN_MAX_USD = 100

const STABLE_COIN_SET = new Set<string>([...STABLE_COINS, COINS.DAI])

interface AddressOption {
  id: string
  label: string
  address: string
  kind: 'current' | 'wallet' | 'book'
}

interface DialogType {
  network: number
  selectCoinItem: COIN
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  onClickCoin: (item: COIN, address: string, amount: number) => Promise<void>
}

export default function CreateFreeFundsDialog(props: DialogType) {
  const [addressOptions, setAddressOptions] = useState<AddressOption[]>([])
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [maxAmount, setMaxAmount] = useState<number | null>(null)
  const [isClaiming, setIsClaiming] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)

  const { storeId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { walletId } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
    }))
  )

  const handleClose = () => {
    setAddress('')
    setAmount(0)
    setMaxAmount(null)
    setAddressOptions([])
    props.setOpenDialog(false)
  }

  const loadMaxAmount = useCallback(async (coin: COIN) => {
    if (!coin?.name) {
      setMaxAmount(null)
      return
    }

    if (STABLE_COIN_SET.has(coin.name)) {
      setMaxAmount(FREECOIN_MAX_USD)
      return
    }

    const geckoId = COINGECKO_IDS[coin.name as COINS]
    if (!geckoId) {
      setMaxAmount(null)
      return
    }

    try {
      const rateResp: any = await axios.get(Http.find_crypto_price, {
        params: { ids: geckoId, currency: 'usd' },
      })
      const usd = Number(rateResp?.data?.[geckoId]?.usd)
      if (rateResp?.result && usd > 0) {
        setMaxAmount(Number(FormatCryptoAmount(FREECOIN_MAX_USD / usd, coin.displayDecimals || 8)))
        return
      }
    } catch (e) {
      console.warn('FreeCoin max price unavailable', e)
    }
    setMaxAmount(null)
  }, [])

  const loadAddresses = useCallback(
    async (chainId: number) => {
      if (!chainId) return

      setLoadingAddresses(true)
      const options: AddressOption[] = []
      const seen = new Set<string>()

      const pushUnique = (opt: AddressOption) => {
        const key = opt.address.trim().toLowerCase()
        if (!key || seen.has(key)) return
        seen.add(key)
        options.push(opt)
      }

      try {
        // Current payment-setting address for this chain (preferred default)
        if (storeId) {
          try {
            const currentResp: any = await axios.get(Http.find_asset_balance, {
              params: {
                store_id: storeId,
                chain_id: chainId,
                network: props.network,
              },
            })
            if (currentResp.result && currentResp.data?.address) {
              pushUnique({
                id: 'current',
                label: 'Current address',
                address: String(currentResp.data.address),
                kind: 'current',
              })
              setAddress(String(currentResp.data.address))
            }
          } catch (e) {
            console.warn('Current wallet address unavailable', e)
          }
        }

        // All wallet addresses on this chain/network
        if (walletId) {
          try {
            const walletResp: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
              params: {
                wallet_id: walletId,
                chain_id: chainId,
                network: props.network,
              },
            })
            if (walletResp.result && Array.isArray(walletResp.data)) {
              for (const item of walletResp.data) {
                pushUnique({
                  id: `wallet-${item.id}`,
                  label: item.note || 'Wallet',
                  address: String(item.address),
                  kind: 'wallet',
                })
              }
            }
          } catch (e) {
            console.warn('Wallet addresses unavailable', e)
          }
        }

        // Address book entries (requires store_id)
        if (storeId) {
          try {
            const bookResp: any = await axios.get(Http.find_address_book, {
              params: {
                store_id: storeId,
                network: props.network,
                chain_id: chainId,
              },
            })
            if (bookResp.result && Array.isArray(bookResp.data)) {
              for (const item of bookResp.data) {
                pushUnique({
                  id: `book-${item.id}`,
                  label: item.name || 'Address book',
                  address: String(item.address),
                  kind: 'book',
                })
              }
            }
          } catch (e) {
            console.warn('Address book unavailable', e)
          }
        }

        setAddressOptions(options)

        // If current address wasn't set, fall back to first wallet address
        if (!options.some((o) => o.kind === 'current') && options.length > 0) {
          setAddress((prev) => prev || options[0].address)
        }
      } finally {
        setLoadingAddresses(false)
      }
    },
    [props.network, storeId, walletId]
  )

  useEffect(() => {
    if (!props.openDialog || !props.selectCoinItem?.chainId) return
    setAddress('')
    setAmount(0)
    setMaxAmount(null)
    setAddressOptions([])
    void loadAddresses(props.selectCoinItem.chainId)
    void loadMaxAmount(props.selectCoinItem)
  }, [props.openDialog, props.selectCoinItem, loadAddresses, loadMaxAmount])

  const chainName = FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)
  const currentOptions = addressOptions.filter((o) => o.kind === 'current')
  const walletOptions = addressOptions.filter((o) => o.kind === 'wallet')
  const bookOptions = addressOptions.filter((o) => o.kind === 'book')

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Claim Free Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {props.selectCoinItem?.icon && (
            <div className="flex items-center gap-3">
              <Image
                src={props.selectCoinItem.icon}
                alt={props.selectCoinItem.name ?? 'coin'}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-medium">{props.selectCoinItem.name}</p>
                <p className="text-sm text-muted-foreground">{chainName}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter or select an address"
                className="pr-24 font-mono text-sm"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {chainName}
              </span>
            </div>
          </div>

          {loadingAddresses ? (
            <p className="text-xs text-muted-foreground">Loading your addresses…</p>
          ) : (
            <>
              {(currentOptions.length > 0 || walletOptions.length > 0) && (
                <div className="space-y-2">
                  <Label className="inline-flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5" />
                    Your wallet
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {currentOptions.map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className={cn(
                          'cursor-pointer gap-1.5 border-emerald-200 bg-emerald-50 font-mono text-xs text-emerald-800 transition-colors hover:bg-emerald-100',
                          address === item.address && 'ring-2 ring-emerald-400'
                        )}
                        onClick={() => setAddress(item.address)}
                      >
                        <span className="font-sans text-[10px] uppercase tracking-wide">
                          Current
                        </span>
                        {OmitMiddleString(item.address)}
                      </Badge>
                    ))}
                    {walletOptions.map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className={cn(
                          'cursor-pointer font-mono text-xs transition-colors hover:bg-muted',
                          address === item.address && 'ring-2 ring-primary/40'
                        )}
                        onClick={() => setAddress(item.address)}
                      >
                        {item.label !== 'Wallet' ? (
                          <span className="mr-1 font-sans text-[10px] text-muted-foreground">
                            {item.label}
                          </span>
                        ) : null}
                        {OmitMiddleString(item.address)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {bookOptions.length > 0 && (
                <div className="space-y-2">
                  <Label>Address book</Label>
                  <div className="flex flex-wrap gap-2">
                    {bookOptions.map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className={cn(
                          'cursor-pointer font-mono text-xs transition-colors hover:bg-muted',
                          address === item.address && 'ring-2 ring-primary/40'
                        )}
                        onClick={() => setAddress(item.address)}
                      >
                        {item.label !== 'Address book' ? (
                          <span className="mr-1 font-sans text-[10px] text-muted-foreground">
                            {item.label}
                          </span>
                        ) : null}
                        {OmitMiddleString(item.address)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!storeId && !walletId ? (
                <p className="text-xs text-muted-foreground">
                  Sign in and select a store/wallet to pick your current address quickly.
                </p>
              ) : null}
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="amount">Amount</Label>
              {maxAmount != null ? (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() => setAmount(maxAmount)}
                >
                  Max ≈ {maxAmount} (~${FREECOIN_MAX_USD})
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">Max ≈ ${FREECOIN_MAX_USD} USD</span>
              )}
            </div>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder={maxAmount != null ? `Up to ${maxAmount}` : 'Enter your amount'}
            />
            {maxAmount != null && amount > maxAmount ? (
              <p className="text-xs text-destructive">
                Amount exceeds the ~${FREECOIN_MAX_USD} USD faucet limit for this coin.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            disabled={
              isClaiming ||
              !address ||
              !amount ||
              amount <= 0 ||
              (maxAmount != null && amount > maxAmount)
            }
            onClick={async () => {
              try {
                setIsClaiming(true)
                await props.onClickCoin(props.selectCoinItem as COIN, address, amount)
                handleClose()
              } finally {
                setIsClaiming(false)
              }
            }}
          >
            {isClaiming ? 'Claiming...' : 'Claim Funds'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
