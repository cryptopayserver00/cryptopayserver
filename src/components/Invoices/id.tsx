import { useRouter } from 'next/router'
import Head from 'next/head'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  HelpCircle,
  Loader2,
  Lock,
  Store as StoreIcon,
  XCircle,
} from 'lucide-react'

import { useSnackPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { FormatCryptoAmount, FormatCryptoDisplay } from '@/utils/number'
import { OmitMiddleString } from '@/utils/strings'
import { CURRENCY_SYMBOLS, ORDER_STATUS } from '@/packages/constants'
import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode'
import {
  FindChainNamesByChains,
  FindTokenByChainIdsAndSymbol,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
  GetChainIds,
  IsEvmWalletConnectChain,
} from '@/utils/web3'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import WalletConnectButton from '@/components/Button/WalletConnectButton'
import HelpDrawer from '@/components/Drawer/HelpDrawer'
import ReportPaymentDialog from '@/components/Dialog/ReportPaymentDialog'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'
import { OrderType } from '@/utils/types'

const DetailRow = ({
  label,
  value,
  bold = false,
}: {
  label: string
  value: React.ReactNode
  bold?: boolean
}) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
    <span className={cn('text-right text-sm break-all', bold && 'font-semibold')}>{value}</span>
  </div>
)

function statusTone(status?: string) {
  switch (status) {
    case ORDER_STATUS.Settled:
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    case ORDER_STATUS.Expired:
      return 'bg-amber-500/10 text-amber-800 border-amber-200'
    case ORDER_STATUS.Invalid:
      return 'bg-destructive/10 text-destructive border-destructive/20'
    case ORDER_STATUS.Processing:
      return 'bg-sky-500/10 text-sky-800 border-sky-200'
    default:
      return 'bg-muted text-foreground border-border'
  }
}

const InvoiceDetails = () => {
  const router = useRouter()
  const { id, t: accessTokenQuery } = router.query
  const accessToken = String(accessTokenQuery || '')

  const [countdownVal, setCountdownVal] = useState<string>('')
  const [countdownUrgent, setCountdownUrgent] = useState(false)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [copiedKey, setCopiedKey] = useState<string>('')

  const [order, setOrder] = useState<OrderType>()
  const [crypto, setCrypto] = useState<COINS>()
  const [qrCode, setQrCode] = useState<string>('')
  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const orderRef = useRef<OrderType | undefined>(undefined)

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

  const applyPaymentMethod = useCallback((data: OrderType, preferLn = false) => {
    if (preferLn && data.lightningInvoice) {
      setCrypto(COINS.BTC_LN)
      setQrCode(String(data.qrLightningCodeText || `lightning:${data.lightningInvoice}`))
      setDestinationAddress(String(data.lightningInvoice))
      return
    }
    setCrypto(data.crypto as COINS)
    setQrCode(String(data.qrCodeText || ''))
    setDestinationAddress(String(data.destinationAddress || ''))
  }, [])

  const init = useCallback(
    async (invoiceId: string | number, opts?: { silent?: boolean; preferLn?: boolean }) => {
      try {
        if (!opts?.silent) {
          setLoading(true)
          setError('')
        }

        const response: any = await axios.get(Http.find_invoice_by_id, {
          params: {
            id: invoiceId,
            t: accessToken,
          },
        })

        if (response.result && response.data) {
          const data = response.data as OrderType
          const firstLoad = !orderRef.current
          setOrder(data)
          orderRef.current = data
          if (firstLoad) {
            applyPaymentMethod(data, Boolean(opts?.preferLn))
          }
          setError('')
        } else if (!opts?.silent) {
          setError(response.message || 'Could not find the invoice.')
          showSnack('error', response.message || 'Could not find the invoice.')
        }
      } catch (e) {
        const message = getApiErrorMessage(e)
        const status = Number((e as any)?.response?.status || 0)
        // Silent status polls must not wipe a working checkout on transient 429s
        if (opts?.silent) {
          if (status !== 429) console.warn('Invoice poll failed', message)
          return
        }
        setError(message)
        showSnack('error', message)
        console.error(e)
      } finally {
        if (!opts?.silent) setLoading(false)
      }
    },
    [accessToken, applyPaymentMethod]
  )

  useEffect(() => {
    if (!id) return
    init(String(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when invoice/token changes
  }, [id, accessToken])

  useEffect(() => {
    if (!id || !order) return
    if (
      order.orderStatus === ORDER_STATUS.Settled ||
      order.orderStatus === ORDER_STATUS.Expired ||
      order.orderStatus === ORDER_STATUS.Invalid
    ) {
      return
    }

    const timer = setInterval(() => {
      init(String(id), { silent: true })
    }, 20_000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, order?.orderStatus])

  useEffect(() => {
    if (!order?.expirationAt) {
      setCountdownVal('')
      return
    }

    const tick = () => {
      const remaining = new Date(order.expirationAt).getTime() - Date.now()
      if (remaining <= 0) {
        setCountdownVal('00:00')
        setCountdownUrgent(true)
        return
      }
      const totalSeconds = Math.floor(remaining / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      setCountdownVal(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
      setCountdownUrgent(totalSeconds <= 5 * 60)
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [order?.expirationAt])

  const onClickCrypto = () => {
    if (!order) return
    applyPaymentMethod(order, false)
  }

  const onClickBtcLn = () => {
    if (!order) return
    applyPaymentMethod(order, true)
  }

  const copyToClipboard = async (text: string, key: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    showSnack('success', 'Copied')
    window.setTimeout(() => setCopiedKey(''), 1600)
  }

  const fiatSymbol = CURRENCY_SYMBOLS[String(order?.currency)] || ''
  const canPay =
    order &&
    order.orderStatus !== ORDER_STATUS.Settled &&
    order.orderStatus !== ORDER_STATUS.Expired &&
    order.orderStatus !== ORDER_STATUS.Invalid

  const tokenMeta = useMemo(() => {
    if (!order) return null
    try {
      return FindTokenByChainIdsAndSymbol(
        GetChainIds(order.network === 1, Number(order.chainId)),
        order.crypto as COINS
      )
    } catch {
      return null
    }
  }, [order])

  const brandColor =
    order?.storeBrandColor && /^#[0-9A-Fa-f]{3,8}$/.test(order.storeBrandColor)
      ? order.storeBrandColor
      : undefined

  if (loading && !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading invoice…</p>
      </div>
    )
  }

  if (error && !order) {
    const isRateLimited = /too many requests/i.test(error)
    const isAuthError = /access token|forbidden|unauthorized|invalid or missing/i.test(error)

    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            {isRateLimited ? 'Please wait a moment' : 'Unable to open invoice'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          {isRateLimited ? (
            <p className="mt-2 text-xs text-muted-foreground">
              This page refreshes often while waiting for payment. Wait a bit, then try again.
            </p>
          ) : isAuthError ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Public checkout links need a valid access token (`?t=`). Merchants can open invoices
              while signed in to the store.
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

  if (!order) return null

  return (
    <div className="pb-16 pt-4">
      {order.storeCustomCssUrl ? (
        <Head>
          <link rel="stylesheet" href={order.storeCustomCssUrl} />
        </Head>
      ) : null}

      <div
        className="mx-auto max-w-5xl px-4"
        style={
          brandColor
            ? { borderTop: `4px solid ${brandColor}`, paddingTop: '1.25rem' }
            : undefined
        }
      >
        {order.network === 2 && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 !text-amber-600" />
            <AlertTitle>Test network</AlertTitle>
            <AlertDescription className="text-amber-800">
              Coins on this network have no real value. Need test funds?{' '}
              <Link href="/freecoin" className="font-medium underline underline-offset-2">
                Get free coins
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {order.orderStatus === ORDER_STATUS.Settled && (
          <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 !text-emerald-600" />
            <AlertTitle>Paid</AlertTitle>
            <AlertDescription>This invoice has been settled successfully.</AlertDescription>
          </Alert>
        )}

        {order.orderStatus === ORDER_STATUS.Expired && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <Clock3 className="h-4 w-4 !text-amber-600" />
            <AlertTitle>Expired</AlertTitle>
            <AlertDescription>Do not send further payments to this invoice.</AlertDescription>
          </Alert>
        )}

        {order.orderStatus === ORDER_STATUS.Invalid && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Invalid</AlertTitle>
            <AlertDescription>This invoice is invalid. Do not continue paying.</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {order.storeLogoUrl ? (
              <Image
                alt={order.storeName || 'Store'}
                src={order.storeLogoUrl}
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
              {order.storeWebsite && /^https?:\/\//i.test(String(order.storeWebsite)) ? (
                <Link
                  href={String(order.storeWebsite)}
                  className="truncate font-semibold hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {order.storeName}
                </Link>
              ) : (
                <p className="truncate font-semibold">{order.storeName}</p>
              )}
              <p className="text-xs text-muted-foreground">Invoice #{order.orderId}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {order.network === 2 && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                Test mode
              </Badge>
            )}
            <Badge variant="outline" className={cn('font-medium', statusTone(order.orderStatus))}>
              {order.orderStatus}
            </Badge>
            {canPay && countdownVal ? (
              <Badge
                variant="outline"
                className={cn(
                  'gap-1 font-mono tabular-nums',
                  countdownUrgent && 'border-amber-300 bg-amber-50 text-amber-800'
                )}
              >
                <Clock3 className="h-3.5 w-3.5" />
                {countdownVal}
              </Badge>
            ) : null}
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
              <CardTitle className="text-base">Invoice details</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="rounded-xl border bg-muted/30 px-4 py-5">
                <p className="text-sm text-muted-foreground">Amount due</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">
                  {FormatCryptoDisplay(order.cryptoAmount, { coin: order.crypto })}{' '}
                  <span className="text-2xl font-semibold">{order.crypto}</span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  ≈ {fiatSymbol}
                  {FormatCryptoAmount(order.amount, 2)} {order.currency}
                </p>
              </div>

              <div className="mt-5 space-y-0.5">
                <DetailRow
                  label="Due date"
                  value={
                    order.expirationAt
                      ? new Date(order.expirationAt).toLocaleString()
                      : 'No due date'
                  }
                />
                <DetailRow
                  label="Description"
                  value={order.description || '—'}
                />
                <DetailRow
                  label="Exchange rate"
                  value={`1 ${order.crypto} = ${fiatSymbol}${FormatCryptoAmount(order.rate, 8)}`}
                />
                <DetailRow
                  label="Network"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      {GetImgSrcByChain(order.chainId as CHAINS) ? (
                        <Image
                          alt=""
                          width={16}
                          height={16}
                          src={GetImgSrcByChain(order.chainId as CHAINS)}
                          className="h-4 w-4"
                        />
                      ) : null}
                      {FindChainNamesByChains(order.chainId)}
                      {order.network === 2 ? ' (testnet)' : ''}
                    </span>
                  }
                />
              </div>

              {order.orderStatus === ORDER_STATUS.Settled && (
                <>
                  <Separator className="my-5" />
                  <p className="mb-2 text-sm font-medium">Settlement</p>
                  <div className="space-y-0.5">
                    <DetailRow
                      label="Transaction"
                      value={
                        order.hash ? (
                          <Link
                            target="_blank"
                            rel="noreferrer"
                            href={GetBlockchainTxUrlByChainIds(
                              order.network === 1,
                              order.chainId,
                              order.hash
                            )}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            {OmitMiddleString(order.hash, 8)}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          '—'
                        )
                      }
                    />
                    <DetailRow
                      label="From"
                      value={
                        order.fromAddress ? (
                          <Link
                            target="_blank"
                            rel="noreferrer"
                            href={GetBlockchainAddressUrlByChainIds(
                              order.network === 1,
                              order.chainId,
                              order.fromAddress
                            )}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            {OmitMiddleString(order.fromAddress, 8)}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          '—'
                        )
                      }
                    />
                    <DetailRow
                      label="To"
                      value={
                        order.toAddress ? (
                          <Link
                            target="_blank"
                            rel="noreferrer"
                            href={GetBlockchainAddressUrlByChainIds(
                              order.network === 1,
                              order.chainId,
                              order.toAddress
                            )}
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            {OmitMiddleString(order.toAddress, 8)}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          '—'
                        )
                      }
                    />
                  </div>
                </>
              )}

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
                <CardTitle className="text-base">Pay with crypto</CardTitle>
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
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Currency</p>
                <div className="flex gap-2">
                  {order.crypto && (
                    <Button
                      variant={crypto === order.crypto ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={onClickCrypto}
                      disabled={!canPay && crypto !== order.crypto}
                    >
                      <Image
                        alt=""
                        width={18}
                        height={18}
                        src={GetImgSrcByCrypto(order.crypto as COINS)}
                        className="h-4.5 w-4.5"
                      />
                      {order.crypto}
                    </Button>
                  )}
                  {order.chainId === CHAINS.BITCOIN && order.lightningInvoice && (
                    <Button
                      variant={crypto === COINS.BTC_LN ? 'default' : 'outline'}
                      className="flex-1 gap-2"
                      onClick={onClickBtcLn}
                      disabled={!canPay && crypto !== COINS.BTC_LN}
                    >
                      <Image
                        alt=""
                        width={18}
                        height={18}
                        src={GetImgSrcByCrypto(COINS.BTC_LN)}
                        className="h-4.5 w-4.5"
                      />
                      Lightning
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Network</p>
                <div className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium">
                  {GetImgSrcByChain(order.chainId as CHAINS) ? (
                    <Image
                      alt=""
                      width={18}
                      height={18}
                      src={GetImgSrcByChain(order.chainId as CHAINS)}
                      className="h-4.5 w-4.5"
                    />
                  ) : null}
                  {FindChainNamesByChains(order.chainId)}
                </div>
              </div>

              <div className="rounded-xl border bg-background p-5 text-center">
                {qrCode ? (
                  <div className="mx-auto inline-block rounded-2xl border bg-white p-3">
                    <QRCodeSVG
                      value={qrCode}
                      size={200}
                      imageSettings={{
                        src: GetImgSrcByCrypto(crypto as COINS),
                        width: 24,
                        height: 24,
                        excavate: true,
                      }}
                    />
                  </div>
                ) : (
                  <div className="mx-auto flex h-[200px] w-[200px] items-center justify-center rounded-2xl border bg-muted/40 text-sm text-muted-foreground">
                    QR unavailable
                  </div>
                )}

                <p className="mt-4 text-xs text-muted-foreground">
                  Send exactly{' '}
                  <span className="font-medium text-foreground">
                    {FormatCryptoDisplay(order.cryptoAmount, { coin: order.crypto })}{' '}
                    {order.crypto}
                  </span>
                </p>

                <button
                  type="button"
                  className="mt-3 w-full break-all rounded-lg border bg-muted/30 px-3 py-2.5 font-mono text-xs transition-colors hover:bg-muted/50"
                  onClick={() => copyToClipboard(destinationAddress, 'addr')}
                  disabled={!destinationAddress}
                >
                  {destinationAddress
                    ? OmitMiddleString(destinationAddress, 14)
                    : 'No destination'}
                </button>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button
                    className="gap-1.5"
                    onClick={() => copyToClipboard(destinationAddress, 'addr')}
                    disabled={!destinationAddress}
                  >
                    {copiedKey === 'addr' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedKey === 'addr' ? 'Copied' : 'Copy address'}
                  </Button>

                  {canPay &&
                  crypto !== COINS.BTC_LN &&
                  IsEvmWalletConnectChain(Number(order.chainId) as CHAINS) ? (
                    <WalletConnectButton
                      network={Number(order.network)}
                      chainId={Number(order.chainId)}
                      address={String(order.destinationAddress)}
                      contractAddress={tokenMeta?.contractAddress}
                      decimals={tokenMeta?.decimals}
                      value={String(order.cryptoAmount)}
                      buttonSize="default"
                      buttonVariant="outline"
                      fullWidth
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => copyToClipboard(qrCode, 'qr')}
                      disabled={!qrCode}
                    >
                      {copiedKey === 'qr' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedKey === 'qr' ? 'Copied' : 'Copy payment URI'}
                    </Button>
                  )}
                </div>

                {!canPay && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Payments are closed for this invoice status.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
      </div>
    </div>
  )
}

export default InvoiceDetails
