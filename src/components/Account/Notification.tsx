// import { Box, Button, Stack, Switch, Typography } from '@mui/material';
// import { useStorePresistStore } from '@/lib/store';
// import { useSnackPresistStore } from '@/lib/store/snack';
// import { useUserPresistStore } from '@/lib/store/user';
// import { NOTIFICATION, NOTIFICATIONS } from '@/packages/constants';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';

// const Notification = () => {
//   const [id, setId] = useState<number>(0);
//   const [notification, setNotification] = useState<NOTIFICATION[]>([]);

//   const { getUserId } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state);

//   const getNotifications = async () => {
//     try {
//       const response: any = await axios.get(Http.find_notification_setting, {
//         params: {
//           user_id: getUserId(),
//           store_id: getStoreId(),
//         },
//       });

//       if (response.result) {
//         let notification_list: NOTIFICATION[] = [];

//         const notificationIdsArray = response.data.notifications.split(',').map((id: any) => Number(id.trim()));

//         NOTIFICATIONS.forEach((item: NOTIFICATION) => {
//           let status = false;
//           if (notificationIdsArray.includes(item.id)) {
//             status = true;
//           }
//           notification_list.push({
//             id: item.id,
//             title: item.title,
//             status: status,
//           });
//         });

//         setNotification(notification_list);
//         setId(response.data.id);
//       } else {
//         setNotification([]);

//         setSnackSeverity('error');
//         setSnackMessage('Something wrong, please try it again');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const init = async () => {
//     await getNotifications();
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function handleChangeNotification(itemId: number) {
//     try {
//       let ids: number[] = [];

//       if (itemId === 0) {
//         ids = [];
//       } else {
//         itemId = itemId - 1;
//         if (!notification) {
//           return;
//         }
//         notification[itemId].status = !notification[itemId].status;

//         notification.forEach((item) => {
//           if (item.status) {
//             ids.push(item.id);
//           }
//         });
//       }

//       const response: any = await axios.put(Http.update_notification_setting, {
//         id: id,
//         // user_id: getUserId(),
//         // store_id: getStoreId(),
//         notifications: ids.join(','),
//       });
//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful update!');
//         setSnackOpen(true);
//         await getNotifications();
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Something wrong, please try it again');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   }

//   return (
//     <Box>
//       <Typography variant={'h6'}>Notification Settings</Typography>
//       <Typography mt={2}>To disable notification for a feature, kindly toggle off the specified feature.</Typography>

//       <Box mt={2}>
//         {notification &&
//           notification.map((item: NOTIFICATION, index) => (
//             <Stack direction={'row'} alignItems={'center'} key={index}>
//               <Switch
//                 checked={item.status}
//                 onChange={() => {
//                   handleChangeNotification(item.id);
//                 }}
//               />
//               <Typography ml={2}>{item.title}</Typography>
//             </Stack>
//           ))}
//       </Box>

//       <Box mt={4}>
//         <Button
//           variant={'contained'}
//           onClick={() => {
//             handleChangeNotification(0);
//           }}
//           color={'error'}
//         >
//           Disable all notifications
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Notification;

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

const Notification = () => {
  const [id, setId] = useState<number>(0)
  const [notification, setNotification] = useState<NOTIFICATION[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const { getUserId } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state)

  const getNotifications = async () => {
    try {
      const response: any = await axios.get(Http.find_notification_setting, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      })

      if (response.result) {
        const notification_list: NOTIFICATION[] = []
        const notificationIdsArray = response.data.notifications
          .split(',')
          .map((id: any) => Number(id.trim()))

        NOTIFICATIONS.forEach((item: NOTIFICATION) => {
          notification_list.push({
            id: item.id,
            title: item.title,
            status: notificationIdsArray.includes(item.id),
          })
        })

        setNotification(notification_list)
        setId(response.data.id)
      } else {
        setNotification([])
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
    getNotifications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleChangeNotification(itemId: number) {
    try {
      setIsUpdating(true)
      let ids: number[] = []

      if (itemId === 0) {
        ids = []
      } else {
        itemId = itemId - 1
        if (!notification) return

        notification[itemId].status = !notification[itemId].status

        notification.forEach((item) => {
          if (item.status) {
            ids.push(item.id)
          }
        })
      }

      const response: any = await axios.put(Http.update_notification_setting, {
        id: id,
        notifications: ids.join(','),
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful update!')
        setSnackOpen(true)
        await getNotifications()
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          To disable notification for a feature, kindly toggle off the specified feature.
        </p>
      </div>

      {/* Notification List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Features
          </CardTitle>
          <CardDescription>Choose which events you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {notification && notification.length > 0 ? (
            notification.map((item: NOTIFICATION, index) => (
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

      {/* Disable All */}
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
