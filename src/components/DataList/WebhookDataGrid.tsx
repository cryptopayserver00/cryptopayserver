import { useEffect, useState } from 'react'
import { Check, X, FlaskConical, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
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
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

type RowType = {
  id: number
  webhookId: number
  automaticRedelivery: number
  enabled: number
  eventType: number
  payloadUrl: string
  secret: string
  status: number
}

type GridType = {
  source: 'dashboard' | 'none'
  setIsWebhook: (value: boolean) => void
  setPayloadUrl: (value: string) => void
  setSecret: (value: string) => void
  setShowAutomaticRedelivery: (value: boolean) => void
  setShowEnabled: (value: boolean) => void
  setEventType: (value: number) => void
  setModifyId: (value: number) => void
}

const PAGE_SIZE = 10

export default function WebhookDataGrid(props: GridType) {
  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(0)
  const [testingId, setTestingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { userId } = useUserPresistStore(
    useShallow((state) => ({
      userId: state.userId,
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

  const onClickTest = async (row: RowType) => {
    try {
      setTestingId(row.webhookId)
      await axios.get(row.payloadUrl)
      setSnackSeverity('success')
      setSnackMessage('Testing successful!')
      setSnackOpen(true)
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('Testing failed!')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setTestingId(null)
    }
  }

  const onClickModify = (row: RowType) => {
    props.setModifyId(row.webhookId)
    props.setEventType(row.eventType)
    props.setPayloadUrl(row.payloadUrl)
    props.setSecret(row.secret)
    props.setShowAutomaticRedelivery(row.automaticRedelivery === 1)
    props.setShowEnabled(row.enabled === 1)
    props.setIsWebhook(true)
  }

  const onClickDelete = async (row: RowType) => {
    try {
      setDeletingId(row.webhookId)
      const response: any = await axios.put(Http.delete_webhook_setting_by_id, {
        id: row.webhookId,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Delete successful!')
        setSnackOpen(true)
        await init(storeId, userId)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Delete failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setDeletingId(null)
    }
  }

  const init = async (storeId: number, userId: number) => {
    try {
      const response: any = await axios.get(Http.find_webhook_setting, {
        params: {
          store_id: storeId,
          user_id: userId,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = response.data.map((item: any, index: number) => ({
            id: index + 1,
            webhookId: item.id,
            automaticRedelivery: item.automatic_redelivery,
            enabled: item.enabled,
            eventType: item.event_type,
            payloadUrl: item.payload_url,
            secret: item.secret,
            status: item.status,
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
    init(storeId, userId)
  }, [storeId, userId])

  const displayRows = props.source === 'dashboard' ? rows.slice(0, PAGE_SIZE) : rows

  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE)
  const pagedRows =
    props.source === 'dashboard'
      ? displayRows
      : displayRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Url</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.enabled === 1 ? (
                      <Check className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs max-w-md truncate">
                    {row.payloadUrl}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        disabled={testingId === row.webhookId}
                        onClick={() => onClickTest(row)}
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        {testingId === row.webhookId ? 'Testing...' : 'Test'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => onClickModify(row)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Modify
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-destructive hover:text-destructive"
                        disabled={deletingId === row.webhookId}
                        onClick={() => onClickDelete(row)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === row.webhookId ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No webhooks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {props.source !== 'dashboard' && totalPages > 1 && (
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
