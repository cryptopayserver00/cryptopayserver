import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { HelpCircle, Lock, QrCode, Store, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useSnackPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
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
import { useShallow } from 'zustand/react/shallow'
import { PayoutRowType, PullPaymentType } from '@/utils/types'

const PullPaymentsDetails = () => {
  const router = useRouter()
  const { id } = router.query

  const [page, setPage] = useState<number>(1)
  const [websiteUrl, setWebsiteUrl] = useState<string>('')

  const [pullPaymentData, setPullPaymentData] = useState<PullPaymentType>()
  const [payoutRows, setPayoutRows] = useState<PayoutRowType[]>([])
  const [alreadyClaim, setAlreadyClaim] = useState<number>(0)
  const [showQR, setShowQR] = useState<boolean>(false)
  const [openDrawer, setOpenDrawer] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const getClaimsHistory = async (storeId: number, network: number, pullPaymentId: number) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_source_type, {
        params: {
          store_id: storeId,
          network: network,
          source_type: PAYOUT_SOURCE_TYPE.PullPayment,
          external_payment_id: pullPaymentId,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let rt: PayoutRowType[] = []
          let paid = 0
          response.data.forEach((item: any) => {
            rt.push({
              chain: item.chain_id,
              chainName: FindChainNamesByChains(item.chain_id as CHAINS),
              address: item.address,
              amount: item.amount,
              cryptoAmount: item.crypto_amount,
              crypto: item.crypto,
              currency: item.currency,
              tx: item.tx,
              status: item.payout_status,
            })

            if (item.payout_status === PAYOUT_STATUS.Completed) {
              paid += parseFloat(item.amount)
            }
          })
          setPayoutRows(rt)
          setAlreadyClaim(paid)
        } else {
          setPayoutRows([])
          setAlreadyClaim(0)
        }
      } else {
        setSnackSeverity('error')
        setSnackMessage('Can not find the data on site!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const init = async (id: any) => {
    setWebsiteUrl(window.location.href)

    try {
      if (!id) return

      const response: any = await axios.get(Http.find_pull_payment_by_id, {
        params: {
          id: id,
        },
      })

      if (response.result) {
        setPullPaymentData({
          userId: response.data.user_id,
          storeId: response.data.store_id,
          network: response.data.network,
          pullPaymentId: response.data.pull_payment_id,
          name: response.data.name,
          storeName: response.data.store_name,
          storeLogoUrl: response.data.store_logo_url,
          storeWebsite: response.data.store_website,
          amount: response.data.amount,
          currency: response.data.currency,
          description: response.data.description,
          showAutoApproveClaim: response.data.show_auto_approve_claim === 1,
          createdDate: new Date(response.data.created_at).getTime(),
          updateDate: new Date(response.data.updated_at).getTime(),
          expirationDate: new Date(response.data.expiration_at).getTime(),
          pullPaymentStatus: response.data.pull_payment_status,
        })

        await getClaimsHistory(
          response.data.store_id,
          response.data.network,
          response.data.pull_payment_id
        )
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

  const onClickShowQR = async () => {
    setShowQR(true)
  }

  const onClickCoin = async (item: COIN, address: string, amount: number) => {
    if (!item || !address || !amount) {
      setSnackSeverity('error')
      setSnackMessage('Incorrect parameters')
      setSnackOpen(true)
      return
    }

    const availableClaim = Number(pullPaymentData?.amount) + alreadyClaim
    if (amount > availableClaim) {
      setSnackSeverity('error')
      setSnackMessage(
        'Available claim is ' + CURRENCY_SYMBOLS[String(pullPaymentData?.currency)] + availableClaim
      )
      setSnackOpen(true)
      return
    }

    try {
      const response: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: item.chainId,
          address: address,
          network: pullPaymentData?.network,
        },
      })

      if (!response.result) {
        setSnackSeverity('error')
        setSnackMessage('The input address is invalid, please try it again!')
        setSnackOpen(true)
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
      })

      if (create_payout_resp.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)

        await init(id)

        setPage(1)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {pullPaymentData?.network === 2 && (
        <Alert
          variant="destructive"
          className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-amber-900 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-300 font-bold">Warning</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            This is a test network, and the currency has no real value. If you need free coins, you
            can get them{' '}
            <Link
              href="/freecoin"
              target="_blank"
              className="font-semibold underline hover:opacity-80"
            >
              here.
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {pullPaymentData && pullPaymentData?.pullPaymentStatus !== PULL_PAYMENT_STATUS.Active && (
        <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm">
            The pull payment has been {pullPaymentData?.pullPaymentStatus}, and you can read the
            detail of the claims.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {pullPaymentData?.storeLogoUrl ? (
                <Image
                  alt="logo"
                  src={pullPaymentData?.storeLogoUrl}
                  width={100}
                  height={40}
                  className="object-contain h-10 w-25"
                />
              ) : (
                <div className="p-2 rounded-md bg-muted text-muted-foreground">
                  <Store className="h-5 w-5" />
                </div>
              )}
              <Link
                href={String(pullPaymentData?.storeWebsite)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {pullPaymentData?.storeName}
              </Link>
              {pullPaymentData?.network === 2 && (
                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                  TestMode
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenDrawer(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Pull Payment Information</h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2 text-muted-foreground">
                <div>Name</div>
                <div>Pull Payment</div>
                <div>Start Date</div>
                <div>Last Updated</div>
                <div>Due Date</div>
                <div>Description</div>
              </div>
              <div className="space-y-2 font-medium text-foreground">
                <div>{pullPaymentData?.name ? pullPaymentData?.name : 'None'}</div>
                <div>
                  {pullPaymentData?.pullPaymentId ? pullPaymentData?.pullPaymentId : 'None'}
                </div>
                <div>
                  {pullPaymentData?.createdDate
                    ? new Date(Number(pullPaymentData?.createdDate)).toLocaleString()
                    : 'No due date'}
                </div>
                <div>
                  {pullPaymentData?.updateDate
                    ? new Date(Number(pullPaymentData?.updateDate)).toLocaleString()
                    : 'No due date'}
                </div>
                <div>
                  {pullPaymentData?.expirationDate
                    ? new Date(Number(pullPaymentData?.expirationDate)).toLocaleString()
                    : 'No due date'}
                </div>
                <div>{pullPaymentData?.description ? pullPaymentData?.description : 'None'}</div>
              </div>
            </div>
          </div>

          <Separator />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {payoutRows && payoutRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Destination</TableHead>
                        <TableHead>Chain</TableHead>
                        <TableHead className="text-right">Amount requested</TableHead>
                        <TableHead className="text-right">Crypto</TableHead>
                        <TableHead className="text-right">Crypto Amount</TableHead>
                        <TableHead>Transaction</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutRows.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs">{row.address}</TableCell>
                          <TableCell>{row.chainName}</TableCell>
                          <TableCell className="text-right font-medium">
                            {CURRENCY_SYMBOLS[row.currency]}
                            {row.amount}
                          </TableCell>
                          <TableCell className="text-right">{row.crypto}</TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {row.cryptoAmount}
                          </TableCell>
                          <TableCell>
                            <Link
                              href={GetBlockchainTxUrlByChainIds(
                                pullPaymentData?.network === 1,
                                row.chain,
                                row.tx
                              )}
                              target="_blank"
                              className="text-xs text-primary hover:underline font-mono"
                            >
                              {OmitMiddleString(row.tx)}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">
                  No payments have been made yet.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-6">
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              <span>Secured by</span>
              <span className="font-bold text-foreground">CryptoPayServer</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href="#" className="hover:underline hover:text-foreground">
                Terms
              </Link>
              <span>·</span>
              <Link href="#" className="hover:underline hover:text-foreground">
                Privacy
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Payment Method</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenDialog(true)}
              className="text-amber-600 border-amber-300 hover:bg-amber-50 gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" />
              Report
            </Button>
          </div>

          {page === 1 && (
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2 text-muted-foreground">
                    <div>Available claim</div>
                    <div>Already claimed</div>
                    <div>Claim limit</div>
                  </div>
                  <div className="space-y-2 font-bold">
                    <div className="text-emerald-600 dark:text-emerald-400">
                      {CURRENCY_SYMBOLS[String(pullPaymentData?.currency)]}
                      {(Number(pullPaymentData?.amount) - alreadyClaim).toFixed(2)}
                    </div>
                    <div>
                      {CURRENCY_SYMBOLS[String(pullPaymentData?.currency)]}
                      {alreadyClaim}
                    </div>
                    <div className="text-destructive">
                      {CURRENCY_SYMBOLS[String(pullPaymentData?.currency)]}
                      {pullPaymentData?.amount}
                    </div>
                  </div>
                </div>

                {pullPaymentData &&
                  pullPaymentData?.pullPaymentStatus === PULL_PAYMENT_STATUS.Active && (
                    <div>
                      <Button
                        size="lg"
                        onClick={() => setPage(2)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        Claim Funds
                      </Button>
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(websiteUrl)
                      setSnackMessage('Successfully copy')
                      setSnackSeverity('success')
                      setSnackOpen(true)
                    }}
                  >
                    Copy Link
                  </Button>
                  <Button onClick={onClickShowQR} className="gap-1.5">
                    <QrCode className="h-4 w-4" />
                    Show QR
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {page === 2 && (
            <div className="space-y-4">
              <Button variant="outline" size="lg" onClick={() => setPage(1)}>
                Back
              </Button>

              <PullPaymentSelectChainAndCryptoCard
                storeId={Number(pullPaymentData?.storeId)}
                network={Number(pullPaymentData?.network)}
                amount={Number(pullPaymentData?.amount)}
                currency={String(pullPaymentData?.currency)}
                onClickCoin={onClickCoin}
              />
            </div>
          )}
        </div>
      </div>

      <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
      <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
      <PullPaymentQRDialog openDialog={showQR} setOpenDialog={setShowQR} websiteUrl={websiteUrl} />
    </div>
  )
}

export default PullPaymentsDetails
