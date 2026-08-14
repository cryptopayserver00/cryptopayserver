import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import PaymentAnalyticsChart from './PaymentAnalyticsChart'
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { PAYOUT_STATUS } from '@/packages/constants'
import InvoiceDataGrid from '@/components/DataList/InvoiceDataGrid'
import PayoutDataGrid from '@/components/DataList/PayoutDataGrid'
import TokenDataGrid from '@/components/DataList/TokenDataGrid'
import { useShallow } from 'zustand/react/shallow'

const Dashboard = () => {
  const [enablePasswordWarn, setEnablePasswordWarn] = useState(false)
  const [enableBackupWarn, setEnableBackupWarn] = useState(false)

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const { storeName, isStore } = useStorePresistStore(
    useShallow((state) => ({
      storeName: state.storeName,
      isStore: state.isStore,
    }))
  )

  const { walletId, isWallet } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
      isWallet: state.isWallet,
    }))
  )

  const init = async (walletId: number) => {
    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: walletId,
        },
      })

      if (response.result && !response.data.password) {
        setEnablePasswordWarn(true)
      } else {
        setEnablePasswordWarn(false)
      }

      if (response.result && response.data.is_backup === 2) {
        setEnableBackupWarn(true)
      } else {
        setEnableBackupWarn(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    init(walletId)
  }, [walletId])

  return (
    <div className="space-y-6">
      {!isStore && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You don&apos;t have a store yet. Please click&nbsp;
            <Link href="/stores/create" className="font-medium underline underline-offset-4">
              here
            </Link>
            &nbsp;to create a new one.
          </AlertDescription>
        </Alert>
      )}

      {isStore && !isWallet && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You don&apos;t have a wallet yet. Please click&nbsp;
            <Link href={'/wallet/create'} className="font-medium underline underline-offset-4">
              here
            </Link>
            &nbsp;to create a new one.
          </AlertDescription>
        </Alert>
      )}

      {isStore && isWallet && network === 'testnet' && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            This is a test network, and the currency has no real value. If you need free coins, you
            can get them&nbsp;
            <Link href={'/freecoin'} target="_blank">
              here.
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {enablePasswordWarn && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You don&apos;t have to setup the wallet password. Please click{' '}
            <Link href="/wallet/setPassword" className="font-medium underline underline-offset-4">
              here
            </Link>{' '}
            to setup.
          </AlertDescription>
        </Alert>
      )}

      {enableBackupWarn && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You don&apos;t have to backup your wallet mnemonic phrase. Please click{' '}
            <Link href="/wallet/phrase/intro" className="font-medium underline underline-offset-4">
              here
            </Link>{' '}
            to recording.
          </AlertDescription>
        </Alert>
      )}

      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        {storeName && (
          <div>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {storeName}
            </Badge>
          </div>
        )}

        {isStore && isWallet && (
          <Card>
            <CardContent className="pt-6">
              <PaymentAnalyticsChart />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <TokenDataGrid source="dashboard" />
          </CardContent>
        </Card>

        {isStore && isWallet && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Recent Invoices</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    window.location.href = '/payments/invoices'
                  }}
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <InvoiceDataGrid source="dashboard" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Recent Payouts</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    window.location.href = '/payments/payouts'
                  }}
                >
                  View All
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <PayoutDataGrid status={PAYOUT_STATUS.AwaitingPayment} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
