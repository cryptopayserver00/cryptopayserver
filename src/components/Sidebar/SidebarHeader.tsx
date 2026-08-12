// import styled from '@emotion/styled';
// import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
// import { Typography } from './Typography';
// import { Badge, Box, Button, FormControl, IconButton, MenuItem, Select, Stack } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { CustomLogo } from '@/components/Logo/CustomLogo';
// import { useStorePresistStore } from '@/lib/store/store';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { useUserPresistStore } from '@/lib/store/user';
// import { useSnackPresistStore } from '@/lib/store/snack';
// import { useWalletPresistStore } from '@/lib/store';

// interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
//   children?: React.ReactNode;
// }

// const StyledSidebarHeader = styled.div`
//   padding: 0 10px;

//   > div {
//     width: 100%;
//     overflow: hidden;
//   }
// `;

// interface StoreType {
//   id: number;
//   name: string;
//   currency: string;
//   price_source: string;
// }

// export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ children, ...rest }) => {
//   const { getUserId, getNetwork } = useUserPresistStore((state) => state);
//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);
//   const { getStoreId, setStoreId, setStoreName, setStoreCurrency, setStorePriceSource } = useStorePresistStore(
//     (state) => state,
//   );
//   const { resetWallet, setWalletId, setIsWallet } = useWalletPresistStore((state) => state);

//   const [stores, setStores] = useState<StoreType[]>([]);
//   const [notificationCount, setNotificationCount] = useState<number>(0);

//   const getStore = async () => {
//     try {
//       if (getUserId() === 0) {
//         return;
//       }

//       const response: any = await axios.get(Http.find_store, {
//         params: {
//           user_id: getUserId(),
//         },
//       });

//       if (response.result) {
//         if (response.data.length > 0) {
//           let st: StoreType[] = [];
//           response.data.forEach((item: any) => {
//             st.push({
//               id: item.id,
//               name: item.name,
//               currency: item.currency,
//               price_source: item.price_source,
//             });
//           });
//           setStores(st);
//         } else {
//           setStores([]);
//         }
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Can not find the data on site!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const getNotification = async () => {
//     try {
//       const response: any = await axios.get(Http.find_notification, {
//         params: {
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           is_seen: 2,
//         },
//       });

//       if (response.result) {
//         if (response.data.length > 0) {
//           setNotificationCount(response.data.length);
//         } else {
//           setNotificationCount(0);
//         }
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Can not find the data on site!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickStore = async (id: number) => {
//     try {
//       const response: any = await axios.get(Http.find_store_by_id, {
//         params: {
//           id: id,
//         },
//       });

//       if (response.result) {
//         setStoreId(response.data.id);
//         setStoreName(response.data.name);
//         setStoreCurrency(response.data.currency);
//         setStorePriceSource(response.data.price_source);

//         resetWallet();

//         const wallet_resp: any = await axios.get(Http.find_wallet, {
//           params: {
//             store_id: response.data.id,
//           },
//         });

//         if (wallet_resp.result) {
//           setWalletId(wallet_resp.data.id);
//           setIsWallet(true);
//         }

//         setTimeout(() => {
//           window.location.reload();
//         }, 2000);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Cannot find the store, please try again later.');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     getStore();
//     getNotification();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <StyledSidebarHeader {...rest}>
//       <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//         <Button
//           style={{ padding: 0 }}
//           onClick={() => {
//             window.location.href = '/dashboard';
//           }}
//         >
//           <Stack direction={'row'} alignItems={'center'}>
//             <CustomLogo>C</CustomLogo>
//             <Typography fontWeight={'bold'} color="#0098e5" fontSize={'large'}>
//               CryptoPay
//             </Typography>
//           </Stack>
//         </Button>

//         <Box p={1}>
//           <IconButton
//             onClick={() => {
//               window.location.href = '/notifications';
//             }}
//           >
//             <Badge badgeContent={notificationCount} color="error">
//               <NotificationsNoneIcon color="action" />
//             </Badge>
//           </IconButton>
//         </Box>
//       </Stack>

//       {stores && stores.length > 0 && (
//         <Box mt={3}>
//           <FormControl fullWidth>
//             <Select size={'small'} inputProps={{ 'aria-label': 'Without label' }} value={getStoreId()}>
//               {stores.map((item, index) => (
//                 <MenuItem
//                   value={item.id}
//                   key={index}
//                   onClick={() => {
//                     onClickStore(item.id);
//                   }}
//                 >
//                   {item.name}
//                 </MenuItem>
//               ))}
//               <hr />
//               <MenuItem
//                 onClick={() => {
//                   window.location.href = '/stores/create';
//                 }}
//               >
//                 Create Store
//               </MenuItem>
//             </Select>
//           </FormControl>
//         </Box>
//       )}
//     </StyledSidebarHeader>
//   );
// };

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Bell, ChevronDown, Plus, Store } from 'lucide-react'
import { useStorePresistStore } from '@/lib/store/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useUserPresistStore } from '@/lib/store/user'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useWalletPresistStore } from '@/lib/store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { SiteLogo } from '../Logo/SiteLogo'

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

interface StoreType {
  id: number
  name: string
  currency: string
  price_source: string
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ className = '', ...rest }) => {
  const router = useRouter()
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)
  const { getStoreId, setStoreId, setStoreName, setStoreCurrency, setStorePriceSource } =
    useStorePresistStore((state) => state)
  const { resetWallet, setWalletId, setIsWallet } = useWalletPresistStore((state) => state)

  const [stores, setStores] = useState<StoreType[]>([])
  const [notificationCount, setNotificationCount] = useState<number>(0)

  const currentStore = stores.find((s) => s.id === getStoreId())
  const currentUserId = useUserPresistStore((state) => state.userId)
  const currentNetwork = useUserPresistStore((state) => state.network)
  const currentStoreId = useStorePresistStore((state) => state.storeId)

  const getStore = async (currentUserId: number) => {
    try {
      if (currentUserId === 0) return

      const response: any = await axios.get(Http.find_store, {
        params: { user_id: currentUserId },
      })

      if (response?.result) {
        setStores(
          response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            currency: item.currency,
            price_source: item.price_source,
          }))
        )
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

  const getNotification = async (currentStoreId: number, currentNetwork: string) => {
    try {
      const response: any = await axios.get(Http.find_notification, {
        params: {
          store_id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
          is_seen: 2,
        },
      })

      if (response?.result) {
        setNotificationCount(response.data?.length || 0)
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

  const onClickStore = async (id: number) => {
    try {
      const response: any = await axios.get(Http.find_store_by_id, {
        params: { id },
      })

      if (response?.result) {
        setStoreId(response.data.id)
        setStoreName(response.data.name)
        setStoreCurrency(response.data.currency)
        setStorePriceSource(response.data.price_source)

        resetWallet()

        const wallet_resp: any = await axios.get(Http.find_wallet, {
          params: { store_id: response.data.id },
        })

        if (wallet_resp?.result) {
          setWalletId(wallet_resp.data.id)
          setIsWallet(true)
        }

        router.replace(router.asPath)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Cannot find the store, please try again later.')
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
    getStore(currentUserId)
    getNotification(currentStoreId, currentNetwork)
  }, [currentUserId, currentStoreId, currentNetwork])

  return (
    <div className={`px-4 w-full ${className}`} {...rest}>
      <div className="flex items-center justify-between">
        <SiteLogo href="/dashboard" />

        <button
          className="p-2 rounded-full hover:bg-gray-100 transition-colors relative flex items-center justify-center text-gray-600 focus:outline-none"
          onClick={() => router.push('/notifications')}
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {notificationCount}
            </span>
          )}
        </button>
      </div>

      {stores.length > 0 && (
        <div className="mt-5">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors focus:outline-none">
              <div className="flex items-center gap-2 truncate">
                <Store size={16} className="text-gray-500 shrink-0" />
                <span className="truncate">{currentStore?.name || 'Select Store'}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400 shrink-0 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[218px]" align="start">
              {stores.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onClickStore(item.id)}
                  className={`cursor-pointer text-xs font-medium ${
                    item.id === getStoreId() ? 'text-[#0098e5] bg-blue-50 font-semibold' : ''
                  }`}
                >
                  {item.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/stores/create')}
                className="cursor-pointer text-xs text-[#0098e5] font-medium flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Create Store</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}
