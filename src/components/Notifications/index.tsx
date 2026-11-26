import {
  Bell,
  BellOff,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  Inbox,
  Settings,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

type FilterTab = 'all' | 'unread' | 'read'

interface RowType {
  id: number
  label: string
  message: string
  isSeen: number
  date: string
  url: string
}

const PAGE_SIZE = 20

const Notifications = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <NotificationsPanel />
    </div>
  )
}

export default Notifications

function NotificationsPanel() {
  const [rows, setRows] = useState<RowType[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const { storeId, isStore } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
      isStore: state.isStore,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const init = async (currentStoreId: number, currentNetwork: string) => {
    if (!currentStoreId) {
      setRows([])
      return
    }

    try {
      setLoading(true)
      const response: any = await axios.get(Http.find_notification, {
        params: {
          store_id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        const nextRows: RowType[] = (response.data ?? []).map((item: any) => ({
          id: item.id,
          label: item.label,
          message: item.message,
          isSeen: item.isSeen,
          date: new Date(item.createdAt).toLocaleString(),
          url: item.url,
        }))
        setRows(nextRows)
      } else {
        showSnack('error', 'Could not load notifications.')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    init(storeId, network)
  }, [storeId, network])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filter])

  const unreadCount = useMemo(() => rows.filter((row) => row.isSeen !== 1).length, [rows])
  const readCount = rows.length - unreadCount

  const filteredRows = useMemo(() => {
    if (filter === 'unread') return rows.filter((row) => row.isSeen !== 1)
    if (filter === 'read') return rows.filter((row) => row.isSeen === 1)
    return rows
  }, [rows, filter])

  const visibleRows = filteredRows.slice(0, visibleCount)
  const hasMore = filteredRows.length > visibleCount

  const onClickSeen = async (id: number, isSeen: number) => {
    try {
      const response: any = await axios.put(Http.update_notification, {
        id,
        is_seen: isSeen === 1 ? 2 : 1,
      })

      if (response.result) {
        setRows((prev) =>
          prev.map((row) =>
            row.id === id ? { ...row, isSeen: isSeen === 1 ? 2 : 1 } : row
          )
        )
      } else {
        showSnack('error', response.message || 'Update failed')
      }
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    }
  }

  const onMarkAllRead = async () => {
    const unread = rows.filter((row) => row.isSeen !== 1)
    if (unread.length === 0) return

    try {
      setMarkingAll(true)
      const results = await Promise.all(
        unread.map((row) =>
          axios.put(Http.update_notification, {
            id: row.id,
            is_seen: 1,
          })
        )
      )
      const failed = results.some((item: any) => !item?.result)
      if (failed) {
        showSnack('error', 'Some notifications could not be updated')
      } else {
        showSnack('success', 'All notifications marked as read')
      }
      await init(storeId, network)
    } catch (e) {
      showSnack('error', getApiErrorMessage(e))
      console.error(e)
    } finally {
      setMarkingAll(false)
    }
  }

  if (!isStore || !storeId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Store className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">No store selected</p>
            <p className="text-sm text-muted-foreground">
              Create or select a store to view notifications.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href="/stores/create">Create store</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="rounded-full px-2">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Store activity, invoices, payouts, and system updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={markingAll || unreadCount === 0}
            onClick={onMarkAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? 'Updating...' : 'Mark all read'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notification settings"
            onClick={() => {
              window.location.href = '/account?tab=notifications'
            }}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as FilterTab)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="all" className="gap-1.5">
            All
            <span className="text-muted-foreground">{rows.length}</span>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-1.5">
            Unread
            <span className="text-muted-foreground">{unreadCount}</span>
          </TabsTrigger>
          <TabsTrigger value="read" className="gap-1.5">
            Read
            <span className="text-muted-foreground">{readCount}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden shadow-none">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
              <Bell className="h-4 w-4 animate-pulse" />
              Loading notifications...
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                {filter === 'unread' ? (
                  <BellOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Inbox className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium">
                  {filter === 'all'
                    ? 'No notifications yet'
                    : filter === 'unread'
                      ? 'You are all caught up'
                      : 'No read notifications'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {filter === 'all'
                    ? 'New activity for this store will show up here.'
                    : filter === 'unread'
                      ? 'Unread items will appear in this list.'
                      : 'Switch to All to browse every notification.'}
                </p>
              </div>
              {filter !== 'all' && rows.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
                  View all
                </Button>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {visibleRows.map((row) => {
                const unread = row.isSeen !== 1
                return (
                  <li
                    key={row.id}
                    className={cn(
                      'group relative px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5',
                      unread && 'bg-blue-50/50'
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="relative mt-1.5 shrink-0">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full',
                            unread
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <Bell className="h-4 w-4" />
                        </div>
                        {unread && (
                          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 space-y-1">
                            {row.label ? (
                              <Badge variant="outline" className="font-normal">
                                {row.label}
                              </Badge>
                            ) : null}
                            <p
                              className={cn(
                                'text-sm leading-relaxed text-foreground',
                                unread && 'font-medium'
                              )}
                            >
                              {row.message}
                            </p>
                            <p className="text-xs text-muted-foreground">{row.date}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {row.url ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5"
                              onClick={() => {
                                window.location.href = row.url
                              }}
                            >
                              Details
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => onClickSeen(row.id, row.isSeen)}
                          >
                            {unread ? 'Mark as read' : 'Mark as unread'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            View more
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {!hasMore && filteredRows.length > PAGE_SIZE && (
        <p className="text-center text-xs text-muted-foreground">
          Showing all {filteredRows.length} notifications
        </p>
      )}
    </>
  )
}
