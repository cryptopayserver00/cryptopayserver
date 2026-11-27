import { useEffect, useState } from 'react'
import { Check, X, Send, Ban, CircleCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS, PAYOUT_STATUS } from '@/packages/constants'
import { CHAINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { OmitMiddleString } from '@/utils/strings'
import { BigIsPositive, FormatCryptoAmount } from '@/utils/number'
import { FindChainNamesByChains } from '@/utils/web3'
import { useShallow } from 'zustand/react/shallow'

interface RowType {
  id: number
  chainId: number
  payoutId: number
  address: string
  createdDate: string
  crypto: string
  cryptoAmount: string | null
  refunded: string
  sourceType: string
  externalPaymentId: number
  chainName: string
  transaction: string
  url: string
}

interface GridType {
  status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS]
}

const PAGE_SIZE = 10

export default function PayoutDataGrid(props: GridType) {
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

  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(0)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [pendingCancel, setPendingCancel] = useState<RowType | null>(null)
  const [pendingMarkPaid, setPendingMarkPaid] = useState<RowType | null>(null)
  const [pendingApprove, setPendingApprove] = useState<RowType | null>(null)
  const [pendingReject, setPendingReject] = useState<RowType | null>(null)

  const updateStatus = async (
    payoutId: number,
    payout_status: string,
    successMsg = 'Updated successfully!',
    extras?: { account_password?: string; tx?: string; crypto_amount?: number }
  ) => {
    try {
      setLoadingId(payoutId)
      const response: any = await axios.put(Http.update_payout_by_id, {
        id: payoutId,
        payout_status,
        ...(extras?.account_password ? { account_password: extras.account_password } : {}),
        ...(extras?.tx ? { tx: extras.tx } : {}),
        ...(extras?.crypto_amount != null ? { crypto_amount: extras.crypto_amount } : {}),
      })
      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage(successMsg)
        setSnackOpen(true)
        await init(network, storeId, props.status)
      } else {
        setSnackSeverity('error')
        setSnackMessage(response.message || 'Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    } finally {
      setLoadingId(null)
    }
  }

  const onClickApprove = (row: RowType) => setPendingApprove(row)

  const onClickReject = (row: RowType) => setPendingReject(row)

  const onClickCancel = (row: RowType) => setPendingCancel(row)

  const onClickMarkPaid = (row: RowType) => setPendingMarkPaid(row)

  const onClickSend = (row: RowType) => {
    switch (row.chainId) {
      case CHAINS.BITCOIN:
        window.location.href = `/wallets/bitcoin/send?payoutId=${row.payoutId}`
        return
      case CHAINS.LITECOIN:
        window.location.href = `/wallets/litecoin/send?payoutId=${row.payoutId}`
        return
      case CHAINS.XRP:
        window.location.href = `/wallets/xrp/send?payoutId=${row.payoutId}`
        return
      case CHAINS.BITCOINCASH:
        window.location.href = `/wallets/bitcoincash/send?payoutId=${row.payoutId}`
        return
      case CHAINS.ETHEREUM:
      case CHAINS.BSC:
      case CHAINS.ARBITRUM:
      case CHAINS.ARBITRUMNOVA:
      case CHAINS.AVALANCHE:
      case CHAINS.POLYGON:
      case CHAINS.BASE:
      case CHAINS.OPTIMISM:
        window.location.href = `/wallets/send?chainId=${row.chainId}&payoutId=${row.payoutId}`
        return
      case CHAINS.TRON:
        window.location.href = `/wallets/tron/send?payoutId=${row.payoutId}`
        return
      case CHAINS.SOLANA:
        window.location.href = `/wallets/solana/send?payoutId=${row.payoutId}`
        return
      case CHAINS.TON:
        window.location.href = `/wallets/ton/send?payoutId=${row.payoutId}`
        return
      default:
        setSnackSeverity('error')
        setSnackMessage('Sending payouts is not supported for this chain yet.')
        setSnackOpen(true)
    }
  }

  const init = async (
    currentNetwork: string,
    currentStoreId: number,
    status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS]
  ) => {
    try {
      if (!currentStoreId) {
        setRows([])
        return
      }

      const response: any = await axios.get(Http.find_payout, {
        params: {
          store_id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
          payout_status: status,
        },
      })

      if (response.result) {
        const rows: RowType[] = (response.data ?? []).map((item: any, index: number) => ({
          id: index + 1,
          payoutId: item.payoutId,
          chainId: item.chainId,
          address: item.address,
          createdDate: new Date(item.createdAt).toLocaleString(),
          refunded: CURRENCY_SYMBOLS[item.currency] + item.amount,
          crypto: item.crypto,
          cryptoAmount:
            item.cryptoAmount != null && BigIsPositive(item.cryptoAmount)
              ? FormatCryptoAmount(String(item.cryptoAmount), 12)
              : null,
          sourceType: item.sourceType,
          externalPaymentId: item.externalPaymentId,
          chainName: FindChainNamesByChains(item.chainId),
          transaction: item.tx,
          url: '',
        }))
        setRows(rows)
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
    }
  }

  useEffect(() => {
    if (props.status) {
      init(network, storeId, props.status)
      setPage(0)
    }
  }, [network, storeId, props.status])

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pagedRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const renderActions = (row: RowType) => {
    const busy = loadingId === row.payoutId

    switch (props.status) {
      case PAYOUT_STATUS.AwaitingApproval:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickApprove(row)}
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => onClickCancel(row)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        )

      case PAYOUT_STATUS.AwaitingPayment:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickReject(row)}
            >
              <Ban className="h-3.5 w-3.5" />
              Return for approval
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickSend(row)}
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => onClickCancel(row)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickMarkPaid(row)}
            >
              <CircleCheck className="h-3.5 w-3.5" />
              Mark paid
            </Button>
          </div>
        )

      case PAYOUT_STATUS.InProgress:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => onClickCancel(row)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickMarkPaid(row)}
            >
              <CircleCheck className="h-3.5 w-3.5" />
              Mark paid
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Crypto</TableHead>
              <TableHead>Refunded</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Source Type</TableHead>
              <TableHead>External Payment Id</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Start</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.url ? 'cursor-pointer' : undefined}
                  onClick={() => {
                    if (row.url) window.location.href = row.url
                  }}
                >
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.chainName}</TableCell>
                  <TableCell>{row.crypto}</TableCell>
                  <TableCell>{row.refunded}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.address, 10)}
                  </TableCell>
                  <TableCell>{row.sourceType}</TableCell>
                  <TableCell>{row.externalPaymentId}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.transaction, 10)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {row.createdDate}
                  </TableCell>
                  <TableCell className="text-right">{renderActions(row)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No payouts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            aria-label="Previous page"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Next page"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <AlertDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => {
          if (!open && loadingId === null) setPendingCancel(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel payout?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the payout as cancelled. You can create a new payout later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingId !== null}>Keep payout</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                if (pendingCancel) {
                  updateStatus(pendingCancel.payoutId, PAYOUT_STATUS.Cancelled, 'Payout cancelled').finally(
                    () => setPendingCancel(null)
                  )
                }
              }}
            >
              {loadingId !== null ? 'Cancelling...' : 'Cancel payout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingApprove !== null}
        onOpenChange={(open) => {
          if (!open && loadingId === null) setPendingApprove(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve payout?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves the payout to awaiting payment so it can be sent on-chain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingId !== null}
              onClick={(e) => {
                e.preventDefault()
                if (pendingApprove) {
                  updateStatus(
                    pendingApprove.payoutId,
                    PAYOUT_STATUS.AwaitingPayment,
                    'Payout approved'
                  ).finally(() => setPendingApprove(null))
                }
              }}
            >
              {loadingId !== null ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingReject !== null}
        onOpenChange={(open) => {
          if (!open && loadingId === null) setPendingReject(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return payout for approval?</AlertDialogTitle>
            <AlertDialogDescription>
              This sends the payout back to awaiting approval. No on-chain payment will be made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingId !== null}
              onClick={(e) => {
                e.preventDefault()
                if (pendingReject) {
                  updateStatus(
                    pendingReject.payoutId,
                    PAYOUT_STATUS.AwaitingApproval,
                    'Returned for approval'
                  ).finally(() => setPendingReject(null))
                }
              }}
            >
              {loadingId !== null ? 'Updating...' : 'Return for approval'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingMarkPaid !== null}
        onOpenChange={(open) => {
          if (!open && loadingId === null) setPendingMarkPaid(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark payout as paid?</AlertDialogTitle>
            <AlertDialogDescription>
              Only do this if the on-chain payment already succeeded. A transaction hash, crypto
              amount, and your account password are required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={loadingId !== null}
              onClick={(e) => {
                e.preventDefault()
                if (!pendingMarkPaid) return
                const row = pendingMarkPaid
                void (async () => {
                  if (!row.transaction) {
                    setSnackSeverity('error')
                    setSnackMessage('Transaction hash required to mark as paid')
                    setSnackOpen(true)
                    setPendingMarkPaid(null)
                    return
                  }
                  if (row.cryptoAmount == null) {
                    setSnackSeverity('error')
                    setSnackMessage(
                      'Crypto amount missing. Complete via Send first, or ensure the payout has a crypto amount.'
                    )
                    setSnackOpen(true)
                    setPendingMarkPaid(null)
                    return
                  }
                  const { promptAccountPassword } = await import('@/utils/wallet-password')
                  const accountPassword = await promptAccountPassword(
                    'Enter your account password to mark payout as paid'
                  )
                  if (accountPassword === null) {
                    setPendingMarkPaid(null)
                    return
                  }
                  await updateStatus(row.payoutId, PAYOUT_STATUS.Completed, 'Marked as paid', {
                    account_password: accountPassword,
                    tx: row.transaction,
                    crypto_amount: row.cryptoAmount,
                  })
                  setPendingMarkPaid(null)
                })()
              }}
            >
              {loadingId !== null ? 'Updating...' : 'Mark as paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
