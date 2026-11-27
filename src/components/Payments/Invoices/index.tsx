import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { PageHeader, PageShell } from '@/components/Layout/PageHeader'

import InvoiceDataGrid from '../../DataList/InvoiceDataGrid'
import { COINGECKO_IDS, CURRENCY, ORDER_TIME, ORDER_STATUS } from '@/packages/constants'
import { IsValidEmail, IsValidHTTPUrl, IsValidJSON } from '@/utils/verify'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { CHAINNAMES, COIN, COINS } from '@/packages/constants/blockchain'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { BigDiv, FormatCryptoAmount } from '@/utils/number'
import { FindChainIdsByChainNames, FindTokensByMainnetAndName } from '@/utils/web3'
import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode'
import { useShallow } from 'zustand/react/shallow'

const PaymentInvoices = () => {
  const [openCreateInvoice, setOpenCreateInvoice] = useState<boolean>(false)

  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>(CURRENCY[0])
  const [chainName, setChainName] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN)
  const [cryptoList, setCryptoList] = useState<COIN[]>([])
  const [crypto, setCrypto] = useState<COINS>(COINS.BTC)
  const [cryptoAmount, setCryptoAmount] = useState<string>('')
  const [rate, setRate] = useState<number>(0)
  const [description, setDescription] = useState<string>('')
  const [buyerEmail, setBuyerEmail] = useState<string>('')
  const [metadata, setMetadata] = useState<string>('')
  const [notificationUrl, setNotificationUrl] = useState<string>('')
  const [notificationEmail, setNotificationEmail] = useState<string>('')
  const [showBtcLn, setShowBtcLn] = useState<boolean>(false)
  const [showBtcLnUrl, setShowBtcLnUrl] = useState<boolean>(false)

  const [search, setSearch] = useState<string>('')
  const [orderStatus, setOrderStatus] = useState<string>(ORDER_STATUS.AllStatus)
  const [orderTime, setOrderTime] = useState<string>(ORDER_TIME.AllTime)

  const { network, userId } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
      userId: state.userId,
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

  const updateRate = async () => {
    try {
      if (!crypto) {
        return
      }

      const ids = COINGECKO_IDS[crypto]
      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids,
          currency: currency,
        },
      })
      if (response.result) {
        const rate = response.data?.[ids]?.[currency.toLowerCase()]
        if (!rate || !Number.isFinite(Number(rate))) {
          setSnackSeverity('error')
          setSnackMessage('Could not fetch exchange rate')
          setSnackOpen(true)
          return
        }
        setRate(rate)
        const totalPrice = FormatCryptoAmount(BigDiv((amount as number).toString(), rate), 8)
        setCryptoAmount(totalPrice)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    if (!chainName) return

    const coins = FindTokensByMainnetAndName(network === 'mainnet', chainName as CHAINNAMES)
    setCryptoList(coins)
  }, [chainName])

  useEffect(() => {
    if (crypto && amount && currency && amount > 0) {
      updateRate()
    }
  }, [crypto, amount, currency])

  const checkAmount = (amount: number): boolean => {
    return amount > 0
  }

  const onClickCreateInvoice = async () => {
    if (!checkAmount(amount as number)) {
      setSnackSeverity('error')
      setSnackMessage('Please enter a valid amount')
      setSnackOpen(true)
      return
    }

    if (!CURRENCY.includes(currency)) {
      setSnackSeverity('error')
      setSnackMessage('Please select a valid currency')
      setSnackOpen(true)
      return
    }

    if (!chainName) {
      setSnackSeverity('error')
      setSnackMessage('Please select a network')
      setSnackOpen(true)
      return
    }

    if (!crypto) {
      setSnackSeverity('error')
      setSnackMessage('Please select a cryptocurrency')
      setSnackOpen(true)
      return
    }

    if (!IsValidEmail(buyerEmail)) {
      setSnackSeverity('error')
      setSnackMessage('Please enter a valid email')
      setSnackOpen(true)
      return
    }

    if (metadata !== '' && !IsValidJSON(metadata)) {
      setSnackSeverity('error')
      setSnackMessage('Metadata must be valid JSON')
      setSnackOpen(true)
      return
    }

    if (notificationEmail !== '' && !IsValidEmail(notificationEmail)) {
      setSnackSeverity('error')
      setSnackMessage('Please enter a valid email')
      setSnackOpen(true)
      return
    }

    if (notificationUrl !== '' && !IsValidHTTPUrl(notificationUrl)) {
      setSnackSeverity('error')
      setSnackMessage('Please enter a valid notification URL')
      setSnackOpen(true)
      return
    }

    const ln_amount = amount
    const ln_currency = currency
    const ln_crypto = crypto
    const ln_crypto_amount = cryptoAmount
    const ln_rate = rate
    const ln_desc = description
    const ln_buyer_email = buyerEmail
    const ln_metadata = metadata
    const ln_notification_url = notificationUrl
    const ln_notification_email = notificationEmail
    const ln_show_btc_ln = showBtcLn
    const ln_show_btc_url = showBtcLnUrl

    try {
      const response: any = await axios.post(Http.create_invoice, {
        user_id: userId,
        store_id: storeId,
        chain_id: FindChainIdsByChainNames(chainName),
        network: network === 'mainnet' ? 1 : 2,
        amount: ln_amount,
        currency: ln_currency,
        crypto: ln_crypto,
        crypto_amount: ln_crypto_amount,
        rate: ln_rate,
        description: ln_desc,
        buyer_email: ln_buyer_email,
        metadata: ln_metadata,
        notification_url: ln_notification_url,
        notification_email: ln_notification_email,
        show_btc_ln: ln_show_btc_ln ? 1 : 2,
        show_btc_url: ln_show_btc_url ? 1 : 2,
      })

      if (response.result && response.data.orderId) {
        setSnackSeverity('success')
        setSnackMessage('Created successfully!')
        setSnackOpen(true)
        setTimeout(() => {
          window.location.href = '/payments/invoices/' + response.data.orderId
        }, 2000)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <PageShell>
      {openCreateInvoice ? (
        <div className="space-y-6">
          <PageHeader
            title="Create Invoice"
            description="Issue a fixed-rate invoice that must be paid before it expires."
            actions={
              <>
                <Button variant="outline" onClick={() => setOpenCreateInvoice(false)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={onClickCreateInvoice}>Create</Button>
              </>
            }
          />

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Currency <span className="text-destructive">*</span>
                  </Label>
                  <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY?.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Network <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={chainName}
                    onValueChange={(val) => {
                      const net = val as CHAINNAMES
                      setChainName(net)
                      const coins = FindTokensByMainnetAndName(network === 'mainnet', net)
                      if (coins && coins.length > 0) {
                        setCrypto(coins[0].name as COINS)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CHAINNAMES).map(([_, val], index) => (
                        <SelectItem key={index} value={val}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={GetImgSrcByChain(FindChainIdsByChainNames(val))}
                              alt="icon"
                              width={18}
                              height={18}
                              className="rounded-full h-4 w-4"
                            />
                            <span>{val}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Crypto <span className="text-destructive">*</span>
                  </Label>
                  <Select value={crypto} onValueChange={(val) => setCrypto(val as COINS)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cryptoList?.map((item, index) => (
                        <SelectItem key={index} value={item.name}>
                          <div className="flex items-center gap-2">
                            <Image
                              src={GetImgSrcByCrypto(item.name)}
                              alt="icon"
                              width={18}
                              height={18}
                              className="rounded-full h-4 w-4"
                            />
                            <span>{item.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Rate <span className="text-destructive">*</span>
                  </Label>
                  <Input value={rate} disabled className="bg-muted text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Crypto Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input value={cryptoAmount} disabled className="bg-muted text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="flex items-center gap-0.5">
                  Item Description <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter item description"
                />
              </div>

              {chainName === CHAINNAMES.BITCOIN && (
                <div className="space-y-3 pt-2">
                  <Label className="flex items-center gap-0.5">
                    Supported Transaction Currencies <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-6 pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="btc-chain" checked disabled />
                      <Label htmlFor="btc-chain" className="cursor-pointer">
                        BTC-CHAIN
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="btc-ln"
                        checked={showBtcLn}
                        onCheckedChange={(checked) => setShowBtcLn(!!checked)}
                      />
                      <Label htmlFor="btc-ln" className="cursor-pointer">
                        BTC-LN
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="btc-lnurl"
                        checked={showBtcLnUrl}
                        onCheckedChange={(checked) => setShowBtcLnUrl(!!checked)}
                      />
                      <Label htmlFor="btc-lnurl" className="cursor-pointer">
                        BTC-LNURL
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-xl">
                <Label className="flex items-center gap-0.5">
                  Buyer Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="buyer@example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Additional Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="metadata">
                  <AccordionTrigger className="text-sm font-medium">Metadata</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <CardDescription>
                      Custom data to expand the invoice. This data is a JSON object.
                    </CardDescription>
                    <div className="space-y-1.5 max-w-2xl">
                      <Label className="text-xs">Metadata (JSON)</Label>
                      <Textarea
                        rows={6}
                        value={metadata}
                        onChange={(e) => setMetadata(e.target.value)}
                        placeholder='{\n  "key": "value"\n}'
                        className="font-mono text-xs"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="notifications">
                  <AccordionTrigger className="text-sm font-medium">
                    Invoice Notifications
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2 max-w-2xl">
                    <div className="space-y-2">
                      <Label>Notification URL</Label>
                      <Input
                        value={notificationUrl}
                        onChange={(e) => setNotificationUrl(e.target.value)}
                        placeholder="https://example.com/webhook"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Notification Email</Label>
                      <Input
                        type="email"
                        value={notificationEmail}
                        onChange={(e) => setNotificationEmail(e.target.value)}
                        placeholder="notifications@example.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Receive updates for this invoice.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <PageHeader
            title="Invoices"
            description="Documents issued to buyers at a fixed exchange rate. They must be paid before expiry."
            actions={
              <Button onClick={() => setOpenCreateInvoice(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            }
          />

          <div className="flex flex-col items-stretch gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search order id…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Select value={orderStatus} onValueChange={(val) => setOrderStatus(val)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUS).map(([_, val], index) => (
                    <SelectItem key={index} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={orderTime} onValueChange={(val) => setOrderTime(val)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_TIME).map(([_, val], index) => (
                    <SelectItem key={index} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <InvoiceDataGrid
            source="none"
            orderStatus={orderStatus}
            orderId={search}
            time={orderTime}
          />
        </div>
      )}
    </PageShell>
  )
}

export default PaymentInvoices
