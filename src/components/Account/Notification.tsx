import { Box, Button, Stack, Switch, Typography } from '@mui/material';
import { useStorePresistStore } from 'lib/store';
import { useSnackPresistStore } from 'lib/store/snack';
import { useUserPresistStore } from 'lib/store/user';
import { NOTIFICATION, NOTIFICATIONS } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Notification = () => {
  const [notification, setNotification] = useState<NOTIFICATION[]>([]);

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state);

  const getNotifications = async () => {
    try {
      const response: any = await axios.get(Http.find_notification_setting, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      });

      if (response.result && response.data.length > 0) {
        let notification_list: NOTIFICATION[] = [];

        const notificationIdsArray = response.data[0].notifications.split(',').map((id: any) => Number(id.trim()));

        NOTIFICATIONS.forEach((item: NOTIFICATION) => {
          let status = false;
          if (notificationIdsArray.includes(item.id)) {
            status = true;
          }
          notification_list.push({
            id: item.id,
            title: item.title,
            status: status,
          });
        });

        setNotification(notification_list);
      } else {
        setNotification([]);

        setSnackSeverity('error');
        setSnackMessage('Something wrong, please try it again');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    await getNotifications();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangeNotification(itemId: number) {
    try {
      let ids: number[] = [];

      if (itemId === 0) {
        ids = [];
      } else {
        itemId = itemId - 1;
        if (!notification) {
          return;
        }
        notification[itemId].status = !notification[itemId].status;

        notification.forEach((item) => {
          if (item.status) {
            ids.push(item.id);
          }
        });
      }

      const response: any = await axios.put(Http.update_notification_setting, {
        user_id: getUserId(),
        store_id: getStoreId(),
        notifications: ids.join(','),
      });
      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);
        await getNotifications();
      } else {
        setSnackSeverity('error');
        setSnackMessage('Something wrong, please try it again');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  }

  return (
    <Box>
      <Typography variant={'h6'}>Notification Settings</Typography>
      <Typography mt={2}>To disable notification for a feature, kindly toggle off the specified feature.</Typography>

      <Box mt={2}>
        {notification &&
          notification.map((item: NOTIFICATION, index) => (
            <Stack direction={'row'} alignItems={'center'} key={index}>
              <Switch
                checked={item.status}
                onChange={() => {
                  handleChangeNotification(item.id);
                }}
              />
              <Typography ml={2}>{item.title}</Typography>
            </Stack>
          ))}
      </Box>

      <Box mt={4}>
        <Button
          variant={'contained'}
          onClick={() => {
            handleChangeNotification(0);
          }}
        >
          Disable all notifications
        </Button>
      </Box>
    </Box>
  );
};

export default Notification;
