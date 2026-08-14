import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Eye } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINS, COIN, COINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { BigDiv, BigMul, GweiToEther, WeiToGwei } from '@/utils/number'
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

const SuffixInput = ({ value, suffix }: { value: string | number; suffix: string }) => (
  <div className="relative w-[200px]">
    <Input value={value} disabled className="pr-14" />
    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
      {suffix}
    </span>
  </div>
)

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
  const [maxFee, setMaxFee] = useState<number>(0)
  const [maxPriortyFee, setMaxPriortyFee] = useState<number>(0)
  const [gasLimit, setGasLimit] = useState<number>(0)

  const [networkFee, setNetworkFee] = useState<string>('')
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('')
  const [nonce, setNonce] = useState<number>(0)
  const [coin, setCoin] = useState<COINS>()
  const [displaySign, setDisplaySign] = useState<boolean>(false)
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

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const handleChangeFees = (value: string) => {
    if (!value) return
    switch (value) {
      case 'high':
        setMaxFee(WeiToGwei(Number(feeObj?.high)))
        break
      case 'average':
        setMaxFee(WeiToGwei(Number(feeObj?.average)))
        break
      case 'low':
        setMaxFee(WeiToGwei(Number(feeObj?.low)))
        break
    }
    setAlignment(value as 'high' | 'average' | 'low')
  }

  const handleChangeMaxPriortyFee = (value: string) => {
    if (!value) return
    switch (value) {
      case 'fast':
        setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.fast)))
        break
      case 'normal':
        setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.normal)))
        break
      case 'slow':
        setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.slow)))
        break
    }
    setMaxPriortyFeeAlignment(value as 'fast' | 'normal' | 'slow')
  }

  const getBalance = async (chainId: number, storeId: number, network: string) => {
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
        setMainCoin(response.data.main_coin.name)

        await getNonce(chainId, response.data.address)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
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
        setGasLimit(response.data)
        return true
      }
      return false
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
      return false
    }
  }

  const getFeeRate = async (chainId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setFeeObj({
          high: response.data.fast,
          average: response.data.normal,
          low: response.data.slow,
        })
        setMaxFee(WeiToGwei(response.data.normal))
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getMaxPriortyFee = async (chainId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_max_priorty_fee, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setMaxPriortyFeeObj({
          fast: response.data.fast,
          normal: response.data.normal,
          slow: response.data.slow,
        })
        setMaxPriortyFee(WeiToGwei(response.data.normal))
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getAddressBook = async (chainId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result && response.data.length > 0) {
        let rt: AddressBookRowType[] = []
        response.data.forEach((item: any) => {
          rt.push({
            id: item.id,
            chainId: item.chain_id,
            isMainnet: item.network === 1 ? true : false,
            name: item.name,
            address: item.address,
          })
        })

        setAddressBookrows(rt)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getNonce = async (chainId: number, address: string) => {
    if (address && address != '') {
      try {
        const response: any = await axios.get(Http.find_nonce, {
          params: {
            chain_id: chainId,
            network: network === 'mainnet' ? 1 : 2,
            address: address,
          },
        })
        if (response.result) {
          setNonce(response.data)
        }
      } catch (e) {
        showSnack('error', 'The network error occurred. Please try again later.')
        console.error(e)
      }
    }
  }

  const getPayoutInfo = async (id: number) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_id, {
        params: {
          id: id,
        },
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
          const totalPrice = parseFloat(
            BigDiv(Number(response.data.amount).toString(), rate)
          ).toFixed(8)
          setAmount(totalPrice)
          setCoin(response.data.crypto)

          setIsDisableDestinationAddress(true)
          setIsDisableAmount(true)
        }
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const checkAddress = async (): Promise<boolean> => {
    if (destinationAddress === fromAddress) {
      return false
    }

    if (!destinationAddress || destinationAddress === '') {
      return false
    }

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
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
      return false
    }
  }

  const checkAmount = (): boolean => {
    if (
      amount &&
      parseFloat(amount) > 0 &&
      parseFloat(balance[String(coin)]) >= parseFloat(amount)
    ) {
      return true
    }

    return false
  }

  const checkNonce = (): boolean => {
    if (nonce >= 0) {
      return true
    }

    return false
  }

  const checkMaxFee = (): boolean => {
    if (maxFee && maxFee >= 0) {
      return true
    }

    return false
  }

  const checkMaxPriortyFee = (): boolean => {
    if (maxPriortyFee && maxPriortyFee >= 0) {
      return true
    }

    return false
  }

  const checkGasLimit = async (): Promise<boolean> => {
    if (gasLimit && gasLimit > 0) {
      return true
    }

    return await getGasLimit(fromAddress)
  }

  const onClickSignTransaction = async () => {
    if (!(await checkAddress())) {
      showSnack('error', 'The destination address cannot be empty or input errors')
      return
    }

    if (!checkAmount()) {
      showSnack('error', 'Insufficient balance or input error')
      return
    }

    if (!checkNonce()) {
      showSnack('error', 'Incorrect nonce amount')
      return
    }

    if (!checkMaxFee()) {
      showSnack('error', 'Incorrect max fee')
      return
    }

    if (Number(chainId) !== CHAINS.BSC) {
      if (!checkMaxPriortyFee()) {
        showSnack('error', 'Incorrect max priorty fee')
        return
      }
    }

    if (!(await checkGasLimit())) {
      showSnack('error', 'Incorrect gas limit')
      return
    } else {
      setDisplaySign(true)
    }

    if (displaySign) {
      if (coin === mainCoin) {
        if (
          !networkFee ||
          !amount ||
          parseFloat(networkFee) * 2 + parseFloat(amount) > parseFloat(balance[String(mainCoin)])
        ) {
          showSnack('error', 'Insufficient balance or Insufficient gas fee')
          return
        }
      } else {
        if (
          !networkFee ||
          !amount ||
          parseFloat(networkFee) * 2 > parseFloat(balance[String(mainCoin)])
        ) {
          showSnack('error', 'Insufficient balance or Insufficient gas fee')
          return
        }
      }

      if (networkFee && networkFee != '') {
        setPage(2)
      }
    }
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
        coin: coin,
        nonce: nonce,
        max_fee: maxFee,
        max_priorty_fee: maxPriortyFee,
        gas_limit: gasLimit,
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
            showSnack('error', 'Can not update the status of payout!')
            return
          }
        }

        showSnack('success', 'Successful creation!')

        setBlockExplorerLink(
          GetBlockchainTxUrlByChainIds(network === 'mainnet', Number(chainId), response.data.hash)
        )
        setPage(3)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onClickParseClipboardText = async (text: string) => {
    try {
      if (!text || text === '') {
        showSnack('error', 'Invalid parsing')
        return
      }

      text = text.trim()

      const response: any = await axios.get(Http.parse_qrcode_text, {
        params: {
          chain_id: chainId,
          text: text,
        },
      })

      if (response.result) {
        showSnack('success', 'Parsing success')
      } else {
        showSnack('error', 'Invalid parsing')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  useEffect(() => {
    if (maxFee && maxFee > 0 && gasLimit && gasLimit > 0) {
      setNetworkFee(
        parseFloat(BigMul(GweiToEther(maxFee).toString(), gasLimit.toString())).toFixed(8)
      )
    }
  }, [maxFee, gasLimit])

  useEffect(() => {
    if (payoutId) {
      getPayoutInfo(Number(payoutId))
    }
  }, [payoutId])

  useEffect(() => {
    if (!chainId) {
      return
    }
    getBalance(Number(chainId), storeId, network)
  }, [chainId, storeId, network])

  useEffect(() => {
    if (!chainId) {
      return
    }
    getFeeRate(Number(chainId), network)
  }, [chainId, network])

  useEffect(() => {
    if (!chainId) {
      return
    }
    if (Number(chainId) !== CHAINS.BSC) {
      getMaxPriortyFee(Number(chainId), network)
    }
  }, [chainId, network])

  useEffect(() => {
    if (!chainId) {
      return
    }
    getAddressBook(Number(chainId), network)
  }, [chainId, network])

  return (
    <div className="mb-16 flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 my-8">
        {GetImgSrcByChain(Number(chainId)) && (
          <Image
            src={GetImgSrcByChain(Number(chainId))}
            alt="chain"
            width={50}
            height={50}
            className="h-12 w-12"
          />
        )}
        <h1 className="text-3xl font-bold tracking-tight">
          Send coin on{' '}
          {network === 'mainnet'
            ? FindChainNamesByChains(Number(chainId)) + ' mainnet'
            : FindChainNamesByChains(Number(chainId)) + ' testnet'}
        </h1>
      </div>

      <div className="mx-auto w-full max-w-screen-lg px-4">
        {page === 1 && (
          <div className="mx-auto max-w-2xl">
            <Button
              onClick={async () => {
                const text = await navigator.clipboard.readText()
                await onClickParseClipboardText(text)
              }}
            >
              Parse clipboard text
            </Button>

            <div className="mt-6 space-y-2">
              <Label>From address</Label>
              <Input value={fromAddress} disabled />
            </div>

            <div className="mt-6 space-y-2">
              <Label>Destination address</Label>
              <Input
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                disabled={isDisableDestinationAddress}
              />
            </div>

            {addressBookrows && addressBookrows.length > 0 && (
              <div className="mt-6">
                <Label className="mb-2 block">Address books</Label>
                <div className="flex flex-wrap gap-2">
                  {addressBookrows.map((item, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer px-3 py-1 font-normal hover:bg-muted"
                      onClick={() => setDestinationAddress(item.address)}
                    >
                      {OmitMiddleString(item.address)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Label className="mb-2 block">Coin</Label>
              <div className="flex flex-wrap gap-2">
                {balance &&
                  Object.entries(balance).map(([token, tokenAmount], balanceIndex) => (
                    <button
                      key={balanceIndex}
                      type="button"
                      onClick={() => setCoin(token as COINS)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                        token === coin
                          ? 'border-transparent bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Image
                        src={GetImgSrcByCrypto(token as COINS)}
                        alt="logo"
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                      {String(tokenAmount)} {token}
                    </button>
                  ))}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (parseFloat(e.target.value) > parseFloat(balance[String(coin)])) {
                    setAmountRed(true)
                  } else {
                    setAmountRed(false)
                  }
                }}
                disabled={isDisableAmount}
              />
              {balance[String(coin)] && (
                <p
                  className={cn(
                    'text-sm font-semibold',
                    amountRed ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  Your available balance is {balance[String(coin)]} {coin}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <Label>Nonce</Label>
              <Input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(Number(e.target.value))}
              />
            </div>

            <div className="mt-6 space-y-2">
              <Label>{Number(chainId) === CHAINS.BSC ? 'Gas price' : 'Max fee'} (gwei)</Label>
              <Input
                type="number"
                className="w-48"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm">
                Select the {Number(chainId) === CHAINS.BSC ? 'gas price' : 'max fee'}
              </span>
              <ToggleGroup type="single" value={alignment} onValueChange={handleChangeFees}>
                <ToggleGroupItem value="high">High</ToggleGroupItem>
                <ToggleGroupItem value="average">Average</ToggleGroupItem>
                <ToggleGroupItem value="low">Low</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {Number(chainId) !== CHAINS.BSC && (
              <>
                <div className="mt-6 space-y-2">
                  <Label>Max priorty fee (gwei)</Label>
                  <Input
                    type="number"
                    className="w-48"
                    value={maxPriortyFee}
                    onChange={(e) => setMaxPriortyFee(Number(e.target.value))}
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-sm">Select the max priorty fee</span>
                  <ToggleGroup
                    type="single"
                    value={maxPriortyFeeAlignment}
                    onValueChange={handleChangeMaxPriortyFee}
                  >
                    <ToggleGroupItem value="fast">Fast</ToggleGroupItem>
                    <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
                    <ToggleGroupItem value="slow">Slow</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </>
            )}

            {displaySign && (
              <>
                <div className="mt-6 space-y-2">
                  <Label>Gas</Label>
                  <Input
                    type="number"
                    className="w-48"
                    value={gasLimit}
                    onChange={(e) => setGasLimit(Number(e.target.value))}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Miner fee: {networkFee} {mainCoin} ={' '}
                  {Number(chainId) === CHAINS.BSC ? 'gas price' : 'max fee'}({maxFee}) * gas(
                  {gasLimit})
                </p>
              </>
            )}

            <Button className="mt-6" onClick={onClickSignTransaction}>
              {displaySign ? 'Sign Transaction' : 'Calculate Gas Fee'}
            </Button>
          </div>
        )}

        {page === 2 && (
          <div className="mx-auto max-w-md">
            <div className="mt-10 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Send to</span>
              <Input value={OmitMiddleString(destinationAddress)} disabled className="w-[220px]" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Spend amount</span>
              <SuffixInput value={amount} suffix={String(coin)} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {Number(chainId) === CHAINS.BSC ? 'Gas price' : 'Max fee'}
              </span>
              <SuffixInput value={maxFee} suffix="Gwei" />
            </div>

            {Number(chainId) !== CHAINS.BSC && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Max priorty fee</span>
                <SuffixInput value={maxPriortyFee} suffix="Gwei" />
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Gas limit</span>
              <Input value={gasLimit} disabled className="w-[220px]" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Network fee</span>
              <SuffixInput value={networkFee} suffix={String(mainCoin)} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Nonce</span>
              <Input value={nonce} disabled className="w-[220px]" />
            </div>

            <div className="mt-8 flex items-center justify-end gap-2">
              <Button variant="destructive" onClick={() => setPage(1)}>
                Reject
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={onClickSignAndPay}>
                Sign & Pay
              </Button>
            </div>
          </div>
        )}

        {page === 3 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <CheckCircle2 className="h-20 w-20 text-green-500" strokeWidth={1.5} />

            <p className="mt-4 text-xl font-bold">Payment Sent</p>
            <p className="mt-2 text-muted-foreground">
              Your transaction has been successfully sent
            </p>

            <Link
              href={blockExplorerLink}
              target="_blank"
              className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
              <span>View on Block Explorer</span>
            </Link>

            <Button
              size="lg"
              className="mt-16 w-full max-w-[500px]"
              onClick={() => {
                window.location.href = '/wallets/' + FindChainPathNamesByChains(Number(chainId))
              }}
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletsSend
