import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Inbox,
  List,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CHAINNAMES, CHAINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { FormatCryptoDisplay } from '@/utils/number'
import { OmitMiddleString } from '@/utils/strings'
import { cn } from '@/lib/utils'
import {
  FindChainNamesByChains,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
} from '@/utils/web3'
import { useShallow } from 'zustand/react/shallow'

interface RowType {
  id: number
  chainId: number
  chainName: CHAINNAMES
  hash: string
  address: string
  fromAddress: string
  toAddress: string
  token: string
  transactionType: string
  amount: number
  blockTimestamp: string
}

interface GridType {
  source: 'dashboard' | 'none'
  chain?: CHAINS
  storeId?: number
  network: string
  address?: string
}

function normalizeDirection(type?: string): 'received' | 'send' | 'other' {
  const t = (type || '').toLowerCase()
  if (t.includes('receiv') || t === 'in') return 'received'
  if (t.includes('send') || t === 'out') return 'send'
  return 'other'
}

export default function TransactionDataGrid(props: GridType) {
  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [rowCount, setRowCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<RowType>()
  const [loading, setLoading] = useState(false)

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const { storeId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const onClickRow = (row: RowType) => {
    setSelectedValue(row)
    setOpen(true)
  }

  const init = async (
    pageNum: number,
    size: number,
    chain: number,
    storeIdValue: number,
    networkValue: string,
    address?: string
  ) => {
    try {
      if (!storeIdValue || !networkValue || !address) {
        return
      }

      setLoading(true)
      const response: any = await axios.get(Http.find_transaction, {
        params: {
          ...(chain ? { chain_id: chain } : {}),
          store_id: storeIdValue,
          network: networkValue === 'mainnet' ? 1 : 2,
          address: address,
          page: pageNum,
          page_size: size,
        },
      })

      if (response.result) {
        if (response.data.transactions.length > 0) {
          const rt: RowType[] = response.data.transactions.map((item: any, index: number) => {
            const chainId = item.chainId ?? item.chain_id
            const blockTimestamp = item.blockTimestamp ?? item.block_timestamp
            return {
              id: index + 1,
              chainId,
              chainName: FindChainNamesByChains(chainId),
              hash: item.hash,
              address: item.address,
              fromAddress: item.fromAddress ?? item.from_address,
              toAddress: item.toAddress ?? item.to_address,
              token: item.token,
              transactionType: item.transactType ?? item.transact_type,
              amount: item.amount,
              blockTimestamp: (() => {
                const ts = Number(blockTimestamp)
                if (!Number.isFinite(ts) || ts <= 0) return '—'
                const ms = ts < 1e12 ? ts * 1000 : ts
                return new Date(ms).toLocaleString()
              })(),
            }
          })
          setRows(rt)
          setPage(Number(response.data.page))
          setRowCount(Number(response.data.total))
        } else {
          setRows([])
          setPage(1)
          setRowCount(0)
        }
      } else {
        setSnackSeverity('error')
        setSnackMessage('Could not load data.')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const resolvedStoreId = Number(props.storeId ?? storeId)

  const fetchPage = async (newPage: number) => {
    setPage(newPage)
    await init(
      newPage,
      pageSize,
      Number(props.chain),
      resolvedStoreId,
      props.network,
      props.address
    )
  }

  useEffect(() => {
    const timer = setInterval(() => {
      init(page, pageSize, Number(props.chain), resolvedStoreId, props.network, props.address)
    }, 10 * 1000)

    return () => clearInterval(timer)
  }, [props.chain, resolvedStoreId, props.network, props.address, page])

  useEffect(() => {
    init(page, pageSize, Number(props.chain), resolvedStoreId, props.network, props.address)
  }, [props.chain, resolvedStoreId, props.network, props.address])

  const totalPages = Math.max(1, Math.ceil(rowCount / pageSize))
  const canFetch = Boolean(resolvedStoreId && props.network && props.address)

  return (
    <div className="w-full space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Transactions</p>
            <p className="text-xs text-muted-foreground">
              {!canFetch
                ? 'Enter an address to load transactions'
                : loading && rows.length === 0
                  ? 'Loading…'
                  : rowCount > 0
                    ? `${rowCount} record${rowCount === 1 ? '' : 's'}`
                    : 'No records for this address'}
            </p>
          </div>
        </div>

        {!canFetch || rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Inbox className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              {!canFetch ? 'Waiting for address' : 'No transactions found'}
            </p>
            <p className="max-w-sm text-xs text-muted-foreground">
              {!canFetch
                ? 'Provide a wallet address to search on-chain activity for your store.'
                : 'Incoming and outgoing transfers will appear here once available.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((row) => {
              const direction = normalizeDirection(row.transactionType)
              const explorerUrl = GetBlockchainTxUrlByChainIds(
                props.network === 'mainnet' || network === 'mainnet',
                row.chainId,
                row.hash
              )

              return (
                <li key={`${row.hash}-${row.id}`}>
                  <button
                    type="button"
                    className="flex w-full flex-col gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                    onClick={() => onClickRow(row)}
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
                          <p className="text-sm font-semibold" title={`${row.amount} ${row.token}`}>
                            {FormatCryptoDisplay(row.amount, { coin: row.token })} {row.token}
                          </p>
                          {row.transactionType && (
                            <Badge variant="outline" className="font-normal capitalize">
                              {row.transactionType}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="font-normal">
                            {row.chainName}
                          </Badge>
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
                      {row.blockTimestamp}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {canFetch && rowCount > 0 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={page <= 1}
            onClick={() => fetchPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={page >= totalPages}
            onClick={() => fetchPage(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <TxDialog
        row={selectedValue as RowType}
        open={open}
        onClose={() => setOpen(false)}
        network={props.network}
      />
    </div>
  )
}

export type TxDialogProps = {
  open: boolean
  row: RowType
  onClose: () => void
  network: string
}

function DetailRow({
  label,
  children,
  bold,
}: {
  label: string
  children: React.ReactNode
  bold?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-right break-all ${bold ? 'font-semibold' : ''}`}>
        {children}
      </span>
    </div>
  )
}

function ExplorerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline font-mono text-xs"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </Link>
  )
}

function TxDialog(props: TxDialogProps) {
  const { onClose, row, open, network } = props

  if (!row) return null

  const isMainnet = network === 'mainnet'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-0.5 pt-2">
          <DetailRow label="Chain">{row.chainName}</DetailRow>
          <DetailRow label="Hash">
            <ExplorerLink href={GetBlockchainTxUrlByChainIds(isMainnet, row.chainId, row.hash)}>
              {OmitMiddleString(row.hash, 10)}
            </ExplorerLink>
          </DetailRow>
          <DetailRow label="Address">
            <ExplorerLink
              href={GetBlockchainAddressUrlByChainIds(isMainnet, row.chainId, row.address)}
            >
              {OmitMiddleString(row.address, 10)}
            </ExplorerLink>
          </DetailRow>
          <DetailRow label="From Address">
            <ExplorerLink
              href={GetBlockchainAddressUrlByChainIds(isMainnet, row.chainId, row.fromAddress)}
            >
              {OmitMiddleString(row.fromAddress, 10)}
            </ExplorerLink>
          </DetailRow>
          <DetailRow label="To Address">
            <ExplorerLink
              href={GetBlockchainAddressUrlByChainIds(isMainnet, row.chainId, row.toAddress)}
            >
              {OmitMiddleString(row.toAddress, 10)}
            </ExplorerLink>
          </DetailRow>
          <Separator className="my-2" />
          <DetailRow label="Token" bold>
            {row.token}
          </DetailRow>
          <DetailRow label="Transaction Type">{row.transactionType}</DetailRow>
          <DetailRow label="Amount" bold>
            <span title={`${row.amount} ${row.token}`}>
              {FormatCryptoDisplay(row.amount, { coin: row.token })} {row.token}
            </span>
          </DetailRow>
          <Separator className="my-2" />
          <DetailRow label="Block Timestamp">{row.blockTimestamp}</DetailRow>
        </div>
      </DialogContent>
    </Dialog>
  )
}
