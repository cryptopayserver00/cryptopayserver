import { Settings } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

const Notifications = () => {
  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="pt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="notification settings"
              onClick={() => {
                window.location.href = '/account?tab=notifications'
              }}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-6">
            <NotificationsTab />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications

type RowType = {
  id: number
  label: string
  message: string
  isSeen: number
  date: string
  url: string
}

function NotificationsTab() {
  const [rows, setRows] = useState<RowType[]>([])

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

  const init = async (storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_notification, {
        params: {
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = []
          response.data.forEach(async (item: any, index: number) => {
            rt.push({
              id: item.id,
              label: item.label,
              message: item.message,
              isSeen: item.is_seen,
              date: new Date(item.created_at).toLocaleString(),
              url: item.url,
            })
          })
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
    init(storeId, network)
  }, [storeId, network])

  const onClickSeen = async (id: number, isSeen: number) => {
    try {
      const response: any = await axios.put(Http.update_notification, {
        id: id,
        is_seen: isSeen === 1 ? 2 : 1,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('update Successful!')
        setSnackOpen(true)

        await init(storeId, network)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows && rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id} className={cn(row.isSeen !== 1 && 'bg-muted/40')}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.isSeen !== 1 && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                    <span className={cn(row.isSeen !== 1 && 'font-medium')}>{row.message}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.date}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      window.location.href = row.url
                    }}
                  >
                    Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClickSeen(row.id, row.isSeen)
                    }}
                  >
                    {row.isSeen === 1 ? 'Mark as unseen' : 'Mark as seen'}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
