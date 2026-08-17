import { useEffect, useState } from 'react'
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
import { useShallow } from 'zustand/react/shallow'

type RowType = {
  id: number
  date: string
  message: string
}

export function InvoiceEventDataTab(params: { orderId: number }) {
  const { orderId } = params

  const [rows, setRows] = useState<RowType[]>([])

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const getEvent = async () => {
    if (orderId && orderId > 0) {
      try {
        const response: any = await axios.get(Http.find_invoice_event_by_order_id, {
          params: {
            order_id: orderId,
          },
        })

        if (response.result) {
          const rows: RowType[] = (response.data || []).map((item: any, index: number) => ({
            id: index + 1,
            date: new Date(item.createdAt).toLocaleString(),
            message: item.message,
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
  }

  useEffect(() => {
    getEvent()
  }, [orderId])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">Date</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {row.date}
                </TableCell>
                <TableCell className="text-sm">{row.message}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                No events found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
