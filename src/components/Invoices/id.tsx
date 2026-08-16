import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { AlertTriangle, Copy, HelpCircle, Lock, Store as StoreIcon } from 'lucide-react'

import { useSnackPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { OmitMiddleString } from '@/utils/strings'
import { CURRENCY_SYMBOLS, ORDER_STATUS, WALLET } from '@/packages/constants'
import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode'
import {
  FindChainNamesByChains,
  FindTokenByChainIdsAndSymbol,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
  GetChainIds,
} from '@/utils/web3'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import WalletConnectButton from '@/components/Button/WalletConnectButton'
import HelpDrawer from '@/components/Drawer/HelpDrawer'
import ReportPaymentDialog from '@/components/Dialog/ReportPaymentDialog'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  <div className="flex items-center justify-between py-1">
    <span className="text-muted-foreground">{label}</span>
    <span className={cn(bold && 'font-semibold')}>{value}</span>
  </div>
)

const InvoiceDetails = () => {
  const router = useRouter()
  const { id } = router.query

  const [countdownVal, setCountdownVal] = useState<string>('0')
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const [order, setOrder] = useState<OrderType>()
  const [crypto, setCrypto] = useState<COINS>()
  const [qrCode, setQrCode] = useState<string>('')
  const [destinationAddress, setDestinationAddress] = useState<string>('')

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async (id: any, order?: OrderType) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_id, {
        params: {
          id: id,
        },
      })

      if (response.result) {
        setOrder(response.data)

        if (order === undefined) {
          setCrypto(response.data.crypto)
          setQrCode(response.data.qrCodeText)
          setDestinationAddress(response.data.destinationAddress)
        }
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
    if (id) {
      const activeInit = setInterval(async () => {
        await init(id, order as OrderType)
      }, 10 * 1000)

      return () => clearInterval(activeInit)
    }
  }, [id, order])

  useEffect(() => {
    if (id) {
      init(id)
    }
  }, [id])

  const countDownTime = () => {
    if (!order?.expirationDate || order?.expirationDate <= 0) {
      return
    }

    const currentTime = Date.now()
    const remainingTime = order?.expirationDate - currentTime

    if (remainingTime <= 0) {
      return
    }

    const seconds = Math.floor((remainingTime / 1000) % 60)
    const minutes = Math.floor((remainingTime / 1000 / 60) % 60)
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    setCountdownVal(formattedTime)
  }

  useEffect(() => {
    const activeCountDownTime = setInterval(() => {
      countDownTime()
    }, 1000)

    return () => clearInterval(activeCountDownTime)
  }, [order?.expirationDate])

  const onClickCrypto = () => {
    setCrypto(order?.crypto as COINS)
    setQrCode(String(order?.qrCodeText))
    setDestinationAddress(String(order?.destinationAddress))
  }

  const onClickBtcLn = () => {
    setCrypto(COINS.BTC_LN)
    setQrCode(String(order?.qrLightningCodeText))
    setDestinationAddress(String(order?.lightningInvoice))
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setSnackMessage('Successfully copy')
    setSnackSeverity('success')
    setSnackOpen(true)
  }

  return (
    <div className="mt-4">
      <div className="mx-auto max-w-screen-xl px-4">
        {order?.network === 2 && (
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

        {order?.orderStatus === ORDER_STATUS.Settled && (
          <Alert className="mb-4 border-transparent bg-green-600 text-white [&_svg]:text-white">
            <AlertDescription>The order has been paid successfully</AlertDescription>
          </Alert>
        )}

        {order?.orderStatus === ORDER_STATUS.Expired && (
          <Alert className="mb-4 border-transparent bg-amber-500 text-white [&_svg]:text-white">
            <AlertDescription>
              The order has expired, please do not continue to pay
            </AlertDescription>
          </Alert>
        )}

        {order?.orderStatus === ORDER_STATUS.Invalid && (
          <Alert
            variant="destructive"
            className="mb-4 border-transparent bg-red-600 text-white [&_svg]:text-white"
          >
            <AlertDescription>
              The order has invalid, please do not continue to pay
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {order?.storeLogoUrl ? (
                  <Image
                    alt="logo"
                    src={order.storeLogoUrl}
                    width={100}
                    height={40}
                    className="h-10 w-25"
                  />
                ) : (
                  <StoreIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <Link href={String(order?.storeWebsite)} className="hover:underline">
                  {order?.storeName}
                </Link>
                {order?.network === 2 && (
                  <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">
                    TestMode
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {countdownVal !== '0' && (
                  <span className="mx-1 text-sm tabular-nums text-muted-foreground">
                    {countdownVal}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="help"
                  onClick={() => setOpenDrawer(true)}
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{order?.totalPrice}</span>
              <span className="text-3xl font-bold">{order?.crypto}</span>
            </div>

            <Separator className="my-8" />

            <div>
              <p className="font-medium">Invoice Information</p>
              <div className="mt-4 space-y-1">
                <DetailRow label="Invoice" value={order?.orderId ? order.orderId : 'None'} />
                <DetailRow
                  label="Due Date"
                  value={
                    order?.expirationDate
                      ? new Date(Number(order.expirationDate)).toLocaleString()
                      : 'No due date'
                  }
                />
                <DetailRow
                  label="Description"
                  value={order?.description ? order.description : 'None'}
                />
                <DetailRow
                  label="Buyer Email"
                  value={order?.buyerEmail ? order.buyerEmail : 'None'}
                />
                <DetailRow label="Metadata" value={order?.metadata ? order.metadata : 'None'} />
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-1">
              <DetailRow label="Total Price" value={`${order?.totalPrice} ${order?.crypto}`} bold />
              <DetailRow
                label="Total Fiat"
                value={`${CURRENCY_SYMBOLS[String(order?.currency)]}${order?.amount}`}
                bold
              />
              <DetailRow
                label="Exchange Rate"
                value={`1 ${order?.crypto} = ${CURRENCY_SYMBOLS[String(order?.currency)]}${order?.rate}`}
                bold
              />
              <DetailRow label="Amount Due" value={`${order?.amountDue} ${order?.crypto}`} bold />
            </div>

            {order?.orderStatus === ORDER_STATUS.Settled && (
              <>
                <Separator className="my-8" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Order Status</span>
                    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                      {order?.orderStatus}
                    </Badge>
                  </div>
                  <DetailRow
                    label="Hash"
                    value={
                      <Link
                        target="_blank"
                        href={GetBlockchainTxUrlByChainIds(
                          order?.network === 1,
                          order?.chainId,
                          order?.hash
                        )}
                        className="text-primary hover:underline"
                      >
                        {OmitMiddleString(order?.hash)}
                      </Link>
                    }
                  />
                  <DetailRow
                    label="From Address"
                    value={
                      <Link
                        target="_blank"
                        href={GetBlockchainAddressUrlByChainIds(
                          order?.network === 1,
                          order?.chainId,
                          order?.fromAddress
                        )}
                        className="text-primary hover:underline"
                      >
                        {OmitMiddleString(order?.fromAddress)}
                      </Link>
                    }
                  />
                  <DetailRow
                    label="To Address"
                    value={
                      <Link
                        target="_blank"
                        href={GetBlockchainAddressUrlByChainIds(
                          order?.network === 1,
                          order?.chainId,
                          order?.toAddress
                        )}
                        className="text-primary hover:underline"
                      >
                        {OmitMiddleString(order?.toAddress)}
                      </Link>
                    }
                  />
                </div>
              </>
            )}

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
              <p className="mb-2 text-muted-foreground">Deposit currency</p>
              <div className="flex gap-2">
                {order?.crypto && (
                  <Button
                    variant={crypto === order.crypto ? 'default' : 'outline'}
                    className={cn(
                      'w-full',
                      crypto === order.crypto
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'border-green-600 text-green-700 hover:bg-green-50'
                    )}
                    onClick={onClickCrypto}
                  >
                    <Image
                      alt="crypto"
                      width={20}
                      height={20}
                      src={GetImgSrcByCrypto(order.crypto as COINS)}
                      className="mr-2 h-5 w-5"
                    />
                    {order.crypto}
                  </Button>
                )}
                {order?.chainId === CHAINS.BITCOIN && order?.lightningInvoice && (
                  <Button
                    variant={crypto === COINS.BTC_LN ? 'default' : 'outline'}
                    className={cn(
                      'w-full',
                      crypto === COINS.BTC_LN
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'border-green-600 text-green-700 hover:bg-green-50'
                    )}
                    onClick={onClickBtcLn}
                  >
                    <Image
                      alt="crypto"
                      width={20}
                      height={20}
                      src={GetImgSrcByCrypto(COINS.BTC_LN)}
                      className="mr-2 h-5 w-5"
                    />
                    {COINS.BTC_LN}
                  </Button>
                )}
              </div>

              <p className="my-2 text-muted-foreground">Select network</p>
              {order?.chainId && (
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Image
                    alt="chain"
                    width={20}
                    height={20}
                    src={GetImgSrcByChain(order.chainId as CHAINS)}
                    className="mr-2 h-5 w-5"
                  />
                  {FindChainNamesByChains(order.chainId)?.toUpperCase()}
                </Button>
              )}
            </div>

            <div className="mt-4">
              <Card className="p-5 text-center">
                <QRCodeSVG
                  value={qrCode}
                  width="100%"
                  height="100%"
                  imageSettings={{
                    src: GetImgSrcByCrypto(crypto as COINS),
                    width: 20,
                    height: 20,
                    excavate: true,
                  }}
                />

                <Button
                  variant="outline"
                  className="mt-4 w-full font-mono text-sm"
                  onClick={() => copyToClipboard(destinationAddress)}
                >
                  {OmitMiddleString(destinationAddress)}
                </Button>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button className="w-full" onClick={() => copyToClipboard(destinationAddress)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </Button>

                  {order?.orderStatus !== 'Settled' && crypto !== COINS.BTC_LN && (
                    <WalletConnectButton
                      network={Number(order?.network)}
                      chainId={Number(order?.chainId)}
                      address={String(order?.destinationAddress)}
                      contractAddress={
                        FindTokenByChainIdsAndSymbol(
                          GetChainIds(order?.network === 1, Number(order?.chainId)),
                          order?.crypto as COINS
                        )?.contractAddress
                      }
                      decimals={
                        FindTokenByChainIdsAndSymbol(
                          GetChainIds(order?.network === 1, Number(order?.chainId)),
                          order?.crypto as COINS
                        )?.decimals
                      }
                      value={String(order?.totalPrice)}
                      buttonSize={'default'}
                      buttonVariant={'default'}
                      fullWidth={true}
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
      </div>
    </div>
  )
}

export default InvoiceDetails
