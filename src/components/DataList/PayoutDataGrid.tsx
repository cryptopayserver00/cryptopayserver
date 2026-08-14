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
import { Button } from '@/components/ui/button'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS, PAYOUT_STATUS } from '@/packages/constants'
import { CHAINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { OmitMiddleString } from '@/utils/strings'
import { FindChainNamesByChains } from '@/utils/web3'
import { useShallow } from 'zustand/react/shallow'

type RowType = {
  id: number
  chainId: number
  payoutId: number
  address: string
  createdDate: string
  crypto: string
  refunded: string
  sourceType: string
  externalPaymentId: number
  chainName: string
  transaction: string
  url: string
}

type GridType = {
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

  const updateStatus = async (
    payoutId: number,
    payout_status: string,
    successMsg = 'Update successful!'
  ) => {
    try {
      setLoadingId(payoutId)
      const response: any = await axios.put(Http.update_payout_by_id, {
        id: payoutId,
        payout_status,
      })
      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage(successMsg)
        setSnackOpen(true)
        await init(network, storeId, props.status)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setLoadingId(null)
    }
  }

  const onClickApprove = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.AwaitingPayment)

  const onClickReject = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.AwaitingApproval)

  const onClickCancel = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.Cancelled)

  const onClickMarkPaid = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.Completed)

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
        console.error('No support right now!')
    }
  }

  const init = async (
    currentNetwork: string,
    currentStoreId: number,
    status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS]
  ) => {
    try {
      const response: any = await axios.get(Http.find_payout, {
        params: {
          store_id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
          payout_status: status,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = response.data.map((item: any, index: number) => ({
            id: index + 1,
            payoutId: item.payout_id,
            chainId: item.chain_id,
            address: item.address,
            createdDate: new Date(item.created_at).toLocaleString(),
            refunded: CURRENCY_SYMBOLS[item.currency] + item.amount,
            crypto: item.crypto,
            sourceType: item.source_type,
            externalPaymentId: item.external_payment_id,
            chainName: FindChainNamesByChains(item.chain_id),
            transaction: item.tx,
            url: '',
          }))
          setRows(rt)
        } else {
          setRows([])
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
              Reject
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
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
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
    </div>
  )
}
