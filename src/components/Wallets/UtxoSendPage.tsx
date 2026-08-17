import { useEffect, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { CheckCircle2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import { OmitMiddleString } from '@/utils/strings'
import { COINGECKO_IDS, PAYOUT_STATUS } from '@/packages/constants'
import { BigDiv, BigSub } from '@/utils/number'
import { GetImgSrcByCrypto } from '@/utils/qrcode'
import { FindChainNamesByChains } from '@/utils/web3'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { AddressBookRowType, CoinBalanceType, UtxoFeeType } from '@/utils/types'

const fee_byte_length = 140

type Props = {
  chainId: CHAINS
  chainSvg: StaticImageData | string
  getBlockchainTxUrl: (isMainnet: boolean, hash: string) => string
  feeRateUnit: string // e.g. "satoshi" or "litoshi"
  feeAdornment: string // e.g. "sat/vB", "lit/vB"
  doneHref: string
}

const UtxoSendPage = ({
  chainId,
  chainSvg,
  getBlockchainTxUrl,
  feeRateUnit,
  feeAdornment,
  doneHref,
}: Props) => {
  const router = useRouter()
  const { payoutId } = router.query

  const [mainCoin, setMainCoin] = useState<COINS>()
  const [alignment, setAlignment] = useState<
    'fastest' | 'halfHour' | 'hour' | 'economy' | 'minimum'
  >('fastest')
  const [feeObj, setFeeObj] = useState<UtxoFeeType>()
  const [addressBookrows, setAddressBookrows] = useState<AddressBookRowType[]>([])

  const [page, setPage] = useState<number>(1)
  const [fromAddress, setFromAddress] = useState<string>('')
  const [balance, setBalance] = useState<CoinBalanceType>({})
  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [feeRate, setFeeRate] = useState<number>(0)

  const [networkFee, setNetworkFee] = useState<number>(0)
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('')
  const [coin, setCoin] = useState<COINS>()

  const [amountRed, setAmountRed] = useState<boolean>(false)

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

  const handleChangeFees = (value: string) => {
    if (!value) return
    switch (value) {
      case 'fastest':
        setFeeRate(Number(feeObj?.fastest))
        break
      case 'halfHour':
        setFeeRate(Number(feeObj?.halfHour))
        break
      case 'hour':
        setFeeRate(Number(feeObj?.hour))
        break
      case 'economy':
        setFeeRate(Number(feeObj?.economy))
        break
      case 'minimum':
        setFeeRate(Number(feeObj?.minimum))
        break
    }
    setAlignment(value as typeof alignment)
  }

  const getBalance = async (storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: chainId,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setFromAddress(response.data.address)
        setBalance(response.data.balance)
        setMainCoin(response.data.mainCoin.name)
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
          fastest: response.data.fastest,
          halfHour: response.data.halfHour,
          hour: response.data.hour,
          economy: response.data.economy,
          minimum: response.data.minimum,
        })
        setFeeRate(response.data.fastest)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const getAddressBook = async (network: string) => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: { chain_id: chainId, network: network === 'mainnet' ? 1 : 2 },
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

  const getPayoutInfo = async (id: number) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_id, { params: { id } })

      if (response.result) {
        setDestinationAddress(response.data.address)

        const ids = COINGECKO_IDS[response.data.crypto as COINS]
        const rate_response: any = await axios.get(Http.find_crypto_price, {
          params: { ids, currency: response.data.currency },
        })
        if (rate_response.result) {
          const rate = rate_response.data[ids][response.data.currency.toLowerCase()]
          const totalPrice = parseFloat(
            BigDiv(Number(response.data.amount).toString(), rate)
          ).toFixed(8)
          setAmount(totalPrice)
          setIsDisableDestinationAddress(true)
          setIsDisableAmount(true)
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const checkAddress = async (): Promise<boolean> => {
    if (destinationAddress === fromAddress) return false
    if (!destinationAddress || destinationAddress === '') return false

    try {
      const response: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: chainId,
          address: destinationAddress,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      return response.result
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
      return false
    }
  }

  const checkAmount = (): boolean =>
    !!(
      amount &&
      networkFee &&
      parseFloat(amount) > 0 &&
      parseFloat(balance[String(coin)]) >= parseFloat(amount) + networkFee
    )

  const checkFeeRate = (): boolean => !!(feeRate && feeRate > 0)

  const onClickSignTransaction = async () => {
    if (!(await checkAddress())) {
      setSnackSeverity('error')
      setSnackMessage('The destination address cannot be empty or input errors')
      setSnackOpen(true)
      return
    }
    if (!checkAmount()) {
      setSnackSeverity('error')
      setSnackMessage('Insufficient balance or input error')
      setSnackOpen(true)
      return
    }
    if (!checkFeeRate()) {
      setSnackSeverity('error')
      setSnackMessage('Incorrect fee rate')
      setSnackOpen(true)
      return
    }

    if (coin === mainCoin) {
      if (
        !networkFee ||
        !amount ||
        networkFee + parseFloat(amount) > parseFloat(balance[String(mainCoin)])
      ) {
        setSnackSeverity('error')
        setSnackMessage('Insufficient balance or Insufficient gas fee')
        setSnackOpen(true)
        return
      }
    } else {
      if (!networkFee || !amount || networkFee > parseFloat(balance[String(mainCoin)])) {
        setSnackSeverity('error')
        setSnackMessage('Insufficient balance or Insufficient gas fee')
        setSnackOpen(true)
        return
      }
    }

    if (networkFee && networkFee > 0) setPage(2)
  }

  const onClickSignAndPay = async () => {
    try {
      const response: any = await axios.post(Http.send_transaction, {
        chain_id: chainId,
        from_address: fromAddress,
        to_address: destinationAddress,
        network: network === 'mainnet' ? 1 : 2,
        wallet_id: walletId,
        user_id: userId,
        value: amount,
        coin,
        fee_rate: feeRate,
      })

      if (response.result) {
        if (payoutId) {
          const update_payout_resp: any = await axios.put(Http.update_payout_by_id, {
            id: payoutId,
            tx: response.data.hash,
            crypto_amount: amount,
            payout_status: PAYOUT_STATUS.Completed,
          })

          if (!update_payout_resp.result) {
            setSnackSeverity('error')
            setSnackMessage('Can not update the status of payout!')
            setSnackOpen(true)
            return
          }
        }

        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)
        setBlockExplorerLink(getBlockchainTxUrl(network === 'mainnet', response.data.hash))
        setPage(3)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    if (feeRate && feeRate > 0) {
      setNetworkFee((fee_byte_length * feeRate) / 100000000)
    }
  }, [feeRate])

  useEffect(() => {
    if (!payoutId) return
    getPayoutInfo(Number(payoutId))
  }, [payoutId])

  useEffect(() => {
    getBalance(storeId, network)
  }, [storeId, network])

  useEffect(() => {
    getFeeRate(network)
  }, [network])

  useEffect(() => {
    getAddressBook(network)
  }, [network])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pb-16">
      <div className="flex items-center justify-center gap-2 py-8">
        <Image src={chainSvg} alt="chain" width={44} height={44} className="h-11 w-11" />
        <h1 className="text-2xl font-semibold">
          Send coin on{' '}
          {network === 'mainnet'
            ? FindChainNamesByChains(chainId) + ' mainnet'
            : FindChainNamesByChains(chainId) + ' testnet'}
        </h1>
      </div>

      <div className="w-full">
        {page === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>From address</Label>
              <Input value={fromAddress} disabled className="font-mono" />
            </div>

            <div className="space-y-2">
              <Label>Destination address</Label>
              <Input
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                disabled={isDisableDestinationAddress}
                className="font-mono"
              />
            </div>

            {addressBookrows.length > 0 && (
              <div className="space-y-2">
                <Label>Address books</Label>
                <div className="flex flex-wrap gap-2">
                  {addressBookrows.map((item, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer py-1.5 font-mono hover:bg-accent"
                      onClick={() => setDestinationAddress(item.address)}
                    >
                      {OmitMiddleString(item.address)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Coin</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(balance).map(([token, amt], balanceIndex) => (
                  <Badge
                    key={balanceIndex}
                    variant={token === coin ? 'default' : 'outline'}
                    className="cursor-pointer gap-1.5 py-1.5"
                    onClick={() => setCoin(token as COINS)}
                  >
                    <Image
                      src={GetImgSrcByCrypto(token as COINS)}
                      alt="logo"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                    {String(amt)} {token}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setAmountRed(parseFloat(e.target.value) > parseFloat(balance[String(coin)]))
                }}
                disabled={isDisableAmount}
              />
              {balance[String(coin)] && (
                <p
                  className={cn('font-bold', amountRed ? 'text-red-500' : 'text-muted-foreground')}
                >
                  Your available balance is {balance[String(coin)]} {mainCoin}.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fee rate ({feeRateUnit} per byte)</Label>
              <Input
                type="number"
                className="w-[220px]"
                value={feeRate}
                onChange={(e) => setFeeRate(Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">Network fee: {networkFee}</p>
            </div>

            <div className="space-y-2">
              <Label>Select the fee rate</Label>
              <ToggleGroup
                type="single"
                value={alignment}
                onValueChange={handleChangeFees}
                className="flex-wrap justify-start"
              >
                <ToggleGroupItem value="fastest">fastest</ToggleGroupItem>
                <ToggleGroupItem value="halfHour">halfHour</ToggleGroupItem>
                <ToggleGroupItem value="hour">hour</ToggleGroupItem>
                <ToggleGroupItem value="economy">economy</ToggleGroupItem>
                <ToggleGroupItem value="minimum">minimum</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <Button size="lg" className="mt-4" onClick={onClickSignTransaction}>
              Sign transaction
            </Button>
          </div>
        )}

        {page === 2 && (
          <div className="space-y-4">
            <Row label="Send to" value={OmitMiddleString(destinationAddress)} />
            <Row label="Spend amount" value={amount} suffix={coin} />
            <Row label="Network fee rate" value={String(feeRate)} suffix={feeAdornment} />
            <Row label="Network fee" value={String(networkFee)} suffix={mainCoin} />
            <Row
              label="Input: (1)"
              value={OmitMiddleString(fromAddress)}
              secondaryValue={balance[String(coin)]}
              secondarySuffix={mainCoin}
            />
            <Row
              label="Output: (1)"
              value={OmitMiddleString(destinationAddress)}
              secondaryValue={amount}
              secondarySuffix={mainCoin}
            />
            <Row
              label="Output: (2)"
              value={OmitMiddleString(fromAddress)}
              secondaryValue={String(
                parseFloat(BigSub(balance[String(coin)], (Number(amount) + networkFee).toString()))
              )}
              secondarySuffix={mainCoin}
            />

            <div className="flex justify-end gap-2 pt-6">
              <Button variant="destructive" onClick={() => setPage(1)}>
                Reject
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={onClickSignAndPay}>
                Sign & Pay
              </Button>
            </div>
          </div>
        )}

        {page === 3 && (
          <div className="mt-10 text-center">
            <CheckCircle2 className="mx-auto h-20 w-20 text-emerald-500" />
            <p className="mt-4 text-xl font-bold">Payment Sent</p>
            <p className="mt-2 text-muted-foreground">
              Your transaction has been successfully sent
            </p>
            <Link
              href={blockExplorerLink}
              target="_blank"
              className="mt-2 inline-flex items-center justify-center gap-1.5 text-primary hover:underline"
            >
              <Eye className="h-4 w-4" /> View on Block Explorer
            </Link>
            <div className="mt-10">
              <Button
                size="lg"
                className="w-full max-w-md"
                onClick={() => (window.location.href = doneHref)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  suffix,
  secondaryValue,
  secondarySuffix,
}: {
  label: string
  value: string
  suffix?: string
  secondaryValue?: string
  secondarySuffix?: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex gap-2">
        <div className="relative">
          <Input value={value} disabled className="w-[220px] pr-14 font-mono text-sm" />
          {suffix && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {suffix}
            </span>
          )}
        </div>
        {secondaryValue && (
          <div className="relative">
            <Input value={secondaryValue} disabled className="w-[160px] pr-14 font-mono text-sm" />
            {secondarySuffix && (
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {secondarySuffix}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UtxoSendPage
