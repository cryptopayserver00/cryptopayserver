import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  HelpCircle,
  Loader2,
  Lock,
  QrCode,
  Store,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useSnackPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { BigAdd, BigCmp, BigDiv, BigMul, BigSub, FormatCryptoAmount } from '@/utils/number'
import {
  CURRENCY_SYMBOLS,
  PAYOUT_SOURCE_TYPE,
  PAYOUT_STATUS,
  PULL_PAYMENT_STATUS,
} from '@/packages/constants'
import { CHAINS, COIN } from '@/packages/constants/blockchain'
import { FindChainNamesByChains, GetBlockchainTxUrlByChainIds } from '@/utils/web3'
import { OmitMiddleString } from '@/utils/strings'
import PullPaymentSelectChainAndCryptoCard from '@/components/Card/PullPaymentSelectChainAndCryptoCard'
import PullPaymentQRDialog from '@/components/Dialog/PullPaymentQRDialog'
import HelpDrawer from '@/components/Drawer/HelpDrawer'
import ReportPaymentDialog from '@/components/Dialog/ReportPaymentDialog'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { PayoutRowType, PullPaymentType } from '@/utils/types'

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    <span className="text-right text-sm break-all">{value}</span>
  </div>
)

function statusTone(status?: string) {
  switch (status) {
    case PULL_PAYMENT_STATUS.Active:
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    case PULL_PAYMENT_STATUS.Settled:
      return 'bg-sky-500/10 text-sky-800 border-sky-200'
    case PULL_PAYMENT_STATUS.Expired:
      return 'bg-amber-500/10 text-amber-800 border-amber-200'
    case PULL_PAYMENT_STATUS.Archived:
      return 'bg-muted text-foreground border-border'
    case PULL_PAYMENT_STATUS.Future:
      return 'bg-violet-500/10 text-violet-700 border-violet-200'
    default:
      return 'bg-muted text-foreground border-border'
  }
}

function payoutStatusTone(status: string) {
  switch (status) {
    case PAYOUT_STATUS.Completed:
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    case PAYOUT_STATUS.Cancelled:
      return 'bg-destructive/10 text-destructive border-destructive/20'
    case PAYOUT_STATUS.AwaitingApproval:
    case PAYOUT_STATUS.AwaitingPayment:
    case PAYOUT_STATUS.InProgress:
      return 'bg-sky-500/10 text-sky-800 border-sky-200'
    default:
      return 'bg-muted text-foreground border-border'
  }
}

const PullPaymentsDetails = () => {
  const router = useRouter()
  const { id, t: accessTokenQuery } = router.query
  const accessToken = String(accessTokenQuery || '')

  const [page, setPage] = useState(1)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [claiming, setClaiming] = useState(false)
  const [copied, setCopied] = useState(false)

  const [pullPaymentData, setPullPaymentData] = useState<PullPaymentType>()
  const [payoutRows, setPayoutRows] = useState<PayoutRowType[]>([])
  const [alreadyClaim, setAlreadyClaim] = useState('0')
  const [showQR, setShowQR] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)

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

  const fiatSymbol = CURRENCY_SYMBOLS[String(pullPaymentData?.currency)] || ''
  const claimLimit = String(pullPaymentData?.amount ?? 0)
  const availableClaim = useMemo(() => {
    if (BigCmp(claimLimit, alreadyClaim) <= 0) return '0'
    return FormatCryptoAmount(BigSub(claimLimit, alreadyClaim), 8)
  }, [claimLimit, alreadyClaim])

  const progressPct = useMemo(() => {
    if (BigCmp(claimLimit, '0') <= 0) return 0
    const pct = Number(FormatCryptoAmount(BigMul(BigDiv(alreadyClaim, claimLimit), '100'), 1))
    return Math.min(100, Math.max(0, pct))
  }, [alreadyClaim, claimLimit])

  const canClaim = pullPaymentData?.pullPaymentStatus === PULL_PAYMENT_STATUS.Active

  const getClaimsHistory = async (storeId: number, network: number, pullPaymentId: number) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_source_type, {
        params: {
          store_id: storeId,
          network: network,
          source_type: PAYOUT_SOURCE_TYPE.PullPayment,
          external_payment_id: pullPaymentId,
          t: accessToken,
        },
      })

      if (response.result) {
        let paid = '0'
        const rows: PayoutRowType[] = (response.data ?? []).map((item: any) => {
          if (item.payoutStatus !== PAYOUT_STATUS.Cancelled) {
            paid = BigAdd(paid, String(item.amount ?? 0))
          }
          return {
            chain: item.chainId,
            chainName: FindChainNamesByChains(item.chainId as CHAINS),
            address: item.address,
            amount: item.amount,
            cryptoAmount: item.cryptoAmount,
            crypto: item.crypto,
            currency: item.currency,
            tx: item.tx,
            status: item.payoutStatus,
          }
        })
        setPayoutRows(rows)
        setAlreadyClaim(paid)
      }
    } catch (e) {
      console.warn('Claims history unavailable', e)
    }
  }

  const init = useCallback(
    async (pullId: string | number) => {
      try {
        setLoading(true)
        setError('')
        if (typeof window !== 'undefined') {
          setWebsiteUrl(window.location.href)
        }
        if (!pullId) return

        const response: any = await axios.get(Http.find_pull_payment_by_id, {
          params: {
            id: pullId,
            t: accessToken,
          },
        })

        if (response.result && response.data) {
          setPullPaymentData({
            userId: response.data.userId,
            storeId: response.data.storeId,
            network: response.data.network,
            pullPaymentId: response.data.pullPaymentId,
            name: response.data.name,
            storeName: response.data.storeName,
            storeLogoUrl: response.data.storeLogoUrl,
            storeWebsite: response.data.storeWebsite,
            storeBrandColor: response.data.storeBrandColor || '',
            storeCustomCssUrl: response.data.storeCustomCssUrl || '',
            amount: response.data.amount,
            currency: response.data.currency,
            description: response.data.description,
            showAutoApproveClaim: response.data.showAutoApproveClaim === 1,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
            expirationAt: response.data.expirationAt,
            pullPaymentStatus: response.data.pullPaymentStatus,
          })
          await getClaimsHistory(
            response.data.storeId,
            response.data.network,
            response.data.pullPaymentId
          )
        } else {
          setError(response.message || 'Could not find the pull payment.')
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

  const onClickCoin = async (item: COIN, address: string, amount: number) => {
    if (!item || !address || !amount) {
      showSnack('error', 'Missing or invalid parameters')
      return
    }

    if (BigCmp(String(amount), availableClaim) > 0) {
      showSnack('error', `Available claim is ${fiatSymbol}${availableClaim}`)
      return
    }

    try {
      setClaiming(true)
      const response: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: item.chainId,
          address: address,
          network: pullPaymentData?.network,
        },
      })

      if (!response.result) {
        showSnack('error', 'The address is invalid. Please try again.')
        return
      }

      const create_payout_resp: any = await axios.post(Http.create_payout, {
        user_id: pullPaymentData?.userId,
        store_id: pullPaymentData?.storeId,
        network: pullPaymentData?.network,
        chain_id: item.chainId,
        address: address,
        source_type: PAYOUT_SOURCE_TYPE.PullPayment,
        amount: amount,
        currency: pullPaymentData?.currency,
        crypto: item.name,
        external_payment_id: pullPaymentData?.pullPaymentId,
        access_token: accessToken,
      })

      if (create_payout_resp.result) {
        showSnack('success', 'Claim submitted')
        await init(String(id))
        setPage(1)
      } else {
        showSnack('error', create_payout_resp.message || 'Could not create claim')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setClaiming(false)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(websiteUrl || window.location.href)
    setCopied(true)
    showSnack('success', 'Link copied')
    window.setTimeout(() => setCopied(false), 1600)
  }

  const brandColor =
    pullPaymentData?.storeBrandColor && /^#[0-9A-Fa-f]{3,8}$/.test(pullPaymentData.storeBrandColor)
      ? pullPaymentData.storeBrandColor
      : undefined

  if (loading && !pullPaymentData) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading pull payment…</p>
      </div>
    )
  }

  if (error && !pullPaymentData) {
    const isRateLimited = /too many requests/i.test(error)
    const isAuthError = /access token|forbidden|unauthorized|invalid or missing/i.test(error)
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            {isRateLimited ? 'Please wait a moment' : 'Unable to open pull payment'}
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

  if (!pullPaymentData) return null

  return (
    <div className="pb-16 pt-4">
      {pullPaymentData.storeCustomCssUrl ? (
        <Head>
          <link rel="stylesheet" href={pullPaymentData.storeCustomCssUrl} />
        </Head>
      ) : null}

      <div
        className="mx-auto max-w-5xl px-4"
        style={brandColor ? { borderTop: `4px solid ${brandColor}`, paddingTop: '1.25rem' } : undefined}
      >
        {pullPaymentData.network === 2 && (
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

        {pullPaymentData.pullPaymentStatus === PULL_PAYMENT_STATUS.Settled && (
          <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
            <AlertTitle>Settled</AlertTitle>
            <AlertDescription>This pull payment has been fully claimed.</AlertDescription>
          </Alert>
        )}

        {pullPaymentData.pullPaymentStatus === PULL_PAYMENT_STATUS.Expired && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 !text-amber-600" />
            <AlertTitle>Expired</AlertTitle>
            <AlertDescription>New claims are closed for this pull payment.</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {pullPaymentData.storeLogoUrl ? (
              <Image
                alt={pullPaymentData.storeName || 'Store'}
                src={pullPaymentData.storeLogoUrl}
                width={120}
                height={40}
                className="h-10 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Store className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              {pullPaymentData.storeWebsite &&
              /^https?:\/\//i.test(String(pullPaymentData.storeWebsite)) ? (
                <Link
                  href={String(pullPaymentData.storeWebsite)}
                  className="truncate font-semibold hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {pullPaymentData.storeName}
                </Link>
              ) : (
                <p className="truncate font-semibold">{pullPaymentData.storeName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Pull payment #{pullPaymentData.pullPaymentId}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pullPaymentData.network === 2 && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                Test mode
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn('font-medium', statusTone(pullPaymentData.pullPaymentStatus))}
            >
              {pullPaymentData.pullPaymentStatus}
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
              <CardTitle className="text-base">Pull payment details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="rounded-xl border bg-muted/30 px-4 py-5">
                <p className="text-sm text-muted-foreground">Claim limit</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {fiatSymbol}
                  {FormatCryptoAmount(pullPaymentData.amount, 2)}{' '}
                  <span className="text-xl font-semibold">{pullPaymentData.currency}</span>
                </p>
                <p className="mt-1 text-sm font-medium">{pullPaymentData.name || 'Pull payment'}</p>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Claimed {fiatSymbol}
                      {FormatCryptoAmount(alreadyClaim, 2)}
                    </span>
                    <span>
                      Available {fiatSymbol}
                      {availableClaim}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <DetailRow
                  label="Created"
                  value={
                    pullPaymentData.createdAt
                      ? new Date(pullPaymentData.createdAt).toLocaleString()
                      : '—'
                  }
                />
                <DetailRow
                  label="Due date"
                  value={
                    pullPaymentData.expirationAt
                      ? new Date(pullPaymentData.expirationAt).toLocaleString()
                      : 'No due date'
                  }
                />
                {pullPaymentData.description ? (
                  <DetailRow label="Description" value={pullPaymentData.description} />
                ) : null}
              </div>

              <Separator className="my-5" />

              <div>
                <p className="mb-3 text-sm font-medium">Claims</p>
                {payoutRows.length > 0 ? (
                  <ul className="divide-y rounded-xl border">
                    {payoutRows.map((row, index) => (
                      <li key={`${row.address}-${index}`} className="space-y-2 px-3 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-mono text-xs text-muted-foreground">
                              {OmitMiddleString(row.address, 10)}
                            </p>
                            <p className="mt-0.5 text-sm font-medium">
                              {row.chainName} · {FormatCryptoAmount(row.cryptoAmount, 8)} {row.crypto}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {CURRENCY_SYMBOLS[row.currency]}
                              {FormatCryptoAmount(row.amount, 2)}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn('font-normal', payoutStatusTone(row.status))}
                            >
                              {row.status}
                            </Badge>
                          </div>
                        </div>
                        {row.tx ? (
                          <Link
                            href={GetBlockchainTxUrlByChainIds(
                              pullPaymentData.network === 1,
                              row.chain,
                              row.tx
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {OmitMiddleString(row.tx, 8)}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                    No claims yet
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
                  {page === 1 ? 'Claim funds' : 'Choose destination'}
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
                  <div className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/30 p-3 text-center">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Available</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-600">
                        {fiatSymbol}
                        {availableClaim}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Claimed</p>
                      <p className="mt-1 text-sm font-semibold">
                        {fiatSymbol}
                        {FormatCryptoAmount(alreadyClaim, 2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground">Limit</p>
                      <p className="mt-1 text-sm font-semibold">
                        {fiatSymbol}
                        {FormatCryptoAmount(pullPaymentData.amount, 2)}
                      </p>
                    </div>
                  </div>

                  {canClaim && BigCmp(availableClaim, '0') > 0 ? (
                    <Button size="lg" className="w-full" onClick={() => setPage(2)}>
                      Claim funds
                    </Button>
                  ) : (
                    <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                      {canClaim ? 'Nothing left to claim.' : 'Claims are closed for this status.'}
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
                    disabled={claiming}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  {claiming ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting claim…
                    </div>
                  ) : (
                    <PullPaymentSelectChainAndCryptoCard
                      storeId={Number(pullPaymentData.storeId)}
                      network={Number(pullPaymentData.network)}
                      amount={Number(availableClaim)}
                      currency={String(pullPaymentData.currency)}
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

export default PullPaymentsDetails
