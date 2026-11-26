'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  List,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { OmitMiddleString } from '@/utils/strings'
import { GetBlockchainTxUrlByChainIds } from '@/utils/web3'
import { CHAINS } from '@/packages/constants/blockchain'

export type WalletTxRow = {
  chainId?: number
  hash: string
  amount?: string
  value?: string
  asset: string
  type?: string
  status?: string
  blockTimestamp?: number
}

type Props = {
  chainId: CHAINS | number
  network: string
  transactions?: WalletTxRow[] | null
  actions?: ReactNode
  className?: string
  defaultOpen?: boolean
}

function formatTimestamp(ts?: number) {
  const n = Number(ts)
  if (!Number.isFinite(n) || n <= 0) return '—'
  const ms = n < 1e12 ? n * 1000 : n
  return new Date(ms).toLocaleString()
}

function normalizeDirection(type?: string): 'received' | 'send' | 'other' {
  const t = (type || '').toLowerCase()
  if (t.includes('receiv') || t === 'in') return 'received'
  if (t.includes('send') || t === 'out') return 'send'
  return 'other'
}

function statusVariant(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const s = (status || '').toLowerCase()
  if (s.includes('success') || s.includes('confirm')) return 'default'
  if (s.includes('fail') || s.includes('error')) return 'destructive'
  if (s.includes('pend')) return 'secondary'
  return 'outline'
}

export default function WalletTransactionsPanel({
  chainId,
  network,
  transactions,
  actions,
  className,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const rows = useMemo(() => (Array.isArray(transactions) ? transactions : []), [transactions])
  const isMainnet = network === 'mainnet'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={open ? 'default' : 'outline'}
          className="gap-1.5"
          onClick={() => setOpen((v) => !v)}
        >
          <List className="h-4 w-4" />
          Check transactions
          {rows.length > 0 && (
            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-background/20 px-1.5 text-xs font-semibold">
              {rows.length}
            </span>
          )}
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
        </Button>
        {actions}
      </div>

      {open && (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Transactions</p>
              <p className="text-xs text-muted-foreground">
                {rows.length > 0
                  ? `${rows.length} on-chain record${rows.length === 1 ? '' : 's'}`
                  : 'No on-chain records for this address'}
              </p>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">There are no transactions yet</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Incoming and outgoing transfers for this address will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((row, index) => {
                const direction = normalizeDirection(row.type)
                const amount = row.amount ?? row.value ?? '—'
                const explorerUrl = GetBlockchainTxUrlByChainIds(
                  isMainnet,
                  Number(chainId) as CHAINS,
                  row.hash
                )

                return (
                  <li
                    key={`${row.hash}-${index}`}
                    className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          direction === 'received' && 'bg-emerald-500/10 text-emerald-600',
                          direction === 'send' && 'bg-orange-500/10 text-orange-600',
                          direction === 'other' && 'bg-muted text-muted-foreground'
                        )}
                      >
                        {direction === 'received' ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : direction === 'send' ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <List className="h-4 w-4" />
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">
                            {amount} {row.asset}
                          </p>
                          {row.type && (
                            <Badge variant="outline" className="font-normal capitalize">
                              {row.type}
                            </Badge>
                          )}
                          {row.status && (
                            <Badge variant={statusVariant(row.status)} className="font-normal">
                              {row.status}
                            </Badge>
                          )}
                        </div>

                        {explorerUrl ? (
                          <Link
                            href={explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs text-primary underline-offset-4 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {OmitMiddleString(row.hash, 10)}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </Link>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">
                            {OmitMiddleString(row.hash, 10)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="shrink-0 text-xs text-muted-foreground sm:text-right">
                      {formatTimestamp(row.blockTimestamp)}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
