import { useState } from 'react'
import { Info, ArrowLeft, Plus, Search } from 'lucide-react'
import dayjs from 'dayjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CURRENCY, PAYMENT_REQUEST_STATUS, REQUEST_CUSTOMER_DATA } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import PaymentRequestDataGrid from '@/components/DataList/PaymentRequestDataGrid'
import { IsValidEmail } from '@/utils/verify'
import { useShallow } from 'zustand/react/shallow'

const formatForDateTimeInput = (date?: Date | dayjs.Dayjs) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DDTHH:mm')
}

const Requests = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)
  const [openCreateRequest, setOpenCreateRequest] = useState<boolean>(false)

  const [title, setTitle] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>(CURRENCY[0])
  const [showAllowCustomAmount, setShowAllowCustomAmount] = useState<boolean>(false)
  const [expirationDateStr, setExpirationDateStr] = useState<string>(
    formatForDateTimeInput(dayjs().add(7, 'day'))
  )
  const [email, setEmail] = useState<string>('')
  const [requestCustomerData, setRequestCustomerData] = useState<string>(REQUEST_CUSTOMER_DATA[0])
  const [memo, setMemo] = useState<string>('')
  const [paymentRequestStatus, setPaymentRequestStatus] = useState<string>(
    PAYMENT_REQUEST_STATUS.AllStatus
  )
  const [search, setSearch] = useState<string>('')

  const [showTitleAlert, setShowTitleAlert] = useState<boolean>(false)
  const [showAmountAlert, setShowAmountAlert] = useState<boolean>(false)
  const [showExpiredAlert, setShowExpiredAlert] = useState<boolean>(false)

  const { userId, network } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
      network: state.network,
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

  const clearData = () => {
    setTitle('')
    setAmount(0)
    setCurrency(CURRENCY[0])
    setShowAllowCustomAmount(false)
    setExpirationDateStr(formatForDateTimeInput(dayjs().add(7, 'day')))
    setEmail('')
    setRequestCustomerData(REQUEST_CUSTOMER_DATA[0])
    setMemo('')
    setShowTitleAlert(false)
    setShowAmountAlert(false)
    setShowExpiredAlert(false)
  }

  const checkTitle = (): boolean => {
    if (title && title.trim() !== '') {
      setShowTitleAlert(false)
      return true
    }
    setShowTitleAlert(true)
    return false
  }

  const checkAmount = (): boolean => {
    if (amount && amount > 0) {
      setShowAmountAlert(false)
      return true
    }
    setShowAmountAlert(true)
    return false
  }

  const checkExpirationDate = (): boolean => {
    if (expirationDateStr) {
      const expire = new Date(expirationDateStr).getTime()
      if (expire <= new Date().getTime()) {
        setShowExpiredAlert(true)
        return false
      }
    } else {
      setShowExpiredAlert(true)
      return false
    }
    setShowExpiredAlert(false)
    return true
  }

  const onClickCreate = async () => {
    try {
      if (!CURRENCY.includes(currency)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect currency')
        setSnackOpen(true)
        return
      }

      if (!checkTitle()) {
        return
      }

      if (!checkAmount()) {
        return
      }

      if (!checkExpirationDate()) {
        return
      }

      let expire = 0
      if (expirationDateStr) {
        expire = new Date(expirationDateStr).getTime()
      }

      if (!IsValidEmail(email)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect email input')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.post(Http.create_payment_request, {
        user_id: userId,
        store_id: storeId,
        network: network === 'mainnet' ? 1 : 2,
        title: title,
        amount: amount,
        currency: currency,
        show_allow_custom_amount: showAllowCustomAmount ? 1 : 2,
        expiration_date: expire,
        email: email,
        request_customer_data: requestCustomerData,
        memo: memo,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful create!')
        setSnackOpen(true)

        clearData()
        setOpenCreateRequest(false)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Something wrong, please try it again')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {openCreateRequest ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Payment Requests
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenCreateRequest(false)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={onClickCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Payment Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-0.5">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (showTitleAlert && e.target.value) setShowTitleAlert(false)
                  }}
                  placeholder="Enter request title"
                />
                {showTitleAlert && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    The Title field is required.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value))
                      if (showAmountAlert && Number(e.target.value) > 0) setShowAmountAlert(false)
                    }}
                    placeholder="0.00"
                  />
                  {showAmountAlert && (
                    <p className="text-xs text-destructive font-medium mt-1">
                      Please provide an amount greater than 0
                    </p>
                  )}
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
                      {CURRENCY &&
                        CURRENCY.length > 0 &&
                        CURRENCY.map((item, index) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Switch
                  id="allow-custom-amount"
                  checked={showAllowCustomAmount}
                  onCheckedChange={(checked) => setShowAllowCustomAmount(checked)}
                />
                <Label htmlFor="allow-custom-amount" className="cursor-pointer font-normal text-sm">
                  Allow payee to create invoices with custom amounts
                </Label>
              </div>

              <div className="space-y-2 max-w-sm">
                <Label className="flex items-center gap-0.5">
                  Expiration Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={expirationDateStr}
                  onChange={(e) => {
                    setExpirationDateStr(e.target.value)
                    if (showExpiredAlert) setShowExpiredAlert(false)
                  }}
                />
                {showExpiredAlert && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    Expired time is incorrect
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-0.5">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will send notification mails to the recipient, as configured by the{' '}
                  <Link
                    href="/settings?tab=emails"
                    className="text-primary underline hover:text-primary/80"
                  >
                    email rules.
                  </Link>
                </p>
              </div>

              <div className="space-y-2 max-w-sm">
                <Label>Request customer data on checkout</Label>
                <Select
                  value={requestCustomerData}
                  onValueChange={(val) => setRequestCustomerData(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_CUSTOMER_DATA &&
                      REQUEST_CUSTOMER_DATA.length > 0 &&
                      REQUEST_CUSTOMER_DATA.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Memo</Label>
                <Textarea
                  rows={6}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Add memo or internal notes..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Payment Requests
              </h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setOpenExplain(!openExplain)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setOpenCreateRequest(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Request
            </Button>
          </div>

          {openExplain && (
            <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Info</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
                Payment requests are persistent shareable pages that enable the receiver to pay at
                their convenience.
                <br />
                Funds are paid to a payment request at the current exchange rate.
                <br />
                Requests may be paid in partial. They will remain valid until time expires or when
                paid what is due.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search payment request id ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={paymentRequestStatus}
                onValueChange={(val) => setPaymentRequestStatus(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_REQUEST_STATUS &&
                    Object.entries(PAYMENT_REQUEST_STATUS).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2">
            <PaymentRequestDataGrid
              source="none"
              paymentRequestId={search}
              paymentRequestStatus={paymentRequestStatus}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Requests
