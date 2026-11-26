import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Gift,
  KeyRound,
  ShieldAlert,
  Store,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PaymentAnalyticsChart from './PaymentAnalyticsChart'
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { PAYOUT_STATUS } from '@/packages/constants'
import InvoiceDataGrid from '@/components/DataList/InvoiceDataGrid'
import PayoutDataGrid from '@/components/DataList/PayoutDataGrid'
import TokenDataGrid from '@/components/DataList/TokenDataGrid'
import { PageHeader, PageShell } from '@/components/Layout/PageHeader'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

type SetupItem = {
  id: string
  title: string
  description: string
  href: string
  icon: typeof Store
  tone?: 'amber' | 'sky'
}

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

  const init = async (currentWalletId: number) => {
    try {
      if (!currentWalletId) {
        setEnablePasswordWarn(false)
        setEnableBackupWarn(false)
        return
      }

      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: currentWalletId,
        },
      })

      if (response.result && !response.data.hasPassword) {
        setEnablePasswordWarn(true)
      } else {
        setEnablePasswordWarn(false)
      }

      if (response.result && response.data.isBackup === 2) {
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

  const setupItems = useMemo(() => {
    const items: SetupItem[] = []
    if (!isStore) {
      items.push({
        id: 'store',
        title: 'Create a store',
        description: 'Stores collect payments and manage invoices.',
        href: '/stores/create',
        icon: Store,
      })
    }
    if (isStore && !isWallet) {
      items.push({
        id: 'wallet',
        title: 'Create a wallet',
        description: 'You need a wallet before accepting crypto.',
        href: '/wallet/create',
        icon: Wallet,
      })
    }
    if (enablePasswordWarn) {
      items.push({
        id: 'password',
        title: 'Set a wallet password',
        description: 'Protect spending and sensitive wallet actions.',
        href: '/wallet/setPassword',
        icon: KeyRound,
      })
    }
    if (enableBackupWarn) {
      items.push({
        id: 'backup',
        title: 'Back up your recovery phrase',
        description: 'Write down your mnemonic so you can restore the wallet.',
        href: '/wallet/phrase/intro',
        icon: ShieldAlert,
      })
    }
    if (isStore && isWallet && network === 'testnet') {
      items.push({
        id: 'freecoin',
        title: 'Get testnet coins',
        description: 'This network has no real value — claim faucet funds to try payments.',
        href: '/freecoin',
        icon: Gift,
        tone: 'sky',
      })
    }
    return items
  }, [enableBackupWarn, enablePasswordWarn, isStore, isWallet, network])

  return (
    <PageShell>
      <PageHeader
        title={storeName || 'Dashboard'}
        description={
          storeName
            ? 'Overview of balances, recent invoices, and payouts for this store.'
            : 'Get started by creating a store and wallet.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {network === 'testnet' ? (
              <Badge variant="outline" className="border-sky-300 text-sky-700 dark:text-sky-300">
                Testnet
              </Badge>
            ) : (
              <Badge variant="outline">Mainnet</Badge>
            )}
            {isStore && isWallet ? (
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/payments/invoices">
                  <FileText className="h-4 w-4" />
                  Create invoice
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      {setupItems.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {setupItems.map((item) => {
            const Icon = item.icon
            const tone =
              item.tone === 'sky'
                ? 'border-sky-200 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/30'
                : 'border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30'
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-background',
                  tone
                )}
              >
                <div className="mt-0.5 rounded-md bg-background/80 p-2 text-foreground shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    {item.tone !== 'sky' ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            )
          })}
        </div>
      ) : null}

      {isStore && isWallet ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment analytics</CardTitle>
            <CardDescription>Volume and deal activity for the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentAnalyticsChart />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Balances</CardTitle>
          <CardDescription>Assets available across your configured chains.</CardDescription>
        </CardHeader>
        <CardContent>
          <TokenDataGrid source="dashboard" />
        </CardContent>
      </Card>

      {isStore && isWallet ? (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base">Recent invoices</CardTitle>
                <CardDescription className="mt-1">Latest payment requests you issued.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/payments/invoices">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <InvoiceDataGrid source="dashboard" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base">Awaiting payouts</CardTitle>
                <CardDescription className="mt-1">Payouts ready for payment.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/payments/payouts">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <PayoutDataGrid status={PAYOUT_STATUS.AwaitingPayment} />
            </CardContent>
          </Card>
        </>
      ) : null}
    </PageShell>
  )
}

export default Dashboard
