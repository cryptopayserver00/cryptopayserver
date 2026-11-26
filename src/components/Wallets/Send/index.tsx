import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ClipboardPaste, Eye, Loader2 } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import {
  BigAdd,
  BigCmp,
  BigDiv,
  BigMul,
  BigSub,
  FormatCryptoAmount,
  GweiToEtherStr,
  SanitizeAmountInput,
  WeiToGweiStr,
} from '@/utils/number'
import { OmitMiddleString } from '@/utils/strings'
import { COINGECKO_IDS, PAYOUT_STATUS } from '@/packages/constants'
import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode'
import {
  FindChainNamesByChains,
  FindChainPathNamesByChains,
  GetBlockchainTxUrlByChainIds,
} from '@/utils/web3'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import {
  AddressBookRowType,
  CoinBalanceType,
  EvmChainFeeType,
  EvmMaxPriortyFeeType,
} from '@/utils/types'

function DetailRow({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium break-all">
        {value}
        {suffix ? <span className="ml-1 text-muted-foreground font-normal">{suffix}</span> : null}
      </span>
    </div>
  )
}

const WalletsSend = () => {
  const router = useRouter()
  const { chainId, payoutId } = router.query

  const [mainCoin, setMainCoin] = useState<COINS>()
  const [alignment, setAlignment] = useState<'high' | 'average' | 'low'>('average')
  const [maxPriortyFeeAlignment, setMaxPriortyFeeAlignment] = useState<'fast' | 'normal' | 'slow'>(
    'normal'
  )
  const [feeObj, setFeeObj] = useState<EvmChainFeeType>()
  const [maxPriortyFeeObj, setMaxPriortyFeeObj] = useState<EvmMaxPriortyFeeType>()
  const [addressBookrows, setAddressBookrows] = useState<AddressBookRowType[]>([])

  const [page, setPage] = useState<number>(1)
  const [fromAddress, setFromAddress] = useState<string>('')
  const [balance, setBalance] = useState<CoinBalanceType>({})
  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [maxFee, setMaxFee] = useState<string>('0')
  const [maxPriortyFee, setMaxPriortyFee] = useState<string>('0')
  const [gasLimit, setGasLimit] = useState<string>('0')

  const [networkFee, setNetworkFee] = useState<string>('')
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('')
  const [nonce, setNonce] = useState<string>('0')
  const [coin, setCoin] = useState<COINS>()
  const [displaySign, setDisplaySign] = useState<boolean>(false)
  const [amountRed, setAmountRed] = useState<boolean>(false)
  const [calculating, setCalculating] = useState(false)
  const [sending, setSending] = useState(false)

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false)
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false)

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

  const numericChainId = Number(chainId)
  const isBsc = numericChainId === CHAINS.BSC
  const chainName = numericChainId ? FindChainNamesByChains(numericChainId) : ''
  const backHref = numericChainId
    ? `/wallets/${FindChainPathNamesByChains(numericChainId)}`
    : '/wallets'
  const availableBalance = coin ? String(balance[String(coin)] ?? '0') : '0'

  const totalSpendPreview = useMemo(() => {
    if (!amount) return ''
    if (coin === mainCoin && networkFee) {
      try {
        return FormatCryptoAmount(BigAdd(amount, networkFee), 18)
      } catch {
        return amount
      }
    }
    return FormatCryptoAmount(amount, 18)
  }, [amount, coin, mainCoin, networkFee])

  const handleChangeFees = (value: string) => {
    if (!value || !feeObj) return
    switch (value) {
      case 'high':
        setMaxFee(WeiToGweiStr(feeObj.high))
        break
      case 'average':
        setMaxFee(WeiToGweiStr(feeObj.average))
        break
      case 'low':
        setMaxFee(WeiToGweiStr(feeObj.low))
        break
    }
    setAlignment(value as 'high' | 'average' | 'low')
  }

  const handleChangeMaxPriortyFee = (value: string) => {
    if (!value || !maxPriortyFeeObj) return
    switch (value) {
      case 'fast':
        setMaxPriortyFee(WeiToGweiStr(maxPriortyFeeObj.fast))
        break
      case 'normal':
        setMaxPriortyFee(WeiToGweiStr(maxPriortyFeeObj.normal))
        break
      case 'slow':
        setMaxPriortyFee(WeiToGweiStr(maxPriortyFeeObj.slow))
        break
    }
    setMaxPriortyFeeAlignment(value as 'fast' | 'normal' | 'slow')
  }

  const updateAmountValidity = (nextAmount: string, selectedCoin?: COINS) => {
    const token = selectedCoin || coin
    if (!token || !nextAmount) {
      setAmountRed(false)
      return
    }
    const bal = String(balance[String(token)] ?? '0')
    setAmountRed(BigCmp(nextAmount, bal) > 0)
  }

  const getBalance = async (id: number, storeIdValue: number, networkValue: string) => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: id,
          store_id: storeIdValue,
          network: networkValue === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setFromAddress(response.data.address)
        setBalance(response.data.balance)
        setMainCoin(response.data.mainCoin.name)
        if (!coin && response.data.mainCoin?.name) {
          setCoin(response.data.mainCoin.name)
        }
        await getNonce(id, response.data.address)
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  const getGasLimit = async (from: string): Promise<boolean> => {
    try {
      const response: any = await axios.get(Http.find_gas_limit, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
          coin: coin,
          from: from,
          to: destinationAddress,
          value: amount,
        },
      })
      if (response.result) {
        setGasLimit(String(response.data))
        return true
      }
      return false
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
      return false
    }
  }

  const getFeeRate = async (id: number, networkValue: string) => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: id,
          network: networkValue === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setFeeObj({
          high: response.data.fast,
          average: response.data.normal,
          low: response.data.slow,
        })
        setMaxFee(WeiToGweiStr(response.data.normal))
      }
    } catch (e) {
      console.warn('Fee rate unavailable', e)
    }
  }

  const getMaxPriortyFee = async (id: number, networkValue: string) => {
    try {
      const response: any = await axios.get(Http.find_max_priority_fee, {
        params: {
          chain_id: id,
          network: networkValue === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setMaxPriortyFeeObj({
          fast: response.data.fast,
          normal: response.data.normal,
          slow: response.data.slow,
        })
        setMaxPriortyFee(WeiToGweiStr(response.data.normal))
      }
    } catch (e) {
      console.warn('Max priority fee unavailable', e)
    }
  }

  const getAddressBook = async (id: number, networkValue: string) => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          chain_id: id,
          network: networkValue === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        const rows: AddressBookRowType[] = (response.data ?? []).map((item: any) => ({
          id: item.id,
          chainId: item.chainId,
          isMainnet: item.network === 1,
          name: item.name,
          address: item.address,
        }))
        setAddressBookrows(rows)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getNonce = async (id: number, address: string) => {
    if (!address) return
    try {
      const response: any = await axios.get(Http.find_nonce, {
        params: {
          chain_id: id,
          network: network === 'mainnet' ? 1 : 2,
          address: address,
        },
      })
      if (response.result) {
        setNonce(String(response.data ?? 0))
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  const getPayoutInfo = async (id: number) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_id, {
        params: { id },
      })

      if (response.result) {
        setDestinationAddress(response.data.address)

        const ids = COINGECKO_IDS[response.data.crypto as COINS]
        const rate_response: any = await axios.get(Http.find_crypto_price, {
          params: {
            ids: ids,
            currency: response.data.currency,
          },
        })
        if (rate_response.result) {
          const rate = rate_response.data[ids][response.data.currency.toLowerCase()]
          const totalPrice = FormatCryptoAmount(
            BigDiv(String(response.data.amount), String(rate)),
            8
          )
          setAmount(totalPrice)
          setCoin(response.data.crypto)
          setIsDisableDestinationAddress(true)
          setIsDisableAmount(true)
        }
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  const checkAddress = async (): Promise<boolean> => {
    if (!destinationAddress || destinationAddress === fromAddress) return false
    try {
      const response: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: chainId,
          address: destinationAddress,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      return Boolean(response.result)
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
      return false
    }
  }

  const checkAmount = (): boolean => {
    if (!amount || !coin) return false
    if (BigCmp(amount, '0') <= 0) return false
    return BigCmp(availableBalance, amount) >= 0
  }

  const checkNonce = (): boolean => BigCmp(nonce, '0') >= 0
  const checkMaxFee = (): boolean => BigCmp(maxFee, '0') > 0
  const checkMaxPriortyFee = (): boolean => BigCmp(maxPriortyFee, '0') >= 0
  const checkGasLimit = async (): Promise<boolean> => {
    // Always re-estimate: Glamsterdam new-account sends need ~204k gas, tokens more than 96k.
    return await getGasLimit(fromAddress)
  }

  const onClickMaxAmount = () => {
    if (!coin) return
    if (coin === mainCoin && networkFee && BigCmp(networkFee, '0') > 0) {
      // Leave headroom for gas (2x estimate, matching send validation)
      const reserve = BigMul(networkFee, '2')
      if (BigCmp(availableBalance, reserve) > 0) {
        const maxSend = FormatCryptoAmount(BigSub(availableBalance, reserve), 18)
        setAmount(maxSend)
        updateAmountValidity(maxSend, coin)
        return
      }
    }
    const maxSend = FormatCryptoAmount(availableBalance, 18)
    setAmount(maxSend)
    updateAmountValidity(maxSend, coin)
  }

  const onClickSignTransaction = async () => {
    if (!(await checkAddress())) {
      showSnack('error', 'The destination address cannot be empty or is invalid')
      return
    }

    if (!checkAmount()) {
      showSnack('error', 'Insufficient balance or invalid amount')
      return
    }

    if (!checkNonce()) {
      showSnack('error', 'Please enter a valid nonce')
      return
    }

    if (!checkMaxFee()) {
      showSnack('error', 'Please enter a valid max fee')
      return
    }

    if (!isBsc && !checkMaxPriortyFee()) {
      showSnack('error', 'Please enter a valid max priority fee')
      return
    }

    if (!displaySign) {
      setCalculating(true)
      try {
        if (!(await checkGasLimit())) {
          showSnack('error', 'Could not estimate gas limit')
          return
        }
        setDisplaySign(true)
      } finally {
        setCalculating(false)
      }
      return
    }

    if (!networkFee || BigCmp(networkFee, '0') <= 0) {
      showSnack('error', 'Network fee is not ready yet')
      return
    }

    const gasReserve = BigMul(networkFee, '2')
    if (coin === mainCoin) {
      const needed = BigAdd(amount, gasReserve)
      if (BigCmp(needed, String(balance[String(mainCoin)] ?? '0')) > 0) {
        showSnack('error', 'Insufficient balance for amount + gas')
        return
      }
    } else if (BigCmp(gasReserve, String(balance[String(mainCoin)] ?? '0')) > 0) {
      showSnack('error', 'Insufficient gas fee balance')
      return
    }

    setPage(2)
  }

  const onClickSignAndPay = async () => {
    try {
      setSending(true)
      const { promptAccountPassword, promptWalletPasswordIfNeeded } = await import(
        '@/utils/wallet-password'
      )
      const accountPassword = await promptAccountPassword('Enter your account password to send')
      if (accountPassword === null) return
      const walletPassword = await promptWalletPasswordIfNeeded(walletId)
      if (walletPassword === null) return

      const response: any = await axios.post(Http.send_transaction, {
        account_password: accountPassword,
        wallet_password: walletPassword,
        chain_id: chainId,
        from_address: fromAddress,
        to_address: destinationAddress,
        network: network === 'mainnet' ? 1 : 2,
        wallet_id: walletId,
        user_id: userId,
        value: amount,
        coin: coin,
        nonce: Number(nonce),
        max_fee: Number(maxFee),
        max_priority_fee: Number(maxPriortyFee),
        max_priorty_fee: Number(maxPriortyFee),
        gas_limit: Number(gasLimit),
      })

      if (response.result) {
        if (payoutId) {
          const update_payout_resp: any = await axios.put(Http.update_payout_by_id, {
            id: payoutId,
            tx: response.data.hash,
            crypto_amount: amount,
            payout_status: PAYOUT_STATUS.Completed,
            account_password: accountPassword,
          })

          if (!update_payout_resp.result) {
            showSnack('error', 'Could not update payout status.')
            return
          }
        }

        showSnack('success', 'Transaction submitted')
        setBlockExplorerLink(
          GetBlockchainTxUrlByChainIds(network === 'mainnet', numericChainId, response.data.hash)
        )
        setPage(3)
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const onClickParseClipboardText = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim()
      if (!text) {
        showSnack('error', 'Clipboard is empty')
        return
      }

      const response: any = await axios.get(Http.parse_qrcode_text, {
        params: {
          chain_id: chainId,
          text,
        },
      })

      if (response.result && response.data) {
        if (response.data.address) setDestinationAddress(response.data.address)
        if (response.data.amount) {
          const next = SanitizeAmountInput(String(response.data.amount))
          setAmount(next)
          updateAmountValidity(next)
        }
        if (response.data.token) setCoin(response.data.token)
        showSnack('success', 'Parsed from clipboard')
      } else {
        // Fallback: treat clipboard as raw address
        setDestinationAddress(text)
        showSnack('success', 'Address pasted')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  useEffect(() => {
    if (BigCmp(maxFee, '0') > 0 && BigCmp(gasLimit, '0') > 0) {
      setNetworkFee(FormatCryptoAmount(BigMul(GweiToEtherStr(maxFee), gasLimit), 18))
    } else {
      setNetworkFee('')
    }
  }, [maxFee, gasLimit])

  // Reset cached gas when inputs that affect eth_estimateGas change.
  useEffect(() => {
    setGasLimit('')
    setDisplaySign(false)
  }, [destinationAddress, amount, coin])

  useEffect(() => {
    if (payoutId) getPayoutInfo(Number(payoutId))
  }, [payoutId])

  useEffect(() => {
    if (!chainId || !storeId) return
    getBalance(numericChainId, storeId, network)
  }, [chainId, storeId, network])

  useEffect(() => {
    if (!chainId) return
    getFeeRate(numericChainId, network)
  }, [chainId, network])

  useEffect(() => {
    if (!chainId || isBsc) return
    getMaxPriortyFee(numericChainId, network)
  }, [chainId, network])

  useEffect(() => {
    if (!chainId) return
    getAddressBook(numericChainId, network)
  }, [chainId, network])

  return (
    <div className="mx-auto mb-16 max-w-screen-md px-4 py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <Badge variant="outline" className="font-normal capitalize">
          {network || '—'}
        </Badge>
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        {GetImgSrcByChain(numericChainId) ? (
          <Image
            src={GetImgSrcByChain(numericChainId)}
            alt={chainName}
            width={48}
            height={48}
            className="h-12 w-12"
          />
        ) : null}
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Send on {chainName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review amounts carefully. Fees are estimated in {mainCoin || 'native coin'}.
        </p>
      </div>

      {page === 1 && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Transfer</CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={onClickParseClipboardText}>
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  Paste / parse
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label>From</Label>
                <Input value={fromAddress ? OmitMiddleString(fromAddress, 10) : 'Loading…'} disabled />
              </div>

              <div className="space-y-2">
                <Label>Destination</Label>
                <Input
                  placeholder="0x…"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value.trim())}
                  disabled={isDisableDestinationAddress}
                />
              </div>

              {addressBookrows.length > 0 && (
                <div className="space-y-2">
                  <Label>Address book</Label>
                  <div className="flex flex-wrap gap-2">
                    {addressBookrows.map((item) => (
                      <Badge
                        key={item.id}
                        variant="outline"
                        className="cursor-pointer px-3 py-1 font-normal hover:bg-muted"
                        onClick={() => setDestinationAddress(item.address)}
                      >
                        {item.name || OmitMiddleString(item.address)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Asset</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(balance).map(([token, tokenAmount]) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => {
                        setCoin(token as COINS)
                        updateAmountValidity(amount, token as COINS)
                        setDisplaySign(false)
                      }}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                        token === coin
                          ? 'border-transparent bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Image
                        src={GetImgSrcByCrypto(token as COINS)}
                        alt=""
                        width={18}
                        height={18}
                        className="h-4.5 w-4.5"
                      />
                      {FormatCryptoAmount(String(tokenAmount), 8)} {token}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label>Amount</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={!coin || isDisableAmount}
                    onClick={onClickMaxAmount}
                  >
                    Max
                  </Button>
                </div>
                <Input
                  inputMode="decimal"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => {
                    const next = SanitizeAmountInput(e.target.value)
                    setAmount(next)
                    updateAmountValidity(next)
                    setDisplaySign(false)
                  }}
                  disabled={isDisableAmount}
                  className={cn(amountRed && 'border-destructive focus-visible:ring-destructive/30')}
                />
                {coin && (
                  <p
                    className={cn(
                      'text-sm',
                      amountRed ? 'font-medium text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    Available: {FormatCryptoAmount(availableBalance, 8)} {coin}
                    {amountRed ? ' — exceeds balance' : ''}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Network fee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <Label>Nonce</Label>
                <Input
                  inputMode="numeric"
                  value={nonce}
                  onChange={(e) => setNonce(SanitizeAmountInput(e.target.value, 0).replace(/\./g, ''))}
                />
              </div>

              <div className="space-y-2">
                <Label>{isBsc ? 'Gas price' : 'Max fee'} (gwei)</Label>
                <Input
                  inputMode="decimal"
                  value={maxFee}
                  onChange={(e) => {
                    setMaxFee(SanitizeAmountInput(e.target.value, 9))
                    setDisplaySign(false)
                  }}
                />
                <ToggleGroup
                  type="single"
                  value={alignment}
                  onValueChange={handleChangeFees}
                  className="justify-start"
                >
                  <ToggleGroupItem value="high">High</ToggleGroupItem>
                  <ToggleGroupItem value="average">Average</ToggleGroupItem>
                  <ToggleGroupItem value="low">Low</ToggleGroupItem>
                </ToggleGroup>
              </div>

              {!isBsc && (
                <div className="space-y-2">
                  <Label>Max priority fee (gwei)</Label>
                  <Input
                    inputMode="decimal"
                    value={maxPriortyFee}
                    onChange={(e) => {
                      setMaxPriortyFee(SanitizeAmountInput(e.target.value, 9))
                      setDisplaySign(false)
                    }}
                  />
                  <ToggleGroup
                    type="single"
                    value={maxPriortyFeeAlignment}
                    onValueChange={handleChangeMaxPriortyFee}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="fast">Fast</ToggleGroupItem>
                    <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
                    <ToggleGroupItem value="slow">Slow</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}

              {displaySign && (
                <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                  <div className="space-y-2">
                    <Label>Gas limit</Label>
                    <Input
                      inputMode="numeric"
                      value={gasLimit}
                      onChange={(e) =>
                        setGasLimit(SanitizeAmountInput(e.target.value, 0).replace(/\./g, ''))
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Est. network fee:{' '}
                    <span className="font-medium text-foreground">
                      {FormatCryptoAmount(networkFee || '0', 12)} {mainCoin}
                    </span>
                    <span className="block mt-1 text-xs">
                      {isBsc ? 'gas price' : 'max fee'} ({FormatCryptoAmount(maxFee, 6)} gwei) × gas (
                      {gasLimit})
                    </span>
                  </p>
                  {coin === mainCoin && totalSpendPreview && (
                    <p className="text-sm">
                      Total (amount + fee):{' '}
                      <span className="font-semibold">
                        {totalSpendPreview} {mainCoin}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <Button className="w-full" onClick={onClickSignTransaction} disabled={calculating}>
                {calculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Estimating…
                  </>
                ) : displaySign ? (
                  'Review transaction'
                ) : (
                  'Estimate gas fee'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {page === 2 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Confirm & sign</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DetailRow label="Send to" value={OmitMiddleString(destinationAddress, 10)} />
            <DetailRow
              label="Amount"
              value={FormatCryptoAmount(amount, 12)}
              suffix={String(coin)}
            />
            <DetailRow
              label={isBsc ? 'Gas price' : 'Max fee'}
              value={FormatCryptoAmount(maxFee, 6)}
              suffix="gwei"
            />
            {!isBsc && (
              <DetailRow
                label="Max priority fee"
                value={FormatCryptoAmount(maxPriortyFee, 6)}
                suffix="gwei"
              />
            )}
            <DetailRow label="Gas limit" value={gasLimit} />
            <DetailRow
              label="Network fee"
              value={FormatCryptoAmount(networkFee || '0', 12)}
              suffix={String(mainCoin)}
            />
            <DetailRow label="Nonce" value={nonce} />

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setPage(1)} disabled={sending}>
                Back
              </Button>
              <Button onClick={onClickSignAndPay} disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Sign & pay'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {page === 3 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" strokeWidth={1.5} />
            <p className="mt-4 text-xl font-bold">Payment sent</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your transaction was submitted to the network
            </p>
            {blockExplorerLink ? (
              <Link
                href={blockExplorerLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary underline-offset-4 hover:underline"
              >
                <Eye className="h-4 w-4" />
                View on explorer
              </Link>
            ) : null}
            <Button size="lg" className="mt-10 w-full max-w-sm" asChild>
              <Link href={backHref}>Done</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default WalletsSend
