import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, ExternalLink, Archive, CreditCard } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { useSnackPresistStore, useStorePresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS, ORDER_STATUS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { InvoiceEventDataTab } from '../../DataList/InvoiceEventDataTab'
import {
  FindChainNamesByChains,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
} from '@/utils/web3'
import { CHAINS } from '@/packages/constants/blockchain'
import { OmitMiddleString } from '@/utils/strings'
import { GetImgSrcByChain } from '@/utils/qrcode'
import { useShallow } from 'zustand/react/shallow'
import { OrderType } from '@/utils/types'

const PaymentInvoiceDetails = () => {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState<OrderType>()

  const { storeName } = useStorePresistStore(
    useShallow((state) => ({
      storeName: state.storeName,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async (id: any) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_id, {
        params: { id },
      })

      if (response.result) {
        setOrder(response.data)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Can not find the invoice!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    id && init(id)
  }, [id])

  if (!order) {
    return <div className="py-20 text-center">Loading invoice...</div>
  }

  const onClickArchive = async () => {
    try {
      const response: any = await axios.put(Http.update_invoice_order_status_by_order_id, {
        order_id: order.orderId,
        order_status: ORDER_STATUS.Invalid,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful update!')
        setSnackOpen(true)

        window.location.reload()
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

  const copyToClipboard = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setSnackMessage('Successfully copied to clipboard')
    setSnackSeverity('success')
    setSnackOpen(true)
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case ORDER_STATUS.Settled:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
            Settled
          </Badge>
        )
      case ORDER_STATUS.Processing:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">
            Processing
          </Badge>
        )
      case ORDER_STATUS.Expired:
      case ORDER_STATUS.Invalid:
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoice</h1>
            <span className="text-2xl font-semibold text-muted-foreground">#{order.orderId}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Store: <span className="font-medium text-foreground">{storeName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            onClick={() => {
              window.location.href = '/invoices/' + order.orderId
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Checkout
          </Button>

          {order.orderStatus !== ORDER_STATUS.Invalid && (
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={onClickArchive}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">General Information</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 text-sm">
              <DetailRow label="Store" value={storeName} />
              <DetailRow
                label="Order ID"
                value={<span className="font-mono font-medium">{order.orderId}</span>}
              />
              <DetailRow label="Source Type" value={order.sourceType} />
              <DetailRow label="State" value={renderStatusBadge(order.orderStatus)} />
              <DetailRow
                label="Created Date"
                value={order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
              />
              <DetailRow
                label="Expiration Date"
                value={order.expirationAt ? new Date(order.expirationAt).toLocaleString() : '-'}
              />
              <DetailRow
                label="Total Amount Due"
                value={
                  <span className="font-semibold text-base">
                    {CURRENCY_SYMBOLS[order.currency]}
                    {order.amount}
                  </span>
                }
              />
              <DetailRow label="Refund Email" value={order.buyerEmail || '-'} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <DetailRow
                  label="Item Description"
                  value={order.description || 'No description provided'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Buyer Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <DetailRow label="Email" value={order.buyerEmail || '-'} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3 bg-muted/20">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Invoice Summary
                {order.chainId && (
                  <div className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-md border">
                    <Image
                      alt="chain icon"
                      width={18}
                      height={18}
                      src={GetImgSrcByChain(order.chainId)}
                      className="rounded-full h-4 w-4"
                    />
                    <span>{FindChainNamesByChains(order.chainId)?.toUpperCase()}</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 text-sm pt-2">
              <DetailRow
                label="Destination"
                value={
                  order.destinationAddress ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs break-all">
                        {OmitMiddleString(order.destinationAddress)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(order.destinationAddress)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    '-'
                  )
                }
              />

              {order.chainId === CHAINS.BITCOIN && (
                <>
                  {order.lightningInvoice && (
                    <DetailRow
                      label="Lightning Invoice"
                      value={
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">
                            {OmitMiddleString(order.lightningInvoice)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(order.lightningInvoice)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      }
                    />
                  )}
                  {order.lightningUrl && (
                    <DetailRow
                      label="Lightning URL"
                      value={
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">
                            {OmitMiddleString(order.lightningUrl)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(order.lightningUrl)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      }
                    />
                  )}
                </>
              )}

              {order.paymentMethod && (
                <DetailRow label="Payment Method" value={order.paymentMethod} />
              )}

              <DetailRow
                label="Rate"
                value={`${CURRENCY_SYMBOLS[order.currency] || ''}${order.rate}`}
              />

              <DetailRow
                label="Total Due"
                value={
                  <span className="font-bold text-foreground">
                    {order.cryptoAmount} {order.crypto}
                  </span>
                }
              />

              <DetailRow
                label="Paid"
                value={
                  order.paid === 1 ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                      True
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      False
                    </Badge>
                  )
                }
              />

              {order.orderStatus === ORDER_STATUS.Settled && (
                <>
                  {order.hash && (
                    <DetailRow
                      label="Hash"
                      value={
                        <Link
                          target="_blank"
                          href={GetBlockchainTxUrlByChainIds(
                            order.network === 1,
                            order.chainId,
                            order.hash
                          )}
                          className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {OmitMiddleString(order.hash)}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      }
                    />
                  )}
                  {order.fromAddress && (
                    <DetailRow
                      label="From Address"
                      value={
                        <Link
                          target="_blank"
                          href={GetBlockchainAddressUrlByChainIds(
                            order.network === 1,
                            order.chainId,
                            order.fromAddress
                          )}
                          className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {OmitMiddleString(order.fromAddress)}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      }
                    />
                  )}
                  {order.toAddress && (
                    <DetailRow
                      label="To Address"
                      value={
                        <Link
                          target="_blank"
                          href={GetBlockchainAddressUrlByChainIds(
                            order.network === 1,
                            order.chainId,
                            order.toAddress
                          )}
                          className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {OmitMiddleString(order.toAddress)}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      }
                    />
                  )}
                  {order.blockTimestamp ? (
                    <DetailRow
                      label="Block Timestamp"
                      value={new Date(order.blockTimestamp).toLocaleString()}
                    />
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Events</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceEventDataTab orderId={order.orderId} />
        </CardContent>
      </Card>
    </div>
  )
}

const DetailRow = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => {
  return (
    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
      <span className="text-muted-foreground text-xs sm:text-sm font-medium shrink-0">{label}</span>
      <div className="text-foreground text-sm text-left sm:text-right font-normal">
        {value || '-'}
      </div>
    </div>
  )
}

export default PaymentInvoiceDetails
