import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS } from '@/packages/constants'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { FindChainNamesByChains } from '@/utils/web3'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

type RowType = {
  id: number
  chain: CHAINNAMES
  orderId: number
  sourceType: string
  fiatAmount: string
  cryptoAmount: string
  createdDate: string
  expirationDate: string
  orderStatus: string
}

type GridType = {
  source: 'dashboard' | 'none'
  orderStatus?: string
  orderId?: string
  time?: string
}

const PAGE_SIZE = 10

export default function InvoiceDataGrid(props: GridType) {
  const { t } = useTranslation('')
  const { source } = props

  const [rows, setRows] = useState<RowType[]>([])
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

  const init = async (currentNetwork: string, currentStoreId: number) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_store_id, {
        params: {
          store_id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
          order_status: props.orderStatus,
          order_id: props.orderId,
          time: props.time,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = response.data.map((item: any, index: number) => ({
            id: index + 1,
            orderId: item.orderId,
            sourceType: item.sourceType,
            fiatAmount: CURRENCY_SYMBOLS[item.currency] + item.amount,
            cryptoAmount: `${item.cryptoAmount} ${item.crypto}`,
            chain: FindChainNamesByChains(item.chainId),
            createdDate: new Date(item.createdAt).toLocaleString(),
            expirationDate: new Date(item.expirationAt).toLocaleString(),
            orderStatus: item.orderStatus,
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
    init(network, storeId)
    setPage(0)
  }, [network, storeId, props.orderStatus, props.orderId, props.time])

  const displayRows = source === 'dashboard' ? rows.slice(0, PAGE_SIZE) : rows

  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE)
  const pagedRows =
    source === 'dashboard'
      ? displayRows
      : displayRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const statusVariant = (status: string) => {
    const s = status?.toLowerCase() ?? ''
    if (s.includes('paid') || s.includes('complete') || s.includes('success')) return 'default'
    if (s.includes('pending') || s.includes('await')) return 'secondary'
    if (s.includes('expire') || s.includes('fail') || s.includes('cancel')) return 'destructive'
    return 'outline'
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>{t('Order Id')}</TableHead>
              <TableHead>{t('Fiat Amount')}</TableHead>
              <TableHead>{t('Chain')}</TableHead>
              <TableHead>{t('Crypto Amount')}</TableHead>
              <TableHead>{t('Source Type')}</TableHead>
              <TableHead>{t('Order Status')}</TableHead>
              <TableHead>{t('Created Date')}</TableHead>
              <TableHead>{t('Expiration Date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/payments/invoices/${row.orderId}`
                  }}
                >
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                  <TableCell>{row.fiatAmount}</TableCell>
                  <TableCell>{row.chain}</TableCell>
                  <TableCell>{row.cryptoAmount}</TableCell>
                  <TableCell>{row.sourceType}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.orderStatus)}>{row.orderStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{row.createdDate}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {row.expirationDate}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {source !== 'dashboard' && totalPages > 1 && (
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
