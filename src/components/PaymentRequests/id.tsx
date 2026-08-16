import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AlertTriangle, HelpCircle, Lock, Store as StoreIcon } from 'lucide-react'

import { useSnackPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import {
  CURRENCY_SYMBOLS,
  INVOICE_SOURCE_TYPE,
  ORDER_STATUS,
  PAYMENT_REQUEST_STATUS,
} from '@/packages/constants'
import { COIN } from '@/packages/constants/blockchain'
import HelpDrawer from '@/components/Drawer/HelpDrawer'
import ReportPaymentDialog from '@/components/Dialog/ReportPaymentDialog'
import PaymentRequestSelectChainAndCryptoCard from '@/components/Card/PaymentRequestSelectChainAndCryptoCard'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { PaymentRequestRowType, PaymentRequestType } from '@/utils/types'

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-muted-foreground">{label}</span>
    <span>{value}</span>
  </div>
)

const orderStatusBadgeClass = (status: string) => {
  switch (status) {
    case ORDER_STATUS.Settled:
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case ORDER_STATUS.Processing:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case ORDER_STATUS.Expired:
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100'
    default:
      return 'bg-red-100 text-red-800 hover:bg-red-100'
  }
}

const requestStatusAlertClass = (status?: string) => {
  switch (status) {
    case PAYMENT_REQUEST_STATUS.Expired:
      return 'bg-amber-500 text-white [&_svg]:text-white'
    case PAYMENT_REQUEST_STATUS.Settled:
      return 'bg-green-600 text-white [&_svg]:text-white'
    case PAYMENT_REQUEST_STATUS.Archived:
    default:
      return 'bg-blue-600 text-white [&_svg]:text-white'
  }
}

const PaymentRequestsDetails = () => {
  const router = useRouter()
  const { id } = router.query

  const [page, setPage] = useState<number>(1)

  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const [paymentRequestData, setPaymentRequestData] = useState<PaymentRequestType>()
  const [paymentRequestRows, setPaymentRequestRows] = useState<PaymentRequestRowType[]>([])
  const [paidAmount, setPaidAmount] = useState<number>(0)

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

  const getPaymentHistory = async (storeId: number, network: number, paymentRequestId: number) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_source_type, {
        params: {
          store_id: storeId,
          network: network,
          source_type: INVOICE_SOURCE_TYPE.PaymentRequest,
          external_payment_id: paymentRequestId,
        },
      })

      if (response.result) {
        let paid = 0
        const rows: PaymentRequestRowType[] = (response.data ?? []).map((item: any) => {
          if (item.orderStatus === ORDER_STATUS.Settled) {
            paid += parseFloat(item.amount)
          }

          return {
            orderId: item.orderId,
            amount: item.amount,
            currency: item.currency,
            orderStatus: item.orderStatus,
          }
        })

        setPaymentRequestRows(rows)
        setPaidAmount(paid)
      } else {
        showSnack('error', 'Can not find the data on site!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const init = async (id: any) => {
    try {
      if (!id) return

      const response: any = await axios.get(Http.find_payment_request_by_id, {
        params: {
          id: id,
        },
      })

      if (response.result) {
        setPaymentRequestData({
          userId: response.data.userId,
          storeId: response.data.storeId,
          storeName: response.data.storeName,
          storeLogoUrl: response.data.storeLogoUrl,
          storeWebsite: response.data.storeWebsite,
          paymentRequestId: response.data.paymentRequestId,
          network: response.data.network,
          title: response.data.title,
          amount: response.data.amount,
          currency: response.data.currency,
          memo: response.data.memo,
          expirationDate: new Date(response.data.expirationAt).getTime(),
          paymentRequestStatus: response.data.paymentRequestStatus,
          requesCustomerData: response.data.requesCustomerData,
          showAllowCustomAmount: response.data.showAllowCustomAmount === 1 ? true : false,
          email: response.data.email,
        })

        await getPaymentHistory(
          response.data.storeId,
          response.data.network,
          response.data.paymentRequestId
        )
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  useEffect(() => {
    id && init(id)
  }, [id])

  const onClickCoin = async (item: COIN, cryptoAmount: string, rate: number) => {
    if (!item || !cryptoAmount || !rate) {
      showSnack('error', 'Incorrect parameters')
      return
    }

    try {
      const response: any = await axios.post(Http.create_invoice_from_external, {
        user_id: paymentRequestData?.userId,
        store_id: paymentRequestData?.storeId,
        chain_id: item.chainId,
        payment_request_id: paymentRequestData?.paymentRequestId,
        network: paymentRequestData?.network,
        amount: paymentRequestData?.amount,
        currency: paymentRequestData?.currency,
        crypto: item.name,
        crypto_amount: cryptoAmount,
        rate: rate,
        email: paymentRequestData?.email,
      })

      if (response.result && response.data.orderId) {
        showSnack('success', 'Successful creation!')

        setTimeout(() => {
          window.location.href = '/invoices/' + response.data.orderId
        }, 1000)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  return (
    <div className="mt-4">
      <div className="mx-auto max-w-screen-xl px-4">
        {paymentRequestData?.network === 2 && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 !text-amber-600" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription className="text-amber-800">
              This is a test network, and the currency has no real value. If you need free coins,
              you can get them{' '}
              <Link
                href="/freecoin"
                target="_blank"
                className="font-medium underline underline-offset-2"
              >
                here.
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {paymentRequestData &&
          paymentRequestData.paymentRequestStatus !== PAYMENT_REQUEST_STATUS.Pending && (
            <Alert
              className={cn(
                'mb-4 border-transparent',
                requestStatusAlertClass(paymentRequestData.paymentRequestStatus)
              )}
            >
              <AlertDescription>
                The payment request has been {paymentRequestData.paymentRequestStatus}, and you can
                read the detail of the history.
              </AlertDescription>
            </Alert>
          )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {paymentRequestData?.storeLogoUrl ? (
                  <Image
                    alt="logo"
                    src={paymentRequestData.storeLogoUrl}
                    width={100}
                    height={40}
                    className="h-10 w-25"
                  />
                ) : (
                  <StoreIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <Link href={String(paymentRequestData?.storeWebsite)} className="hover:underline">
                  {paymentRequestData?.storeName}
                </Link>
                {paymentRequestData?.network === 2 && (
                  <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">
                    TestMode
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                aria-label="help"
                onClick={() => setOpenDrawer(true)}
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-6">
              <span className="text-3xl font-bold">
                {CURRENCY_SYMBOLS[String(paymentRequestData?.currency)]}
                {paymentRequestData?.amount}
              </span>
            </div>

            <Separator className="my-8" />

            <div>
              <p className="font-medium">Payment Request Information</p>
              <div className="mt-4 space-y-1">
                <DetailRow
                  label="Title"
                  value={paymentRequestData?.title ? paymentRequestData.title : 'None'}
                />
                <DetailRow
                  label="Payment Request"
                  value={
                    paymentRequestData?.paymentRequestId
                      ? paymentRequestData.paymentRequestId
                      : 'None'
                  }
                />
                <DetailRow
                  label="Due Date"
                  value={
                    paymentRequestData?.expirationDate
                      ? new Date(Number(paymentRequestData.expirationDate)).toLocaleString()
                      : 'No due date'
                  }
                />
              </div>
            </div>

            <Separator className="my-8" />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentRequestRows && paymentRequestRows.length > 0 ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice Id</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentRequestRows.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Button
                                variant="link"
                                className="h-auto p-0"
                                onClick={() => {
                                  window.location.href = '/invoices/' + row.orderId
                                }}
                              >
                                {row.orderId}
                              </Button>
                            </TableCell>
                            <TableCell>
                              {CURRENCY_SYMBOLS[row.currency]}
                              {row.amount}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  'border-transparent',
                                  orderStatusBadgeClass(row.orderStatus)
                                )}
                              >
                                {row.orderStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No payments have been made yet.</p>
                )}
              </CardContent>
            </Card>

            <div className="mt-16 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Secured by</span>
                <span className="font-semibold text-foreground">CryptoPayServer</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm">
                <Link href="#" className="hover:underline">
                  Terms
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link href="#" className="hover:underline">
                  Privacy
                </Link>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="font-medium">Payment Method</p>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                onClick={() => setOpenDialog(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report
              </Button>
            </div>

            <div className="mt-4">
              {page === 1 && (
                <Card>
                  <CardContent className="pt-6">
                    <span className="text-2xl font-bold">
                      {CURRENCY_SYMBOLS[String(paymentRequestData?.currency)]}
                      {paymentRequestData?.amount}
                    </span>

                    <p className="mt-1 text-muted-foreground">
                      {paymentRequestData?.expirationDate
                        ? new Date(Number(paymentRequestData.expirationDate)).toLocaleString()
                        : 'No due date'}
                    </p>

                    {paymentRequestData?.paymentRequestStatus ===
                      PAYMENT_REQUEST_STATUS.Pending && (
                      <Button
                        size="lg"
                        className="mt-4 w-full bg-green-600 hover:bg-green-700"
                        onClick={() => setPage(2)}
                      >
                        Pay Invoice
                      </Button>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="outline" className="w-full" onClick={() => window.print()}>
                        Print
                      </Button>

                      <Button
                        className="w-full"
                        onClick={async () => {
                          await navigator.clipboard.writeText(window.location.href)
                          showSnack('success', 'Successfully copy')
                        }}
                      >
                        Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {page === 2 && (
                <div className="mt-2">
                  <div className="text-right">
                    <Button size="lg" onClick={() => setPage(1)}>
                      Back
                    </Button>
                  </div>

                  <div className="mt-1">
                    <PaymentRequestSelectChainAndCryptoCard
                      storeId={Number(paymentRequestData?.storeId)}
                      network={Number(paymentRequestData?.network)}
                      amount={Number(paymentRequestData?.amount)}
                      currency={String(paymentRequestData?.currency)}
                      onClickCoin={onClickCoin}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
      </div>
    </div>
  )
}

export default PaymentRequestsDetails
