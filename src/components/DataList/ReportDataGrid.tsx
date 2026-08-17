import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS, REPORT_STATUS } from '@/packages/constants'
import { FindChainNamesByChains } from '@/utils/web3'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { RowType } from '@/components/Payments/Reporting'
import { useShallow } from 'zustand/react/shallow'

type GridType = {
  startDate: number
  endDate: number
  status: (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS]
  rows: RowType[]
  setRows: (rows: RowType[]) => void
}

const PAGE_SIZE = 10

export default function ReportDataGrid(props: GridType) {
  const { startDate, endDate, status, rows, setRows } = props
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<RowType>()
  const [page, setPage] = useState(0)

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
    storeId: number,
    network: string,
    startDate: number,
    endDate: number,
    status: string
  ) => {
    try {
      const response: any = await axios.get(Http.find_report, {
        params: {
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
          start_date: startDate,
          end_date: endDate,
          status: status,
        },
      })

      if (response.result) {
          const rows: RowType[] = (response.data ?? []).map((item: any, index: number) => ({
            id: index + 1,
            storeName: item.storeName,
            sourceType: item.sourceType,
            orderId: item.orderId,
            chainId: item.chainId,
            chain: FindChainNamesByChains(item.chainId),
            cryptoAmount: item.cryptoAmount + ' ' + item.crypto,
            fiatAmount: CURRENCY_SYMBOLS[item.currency] + item.amount,
            rate: item.rate,
            description: item.description,
            metadata: item.metadata,
            buyerEmail: item.buyerEmail,
            orderStatus: item.orderStatus,
            paymentMethod: item.paymentMethod,
            createdDate: new Date(item.createdAt).toLocaleString(),
            expirationDate: new Date(item.expirationAt).toLocaleString(),
          }))
          setRows(rows)
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
    init(storeId, network, startDate, endDate, status)
    setPage(0)
  }, [storeId, network, startDate, endDate, status])

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pagedRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const statusVariant = (s: string) => {
    const v = s?.toLowerCase() ?? ''
    if (v.includes('paid') || v.includes('complete') || v.includes('success')) return 'default'
    if (v.includes('pending') || v.includes('await')) return 'secondary'
    if (v.includes('expire') || v.includes('fail') || v.includes('cancel')) return 'destructive'
    return 'outline'
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-medium">Raw data</p>
        <p className="mt-1 text-sm text-muted-foreground">No data</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Order Id</TableHead>
              <TableHead>Fiat Amount</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Crypto Amount</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Source Type</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Expiration Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onClickRow(row)}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.storeName}</TableCell>
                <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                <TableCell>{row.fiatAmount}</TableCell>
                <TableCell>{row.chain}</TableCell>
                <TableCell>{row.cryptoAmount}</TableCell>
                <TableCell>{row.rate}</TableCell>
                <TableCell>{row.sourceType}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.orderStatus)}>{row.orderStatus}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {row.createdDate}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {row.expirationDate}
                </TableCell>
              </TableRow>
            ))}
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

      <TxDialog row={selectedValue as RowType} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export type TxDialogProps = {
  open: boolean
  row: RowType
  onClose: () => void
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string
  value?: string | number
  bold?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-right break-all ${bold ? 'font-semibold' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function TxDialog(props: TxDialogProps) {
  const { onClose, row, open } = props

  if (!row) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-0.5 pt-2">
          <DetailRow label="Store Name" value={row.storeName} />
          <DetailRow label="Order Id" value={row.orderId} />
          <DetailRow label="Source Type" value={row.sourceType} />
          <DetailRow label="Chain" value={row.chain} />
          <Separator className="my-2" />
          <DetailRow label="Fiat Amount" value={row.fiatAmount} bold />
          <DetailRow label="Crypto Amount" value={row.cryptoAmount} bold />
          <DetailRow label="Rate" value={row.rate} />
          <Separator className="my-2" />
          <DetailRow label="Description" value={row.description} bold />
          <DetailRow label="Metadata" value={row.metadata} bold />
          <DetailRow label="Buyer Email" value={row.buyerEmail} bold />
          <DetailRow label="Order Status" value={row.orderStatus} bold />
          <DetailRow label="Payment Method" value={row.paymentMethod} bold />
          <Separator className="my-2" />
          <DetailRow label="Created Date" value={row.createdDate} />
          <DetailRow label="Expiration Date" value={row.expirationDate} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
