// import { ReportGmailerrorred } from '@mui/icons-material';
// import {
//   Alert,
//   AlertTitle,
//   Box,
//   Button,
//   Container,
//   FormControl,
//   IconButton,
//   InputAdornment,
//   OutlinedInput,
//   Stack,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';

// const Shopify = () => {
//   const [openExplain, setOpenExplain] = useState<boolean>(false);
//   const [id, setId] = useState<number>(0);
//   const [shopName, setShopName] = useState<string>('');
//   const [apiKey, setApiKey] = useState<string>('');
//   const [adminApiAccessToken, setAdminApiAccessToken] = useState<string>('');

//   const { getUserId } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const init = async () => {
//     try {
//       const response: any = await axios.get(Http.find_shopify_setting, {
//         params: {
//           user_id: getUserId(),
//           store_id: getStoreId(),
//         },
//       });

//       if (response.result) {
//         setId(response.data.id);
//         setShopName(response.data.shop_name);
//         setApiKey(response.data.api_key);
//         setAdminApiAccessToken(response.data.admin_api_access_token);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onClickSave = async () => {
//     try {
//       if (id === 0) {
//         // save
//         const response: any = await axios.post(Http.create_shopify_setting, {
//           user_id: getUserId(),
//           store_id: getStoreId(),
//           shop_name: shopName,
//           api_key: apiKey,
//           admin_api_access_token: adminApiAccessToken,
//         });

//         if (response.result) {
//           setSnackSeverity('success');
//           setSnackMessage('Successful create!');
//           setSnackOpen(true);
//         } else {
//           setSnackSeverity('error');
//           setSnackMessage('Failed create!');
//           setSnackOpen(true);
//         }
//       } else if (id > 0) {
//         // update
//         const response: any = await axios.put(Http.update_shopify_setting, {
//           id: id,
//           shop_name: shopName,
//           api_key: apiKey,
//           admin_api_access_token: adminApiAccessToken,
//         });

//         if (response.result) {
//           setSnackSeverity('success');
//           setSnackMessage('Successful update!');
//           setSnackOpen(true);
//         } else {
//           setSnackSeverity('error');
//           setSnackMessage('Failed update!');
//           setSnackOpen(true);
//         }
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   return (
//     <Box>
//       <Container>
//         <Box>
//           <Box mt={2}>
//             <Alert severity="warning">
//               <AlertTitle>Important notice</AlertTitle>
//               This Shopify integration has been discontinued by Shopify and will no longer be supported after{' '}
//               <b>August 31, 2025</b>.
//               <br />
//               If you completed your CryptoPay Server-Shopify setup before <b>December 31, 2024</b>, you may continue
//               using it until August 31, 2025.
//               <br />
//               However, we recommend transitioning to Shopify V2 for continued functionality.
//               <br />
//               All new users have to use Shopify V2. Refer to this guide to get started with Shopify V2
//             </Alert>
//           </Box>

//           <Stack direction={'row'} alignItems={'center'} pt={2}>
//             <Typography variant="h6">Shopify</Typography>
//             <IconButton
//               onClick={() => {
//                 setOpenExplain(!openExplain);
//               }}
//             >
//               <ReportGmailerrorred />
//             </IconButton>
//           </Stack>
//           {openExplain && (
//             <Alert severity="info">
//               <AlertTitle>Info</AlertTitle>
//               Introducing CryptoPay Server for Shopify – open-source payment gateway that enables you accept crypto
//               payments directly on your website or stores from customers with no fee.
//             </Alert>
//           )}
//           <Typography mt={2}>Connect CryptoPay Server to your Shopify checkout experience to accept Crypto.</Typography>
//           <Box mt={3}>
//             <Typography>Shop Name</Typography>
//             <Box mt={1}>
//               <FormControl variant="outlined" fullWidth>
//                 <OutlinedInput
//                   size={'small'}
//                   startAdornment={<InputAdornment position="end">https://</InputAdornment>}
//                   endAdornment={<InputAdornment position="end">.myshopify.com</InputAdornment>}
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={shopName}
//                   onChange={(e: any) => {
//                     setShopName(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//           <Box mt={3}>
//             <Typography>API KEY</Typography>
//             <Box mt={1}>
//               <FormControl fullWidth variant="outlined">
//                 <OutlinedInput
//                   size={'small'}
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={apiKey}
//                   onChange={(e: any) => {
//                     setApiKey(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//           <Box mt={4}>
//             <Typography>Admin API access token</Typography>
//             <Box mt={1}>
//               <FormControl fullWidth variant="outlined">
//                 <OutlinedInput
//                   size={'small'}
//                   type="password"
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={adminApiAccessToken}
//                   onChange={(e: any) => {
//                     setAdminApiAccessToken(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//           <Box mt={5}>
//             <Button variant={'contained'} size={'large'} onClick={onClickSave} color="success">
//               Save
//             </Button>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Shopify;

import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

export const Shopify = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)
  const [id, setId] = useState<number>(0)
  const [shopName, setShopName] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [adminApiAccessToken, setAdminApiAccessToken] = useState<string>('')

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

  const init = async (userId: number, storeId: number) => {
    try {
      const response: any = await axios.get(Http.find_shopify_setting, {
        params: {
          user_id: userId,
          store_id: storeId,
        },
      })

      if (response.result) {
        setId(response.data.id)
        setShopName(response.data.shop_name)
        setApiKey(response.data.api_key)
        setAdminApiAccessToken(response.data.admin_api_access_token)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(userId, storeId)
  }, [userId, storeId])

  const onClickSave = async () => {
    try {
      if (id === 0) {
        // save
        const response: any = await axios.post(Http.create_shopify_setting, {
          user_id: storeId,
          store_id: storeId,
          shop_name: shopName,
          api_key: apiKey,
          admin_api_access_token: adminApiAccessToken,
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Successful create!')
          setSnackOpen(true)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Failed create!')
          setSnackOpen(true)
        }
      } else if (id > 0) {
        // update
        const response: any = await axios.put(Http.update_shopify_setting, {
          id: id,
          shop_name: shopName,
          api_key: apiKey,
          admin_api_access_token: adminApiAccessToken,
        })

        if (response.result) {
          setSnackSeverity('success')
          setSnackMessage('Successful update!')
          setSnackOpen(true)
        } else {
          setSnackSeverity('error')
          setSnackMessage('Failed update!')
          setSnackOpen(true)
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      {/* 废弃警告提示 Banner */}
      <Alert
        variant="destructive"
        className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 text-amber-900 dark:text-amber-200"
      >
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-300 font-bold">
          Important notice
        </AlertTitle>
        <AlertDescription className="text-sm mt-1 leading-relaxed">
          This Shopify integration has been discontinued by Shopify and will no longer be supported
          after <strong className="font-semibold underline">August 31, 2025</strong>.
          <br />
          If you completed your CryptoPay Server-Shopify setup before{' '}
          <strong className="font-semibold underline">December 31, 2024</strong>, you may continue
          using it until August 31, 2025.
          <br />
          However, we recommend transitioning to Shopify V2 for continued functionality.
          <br />
          All new users have to use Shopify V2. Refer to this guide to get started with Shopify V2.
        </AlertDescription>
      </Alert>

      {/* 页头标题栏 */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Shopify Integration</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setOpenExplain(!openExplain)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* 说明 Alert 区块 */}
      {openExplain && (
        <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Info</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
            Introducing CryptoPay Server for Shopify – open-source payment gateway that enables you
            accept crypto payments directly on your website or stores from customers with no fee.
          </AlertDescription>
        </Alert>
      )}

      {/* 设置表单卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Shopify Credentials</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect CryptoPay Server to your Shopify checkout experience to accept Crypto.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shop Name 带有前缀和后缀 */}
          <div className="space-y-2">
            <Label htmlFor="shop-name">Shop Name</Label>
            <div className="flex rounded-md shadow-sm border focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
              <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border-r select-none">
                https://
              </span>
              <Input
                id="shop-name"
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none shadow-none"
                placeholder="your-shop-name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
              <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border-l select-none">
                .myshopify.com
              </span>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API KEY</Label>
            <Input
              id="api-key"
              placeholder="Enter Shopify API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          {/* Admin API access token */}
          <div className="space-y-2">
            <Label htmlFor="admin-token">Admin API Access Token</Label>
            <Input
              id="admin-token"
              type="password"
              placeholder="Enter Admin API Access Token"
              value={adminApiAccessToken}
              onChange={(e) => setAdminApiAccessToken(e.target.value)}
            />
          </div>

          {/* 保存按钮 */}
          <div className="pt-2">
            <Button
              size="lg"
              onClick={onClickSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Shopify
