import styled from '@emotion/styled';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Typography } from './Typography';
import {
  Alert,
  Badge,
  Box,
  Button,
  FormControl,
  Icon,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { useStorePresistStore } from 'lib/store/store';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useUserPresistStore } from 'lib/store/user';
import { useSnackPresistStore } from 'lib/store/snack';

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const StyledSidebarHeader = styled.div`
  padding: 0 20px;

  > div {
    width: 100%;
    overflow: hidden;
  }
`;

interface StoreType {
  id: number;
  name: string;
  currency: string;
  price_source: string;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ children, ...rest }) => {
  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);
  const { setStoreId, setStoreName, setStoreCurrency, setStorePriceSource } = useStorePresistStore((state) => state);

  const [stores, setStores] = useState<StoreType[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const getStore = async () => {
    try {
      if (getUserId() === 0) {
        return;
      }

      const response: any = await axios.get(Http.find_store, {
        params: {
          user_id: getUserId(),
        },
      });

      if (response.result && response.data.length > 0) {
        let st: StoreType[] = [];
        response.data.forEach((item: any) => {
          st.push({
            id: item.id,
            name: item.name,
            currency: item.currency,
            price_source: item.price_source,
          });
        });
        setStores(st);
      } else {
        setTimeout(() => {
          window.location.href = '/stores/create';
        }, 2000);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getNotification = async () => {
    try {
      const response: any = await axios.get(Http.find_notification, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
          is_seen: 2,
        },
      });

      if (response.result && response.data.length > 0) {
        setNotificationCount(response.data.length);
      } else {
        setNotificationCount(0);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickStore = async (id: number) => {
    try {
      const response: any = await axios.get(Http.find_store_by_id, {
        params: {
          id: id,
        },
      });

      if (response.result && response.data.length === 1) {
        setStoreId(response.data[0].id);
        setStoreName(response.data[0].name);
        setStoreCurrency(response.data[0].currency);
        setStorePriceSource(response.data[0].price_source);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setSnackSeverity('error');
        setSnackMessage("Can't find the store, please try again later.");
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    getStore();
    getNotification();
  }, []);

  return (
    <StyledSidebarHeader {...rest}>
      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
        <Button
          style={{ padding: 0 }}
          onClick={() => {
            window.location.href = '/dashboard';
          }}
        >
          <Stack direction={'row'} alignItems={'center'}>
            <CustomLogo>C</CustomLogo>
            <Typography fontWeight={'bold'} color="#0098e5" fontSize={10}>
              Crypto Pay
            </Typography>
          </Stack>
        </Button>

        <Box p={1}>
          <IconButton
            onClick={() => {
              window.location.href = '/notifications';
            }}
          >
            <Badge badgeContent={notificationCount} color="primary">
              <NotificationsNoneIcon color="action" />
            </Badge>
          </IconButton>
        </Box>
      </Stack>

      {stores && stores.length > 0 && (
        <Box mt={3}>
          <FormControl fullWidth>
            <Select size={'small'} inputProps={{ 'aria-label': 'Without label' }} value={getStoreId()}>
              {stores.map((item, index) => (
                <MenuItem
                  value={item.id}
                  key={index}
                  onClick={() => {
                    onClickStore(item.id);
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}
              <hr />
              <MenuItem
                onClick={() => {
                  window.location.href = '/stores/create';
                }}
              >
                Create Store
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}
    </StyledSidebarHeader>
  );
};
