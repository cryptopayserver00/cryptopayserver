import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useStorePresistStore } from '@/lib/store'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useUserPresistStore } from '@/lib/store/user'
import { NOTIFICATION, NOTIFICATIONS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

const Notification = () => {
  const [id, setId] = useState<number>(0)
  const [notifications, setNotifications] = useState<NOTIFICATION[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

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

  const getNotifications = async (userId: number, storeId: number) => {
    try {
      const response: any = await axios.get(Http.find_notification_setting, {
        params: {
          user_id: userId,
          store_id: storeId,
        },
      })

      if (response.result) {
        const notificationIdsArray = response.data.notifications
          .split(',')
          .map((id: any) => Number(id.trim()))

        const ns: NOTIFICATION[] = NOTIFICATIONS.map((item: NOTIFICATION) => ({
          id: item.id,
          title: item.title,
          status: notificationIdsArray.includes(item.id),
        }))

        setNotifications(ns)
        setId(response.data.id)
      } else {
        setNotifications([])
        setSnackSeverity('error')
        setSnackMessage('Something wrong, please try it again')
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
    getNotifications(userId, storeId)
  }, [userId, storeId])

  async function handleChangeNotification(itemId: number) {
    try {
      setIsUpdating(true)
      let ids: number[] = []

      if (itemId === 0) {
        ids = []
      } else {
        itemId = itemId - 1
        if (!notifications) return

        notifications[itemId].status = !notifications[itemId].status

        ids = notifications.filter((item) => item.status).map((item) => item.id)
      }

      const response: any = await axios.put(Http.update_notification_setting, {
        id: id,
        notifications: ids.join(','),
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful update!')
        setSnackOpen(true)
        await getNotifications(userId, storeId)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Something wrong, please try it again')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          To disable notification for a feature, kindly toggle off the specified feature.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Features
          </CardTitle>
          <CardDescription>Choose which events you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {notifications && notifications.length > 0 ? (
            notifications.map((item: NOTIFICATION, index) => (
              <div key={item.id}>
                {index > 0 && <Separator className="my-1" />}
                <div className="flex items-center justify-between py-3">
                  <Label
                    htmlFor={`notif-${item.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {item.title}
                  </Label>
                  <Switch
                    id={`notif-${item.id}`}
                    checked={item.status}
                    disabled={isUpdating}
                    onCheckedChange={() => handleChangeNotification(item.id)}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No notification settings available
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Disable all notifications</p>
              <p className="text-sm text-muted-foreground">Turn off every notification at once</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => handleChangeNotification(0)}
              disabled={isUpdating}
              className="gap-2 shrink-0"
            >
              <BellOff className="h-4 w-4" />
              {isUpdating ? 'Updating...' : 'Disable all'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Notification
