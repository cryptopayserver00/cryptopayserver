import { useRouter } from 'next/router'
import Head from 'next/head'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  HelpCircle,
  Loader2,
  Lock,
  QrCode,
  Store as StoreIcon,
  XCircle,
} from 'lucide-react'

import { useSnackPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { BigAdd, BigCmp, BigDiv, BigMul, BigSub, FormatCryptoAmount } from '@/utils/number'
import {
  CURRENCY_SYMBOLS,
  INVOICE_SOURCE_TYPE,
  ORDER_STATUS,
  PAYMENT_REQUEST_STATUS,
} from '@/packages/constants'
import { COIN } from '@/packages/constants/blockchain'
import HelpDrawer from '@/components/Drawer/HelpDrawer'
import ReportPaymentDialog from '@/components/Dialog/ReportPaymentDialog'
import PullPaymentQRDialog from '@/components/Dialog/PullPaymentQRDialog'
import PaymentRequestSelectChainAndCryptoCard from '@/components/Card/PaymentRequestSelectChainAndCryptoCard'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { PaymentRequestRowType, PaymentRequestType } from '@/utils/types'

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    <span className="text-right text-sm break-all">{value}</span>
  </div>
)

function statusTone(status?: string) {
  switch (status) {
    case PAYMENT_REQUEST_STATUS.Settled:
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    case PAYMENT_REQUEST_STATUS.Expired:
      return 'bg-amber-500/10 text-amber-800 border-amber-200'
    case PAYMENT_REQUEST_STATUS.Archived:
      return 'bg-sky-500/10 text-sky-800 border-sky-200'
    case PAYMENT_REQUEST_STATUS.Pending:
      return 'bg-violet-500/10 text-violet-700 border-violet-200'
    default:
      return 'bg-muted text-foreground border-border'
  }
}

function orderStatusTone(status: string) {
  switch (status) {
    case ORDER_STATUS.Settled:
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    case ORDER_STATUS.Processing:
      return 'bg-sky-500/10 text-sky-800 border-sky-200'
    case ORDER_STATUS.Expired:
      return 'bg-amber-500/10 text-amber-800 border-amber-200'
    default:
      return 'bg-destructive/10 text-destructive border-destructive/20'
  }
}

const PaymentRequestsDetails = () => {
  const router = useRouter()
  const { id, t: accessTokenQuery } = router.query
  const accessToken = String(accessTokenQuery || '')

  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)

  const [paymentRequestData, setPaymentRequestData] = useState<PaymentRequestType>()
  const [paymentRequestRows, setPaymentRequestRows] = useState<PaymentRequestRowType[]>([])
  const [paidAmount, setPaidAmount] = useState('0')

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

  const fiatSymbol = CURRENCY_SYMBOLS[String(paymentRequestData?.currency)] || ''
  const totalAmount = String(paymentRequestData?.amount ?? 0)
  const remaining = useMemo(() => {
    if (BigCmp(totalAmount, paidAmount) <= 0) return '0'
    return FormatCryptoAmount(BigSub(totalAmount, paidAmount), 8)
  }, [totalAmount, paidAmount])

  const progressPct = useMemo(() => {
    if (BigCmp(totalAmount, '0') <= 0) return 0
    const pct = Number(FormatCryptoAmount(BigMul(BigDiv(paidAmount, totalAmount), '100'), 1))
    return Math.min(100, Math.max(0, pct))
  }, [paidAmount, totalAmount])

  const canPay =
    paymentRequestData?.paymentRequestStatus === PAYMENT_REQUEST_STATUS.Pending &&
    BigCmp(remaining, '0') > 0

  const payAmount = useMemo(() => {
    if (paymentRequestData?.showAllowCustomAmount) return remaining
    return FormatCryptoAmount(totalAmount, 8)
  }, [paymentRequestData?.showAllowCustomAmount, remaining, totalAmount])

  const getPaymentHistory = async (storeId: number, network: number, paymentRequestId: number) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_source_type, {
        params: {
          store_id: storeId,
          network: network,
          source_type: INVOICE_SOURCE_TYPE.PaymentRequest,
          external_payment_id: paymentRequestId,
          t: accessToken,
        },
      })

      if (response.result) {
        let paid = '0'
        const rows: PaymentRequestRowType[] = (response.data ?? []).map((item: any) => {
          if (item.orderStatus === ORDER_STATUS.Settled) {
            paid = BigAdd(paid, String(item.amount ?? 0))
          }
          return {
            orderId: item.orderId,
            amount: item.amount,
            currency: item.currency,
            orderStatus: item.orderStatus,
            accessToken: item.accessToken,
          }
        })
        setPaymentRequestRows(rows)
        setPaidAmount(paid)
      }
    } catch (e) {
      console.warn('Payment history unavailable', e)
    }
  }

  const init = useCallback(
    async (requestId: string | number) => {
      try {
        setLoading(true)
        setError('')
        if (typeof window !== 'undefined') {
          setWebsiteUrl(window.location.href)
        }
        if (!requestId) return

        const response: any = await axios.get(Http.find_payment_request_by_id, {
          params: {
            id: requestId,
            t: accessToken,
          },
        })

        if (response.result && response.data) {
          setPaymentRequestData({
            userId: response.data.userId,
            storeId: response.data.storeId,
            storeName: response.data.storeName,
            storeLogoUrl: response.data.storeLogoUrl,
            storeWebsite: response.data.storeWebsite,
            storeBrandColor: response.data.storeBrandColor || '',
            storeCustomCssUrl: response.data.storeCustomCssUrl || '',
            paymentRequestId: response.data.paymentRequestId,
            network: response.data.network,
            title: response.data.title,
            amount: response.data.amount,
            currency: response.data.currency,
            memo: response.data.memo,
            expirationAt: response.data.expirationAt,
            paymentRequestStatus: response.data.paymentRequestStatus,
            requesCustomerData: response.data.requestCustomerData || response.data.requesCustomerData,
            showAllowCustomAmount: response.data.showAllowCustomAmount === 1,
            email: '',
          })
          await getPaymentHistory(
            response.data.storeId,
            response.data.network,
            response.data.paymentRequestId
          )
        } else {
          setError(response.message || 'Could not find the payment request.')
        }
      } catch (e) {
        setError(getApiErrorMessage(e))
        console.error(e)
      } finally {
        setLoading(false)
      }
    },
    [accessToken]
  )

  useEffect(() => {
    if (!id) return
    if (!accessToken) {
      setLoading(false)
      setError('Invalid or missing access token')
      return
    }
    init(String(id))
  }, [id, accessToken, init])

  const onClickCoin = async (item: COIN, cryptoAmount: string, rate: number) => {
    if (!item || !cryptoAmount || !rate) {
      showSnack('error', 'Missing or invalid parameters')
      return
    }

    try {
      setCreating(true)
      const response: any = await axios.post(Http.create_invoice_from_external, {
        user_id: paymentRequestData?.userId,
        store_id: paymentRequestData?.storeId,
        chain_id: item.chainId,
        payment_request_id: paymentRequestData?.paymentRequestId,
        network: paymentRequestData?.network,
        amount: Number(payAmount),
        currency: paymentRequestData?.currency,
        crypto: item.name,
        crypto_amount: cryptoAmount,
        rate: rate,
        email: paymentRequestData?.email,
        access_token: accessToken,
      })

      if (response.result && response.data.orderId) {
        showSnack('success', 'Invoice created')
        const token = response.data.accessToken
          ? `?t=${encodeURIComponent(response.data.accessToken)}`
          : ''
        window.location.href = '/invoices/' + response.data.orderId + token
      } else {
        showSnack('error', response.message || 'Could not create invoice')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(websiteUrl || window.location.href)
    setCopied(true)
    showSnack('success', 'Link copied')
    window.setTimeout(() => setCopied(false), 1600)
  }

  const brandColor =
    paymentRequestData?.storeBrandColor &&
    /^#[0-9A-Fa-f]{3,8}$/.test(paymentRequestData.storeBrandColor)
      ? paymentRequestData.storeBrandColor
      : undefined

  if (loading && !paymentRequestData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading payment request…</p>
      </div>
    )
  }

  if (error && !paymentRequestData) {
    const isRateLimited = /too many requests/i.test(error)
    const isAuthError = /access token|forbidden|unauthorized|invalid or missing/i.test(error)
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            {isRateLimited ? 'Please wait a moment' : 'Unable to open payment request'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          {isAuthError ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Public links need a valid access token (`?t=`).
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => id && init(String(id))}>
            Try again
          </Button>
          {isAuthError ? (
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  if (!paymentRequestData) return null

  return (
    <div className="pb-16 pt-4">
      {paymentRequestData.storeCustomCssUrl ? (
        <Head>
          <link rel="stylesheet" href={paymentRequestData.storeCustomCssUrl} />
        </Head>
      ) : null}

      <div
        className="mx-auto max-w-5xl px-4"
        style={brandColor ? { borderTop: `4px solid ${brandColor}`, paddingTop: '1.25rem' } : undefined}
      >
        {paymentRequestData.network === 2 && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 !text-amber-600" />
            <AlertTitle>Test network</AlertTitle>
            <AlertDescription className="text-amber-800">
              Coins on this network have no real value.{' '}
              <Link href="/freecoin" className="font-medium underline underline-offset-2">
                Get free coins
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {paymentRequestData.paymentRequestStatus === PAYMENT_REQUEST_STATUS.Settled && (
          <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
            <AlertTitle>Settled</AlertTitle>
            <AlertDescription>This payment request has been fully paid.</AlertDescription>
          </Alert>
        )}

        {paymentRequestData.paymentRequestStatus === PAYMENT_REQUEST_STATUS.Expired && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 !text-amber-600" />
            <AlertTitle>Expired</AlertTitle>
            <AlertDescription>New payments are closed for this request.</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {paymentRequestData.storeLogoUrl ? (
              <Image
                alt={paymentRequestData.storeName || 'Store'}
                src={paymentRequestData.storeLogoUrl}
                width={120}
                height={40}
                className="h-10 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <StoreIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              {paymentRequestData.storeWebsite &&
              /^https?:\/\//i.test(String(paymentRequestData.storeWebsite)) ? (
                <Link
                  href={String(paymentRequestData.storeWebsite)}
                  className="truncate font-semibold hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {paymentRequestData.storeName}
                </Link>
              ) : (
                <p className="truncate font-semibold">{paymentRequestData.storeName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Request #{paymentRequestData.paymentRequestId}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {paymentRequestData.network === 2 && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                Test mode
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn('font-medium', statusTone(paymentRequestData.paymentRequestStatus))}
            >
              {paymentRequestData.paymentRequestStatus}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Payment help"
              onClick={() => setOpenDrawer(true)}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Request details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="rounded-xl border bg-muted/30 px-4 py-5">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {fiatSymbol}
                  {FormatCryptoAmount(paymentRequestData.amount, 2)}{' '}
                  <span className="text-xl font-semibold">{paymentRequestData.currency}</span>
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {paymentRequestData.title || 'Payment request'}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Paid {fiatSymbol}{FormatCryptoAmount(paidAmount, 2)}</span>
                    <span>Remaining {fiatSymbol}{remaining}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <DetailRow
                  label="Due date"
                  value={
                    paymentRequestData.expirationAt
                      ? new Date(paymentRequestData.expirationAt).toLocaleString()
                      : 'No due date'
                  }
                />
                {paymentRequestData.memo ? (
                  <DetailRow label="Memo" value={paymentRequestData.memo} />
                ) : null}
              </div>

              <Separator className="my-5" />

              <div>
                <p className="mb-3 text-sm font-medium">Payment history</p>
                {paymentRequestRows.length > 0 ? (
                  <ul className="divide-y rounded-xl border">
                    {paymentRequestRows.map((row) => (
                      <li
                        key={row.orderId}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-3"
                      >
                        <button
                          type="button"
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={() => {
                            const token = row.accessToken
                              ? `?t=${encodeURIComponent(row.accessToken)}`
                              : ''
                            window.location.href = '/invoices/' + row.orderId + token
                          }}
                        >
                          Invoice #{row.orderId}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {CURRENCY_SYMBOLS[row.currency]}
                            {FormatCryptoAmount(row.amount, 2)}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn('font-normal', orderStatusTone(row.orderStatus))}
                          >
                            {row.orderStatus}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No payments yet
                  </p>
                )}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Secured by <span className="font-medium text-foreground">CryptoPayServer</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Link
                    href="https://docs.cryptopayserver.online"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Terms
                  </Link>
                  <span>·</span>
                  <Link
                    href="https://docs.cryptopayserver.online"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Privacy
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {page === 1 ? 'Pay this request' : 'Choose crypto'}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setOpenDialog(true)}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Report
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {page === 1 && (
                <>
                  <div className="rounded-xl border bg-muted/30 px-4 py-4">
                    <p className="text-sm text-muted-foreground">You pay</p>
                    <p className="mt-1 text-2xl font-bold">
                      {fiatSymbol}
                      {FormatCryptoAmount(payAmount, 2)}{' '}
                      {paymentRequestData.currency}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {BigCmp(paidAmount, '0') > 0
                        ? `Already paid ${fiatSymbol}${FormatCryptoAmount(paidAmount, 2)}`
                        : paymentRequestData.expirationAt
                          ? `Due ${new Date(paymentRequestData.expirationAt).toLocaleString()}`
                          : 'No due date'}
                    </p>
                  </div>

                  {canPay ? (
                    <Button size="lg" className="w-full" onClick={() => setPage(2)}>
                      Continue to pay
                    </Button>
                  ) : (
                    <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                      {paymentRequestData.paymentRequestStatus === PAYMENT_REQUEST_STATUS.Pending
                        ? 'Nothing left to pay.'
                        : 'Payments are closed for this request status.'}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="gap-1.5" onClick={copyLink}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </Button>
                    <Button variant="outline" className="gap-1.5" onClick={() => setShowQR(true)}>
                      <QrCode className="h-4 w-4" />
                      Show QR
                    </Button>
                  </div>
                </>
              )}

              {page === 2 && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 gap-1.5"
                    onClick={() => setPage(1)}
                    disabled={creating}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  {creating ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating invoice…
                    </div>
                  ) : (
                    <PaymentRequestSelectChainAndCryptoCard
                      storeId={Number(paymentRequestData.storeId)}
                      network={Number(paymentRequestData.network)}
                      amount={Number(payAmount)}
                      currency={String(paymentRequestData.currency)}
                      onClickCoin={onClickCoin}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
        <PullPaymentQRDialog
          openDialog={showQR}
          setOpenDialog={setShowQR}
          websiteUrl={websiteUrl || (typeof window !== 'undefined' ? window.location.href : '')}
        />
      </div>
    </div>
  )
}

export default PaymentRequestsDetails
