// import { AccountCircle, Settings } from '@mui/icons-material';
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Container,
//   FormControl,
//   Grid,
//   IconButton,
//   InputAdornment,
//   MenuItem,
//   OutlinedInput,
//   Paper,
//   Select,
//   Stack,
//   Switch,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { CHAINS, COINS } from '@/packages/constants/blockchain';
// import { EthereumTransactionDetail } from '@/packages/web3/types';
// import { useEffect, useState } from 'react';
// import { GetBlockchainAddressUrl, GetBlockchainTxUrl } from '@/utils/chain/tron';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import TronSVG from '@/assets/chain/tron.svg';
// import Image from 'next/image';
// import TransactionsTab from '@/components/Tab/TransactionTab';
// import { GetImgSrcByCrypto } from '@/utils/qrcode';

// type walletType = {
//   id: number;
//   address: string;
//   type: string;
//   balance: any;
//   txUrl: string;
//   transactions: EthereumTransactionDetail[];
//   resource: {
//     bandwidth: number;
//     energy: number;
//   };
// };

// const Tron = () => {
//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { getNetwork, getUserId } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state);

//   const [isSettings, setIsSettings] = useState<boolean>(false);
//   const [wallet, setWallet] = useState<walletType[]>([]);
//   // const [feeObj, setFeeObj] = useState<feeType>();

//   const [settingId, setSettingId] = useState<number>(0);
//   const [paymentExpire, setPaymentExpire] = useState<number>(0);
//   const [confirmBlock, setConfirmBlock] = useState<number>(0);
//   const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false);
//   const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0);

//   const onClickRescanAddress = async () => {
//     await getTronWalletAddress();

//     setSnackSeverity('success');
//     setSnackMessage('Successful rescan!');
//     setSnackOpen(true);
//   };

//   const getTronWalletAddress = async () => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
//         params: {
//           wallet_id: getWalletId(),
//           chain_id: CHAINS.TRON,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });

//       if (response.result) {
//         if (response.data.length > 0) {
//           let ws: walletType[] = [];
//           response.data.forEach(async (item: any) => {
//             ws.push({
//               id: item.id,
//               address: item.address,
//               type: item.note,
//               balance: item.balance,
//               txUrl: item.tx_url,
//               transactions: item.transactions,
//               resource: {
//                 bandwidth: item.resource.bandwidth,
//                 energy: item.resource.energy,
//               },
//             });
//           });
//           setWallet(ws);
//         } else {
//           setWallet([]);
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

//   const getTronPaymentSetting = async () => {
//     try {
//       const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
//         params: {
//           user_id: getUserId(),
//           chain_id: CHAINS.TRON,
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });

//       if (response.result) {
//         setSettingId(response.data.id);
//         setPaymentExpire(response.data.payment_expire);
//         setConfirmBlock(response.data.confirm_block);
//         setShowRecommendedFee(response.data.show_recommended_fee === 1 ? true : false);
//         setCurrentUsedAddressId(response.data.current_used_address_id ? response.data.current_used_address_id : 0);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('The network error occurred. Please try again later.');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   // const getTronFeeRate = async () => {
//   //   try {
//   //     const response: any = await axios.get(Http.find_fee_rate, {
//   //       params: {
//   //         chain_id: CHAINS.TRON,
//   //         network: getNetwork() === 'mainnet' ? 1 : 2,
//   //       },
//   //     });
//   //     if (response.result) {
//   //       setFeeObj({
//   //         high: response.data.fast,
//   //         average: response.data.normal,
//   //         low: response.data.slow,
//   //       });
//   //     }
//   //   } catch (e) {
//   // setSnackSeverity('error');
//   // setSnackMessage('The network error occurred. Please try again later.');
//   // setSnackOpen(true);
//   //     console.error(e);
//   //   }
//   // };

//   const updatePaymentSetting = async () => {
//     try {
//       const response: any = await axios.put(Http.update_payment_setting_by_id, {
//         id: settingId,
//         payment_expire: paymentExpire,
//         confirm_block: confirmBlock,
//         show_recommended_fee: showRecommendedFee ? 1 : 2,
//         current_used_address_id: currentUsedAddressId,
//       });
//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful update!');
//         setSnackOpen(true);

//         await init();
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const init = async () => {
//     await getTronWalletAddress();
//     await getTronPaymentSetting();
//     // await getTronFeeRate();
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       <Container>
//         <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
//           <Stack direction={'row'} alignItems={'center'}>
//             <Image src={TronSVG} alt="" width={50} height={50} />
//             <Typography variant="h6" pl={1}>
//               Tron Wallet
//             </Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} gap={2}>
//             <Box>
//               <Button
//                 variant={'contained'}
//                 onClick={() => {
//                   window.location.href = '/wallets/tron/send';
//                 }}
//               >
//                 Send
//               </Button>
//             </Box>
//             <Box>
//               <Button
//                 variant={'contained'}
//                 onClick={() => {
//                   window.location.href = `/wallets/receive?chainId=${
//                     CHAINS.TRON
//                   }&storeId=${getStoreId()}&network=${getNetwork()}`;
//                 }}
//               >
//                 Receive
//               </Button>
//             </Box>
//             <Box>
//               <Button
//                 variant={'contained'}
//                 onClick={() => {
//                   window.location.href = '/wallets/manage/privatekey';
//                 }}
//               >
//                 Private Key
//               </Button>
//             </Box>
//             <Box>
//               <Button variant={'contained'} onClick={onClickRescanAddress}>
//                 Rescan address
//               </Button>
//             </Box>
//             <IconButton
//               onClick={() => {
//                 setIsSettings(!isSettings);
//               }}
//             >
//               <Settings />
//             </IconButton>
//           </Stack>
//         </Stack>

//         {/* <Box mt={8}>
//           <Typography variant="h6">Tron Gas Tracker</Typography>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-around'} mt={2}>
//             <Box>
//               <Typography>Low</Typography>
//               <Typography mt={2} fontWeight={'bold'}>
//                 {WeiToGwei(feeObj?.low as number)} Gwei
//               </Typography>
//             </Box>
//             <Box>
//               <Typography>Average</Typography>
//               <Typography mt={2} fontWeight={'bold'}>
//                 {WeiToGwei(feeObj?.average as number)} Gwei
//               </Typography>
//             </Box>
//             <Box>
//               <Typography>High</Typography>
//               <Typography mt={2} fontWeight={'bold'}>
//                 {WeiToGwei(feeObj?.high as number)} Gwei
//               </Typography>
//             </Box>
//           </Stack>
//         </Box> */}

//         <Box mt={8}>
//           {isSettings ? (
//             <Box>
//               <Box mt={5}>
//                 <Typography variant="h6">Payment</Typography>
//                 <Box mt={3}>
//                   <Typography>The transaction address currently used</Typography>
//                   <Box mt={1}>
//                     <FormControl sx={{ minWidth: 300 }}>
//                       <Select
//                         size={'small'}
//                         inputProps={{ 'aria-label': 'Without label' }}
//                         value={currentUsedAddressId}
//                         onChange={(e: any) => {
//                           setCurrentUsedAddressId(e.target.value);
//                         }}
//                       >
//                         <MenuItem value={0}>None</MenuItem>
//                         {wallet.map((item, index) => (
//                           <MenuItem value={item.id} key={index}>
//                             {item.address}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Box>
//                 <Box mt={3}>
//                   <Typography>Payment invalid if transactions fails to confirm … after invoice expiration</Typography>
//                   <Box mt={1}>
//                     <FormControl variant="outlined">
//                       <OutlinedInput
//                         size={'small'}
//                         type="number"
//                         endAdornment={<InputAdornment position="end">minutes</InputAdornment>}
//                         aria-describedby="outlined-weight-helper-text"
//                         inputProps={{
//                           'aria-label': 'weight',
//                         }}
//                         value={paymentExpire}
//                         onChange={(e: any) => {
//                           setPaymentExpire(e.target.value);
//                         }}
//                       />
//                     </FormControl>
//                   </Box>
//                 </Box>
//                 <Box mt={3}>
//                   <Typography>Consider the invoice settled when the payment transaction …</Typography>
//                   <Box mt={1}>
//                     <FormControl sx={{ minWidth: 300 }}>
//                       <Select
//                         size={'small'}
//                         inputProps={{ 'aria-label': 'Without label' }}
//                         value={confirmBlock}
//                         onChange={(e: any) => {
//                           setConfirmBlock(e.target.value);
//                         }}
//                       >
//                         <MenuItem value={0}>Is unconfirmed</MenuItem>
//                         <MenuItem value={1}>Has at least 1 confirmation</MenuItem>
//                         <MenuItem value={2}>Has at least 2 confirmation</MenuItem>
//                         <MenuItem value={3}>Has at least 6 confirmation</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Box>
//                 <Box mt={3}>
//                   <Stack direction={'row'} alignItems={'center'}>
//                     <Switch
//                       checked={showRecommendedFee}
//                       onChange={(e: any) => {
//                         setShowRecommendedFee(e.target.checked);
//                       }}
//                     />
//                     <Box ml={2}>
//                       <Typography>Show recommended fee</Typography>
//                     </Box>
//                   </Stack>
//                 </Box>

//                 <Box mt={6}>
//                   <Button variant={'contained'} onClick={updatePaymentSetting}>
//                     Save Payment Settings
//                   </Button>
//                 </Box>
//               </Box>
//             </Box>
//           ) : (
//             <Box>
//               {wallet &&
//                 wallet.length > 0 &&
//                 wallet.map((item, index) => (
//                   <Box key={index} mb={10}>
//                     <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
//                       <Box>
//                         <Typography fontWeight={'bold'} fontSize={18}>
//                           {item.type}
//                         </Typography>
//                         <Box mt={2}>
//                           <Chip
//                             icon={<AccountCircle />}
//                             label={item.address}
//                             component="a"
//                             variant="outlined"
//                             clickable
//                             onClick={async () => {
//                               await navigator.clipboard.writeText(item.address);

//                               setSnackMessage('Successfully copy');
//                               setSnackSeverity('success');
//                               setSnackOpen(true);
//                             }}
//                           />
//                         </Box>

//                         <Grid mt={2} container gap={2}>
//                           {item.balance &&
//                             Object.entries(item.balance).map(([coin, amount], balanceIndex) => (
//                               <Grid item key={balanceIndex}>
//                                 <Chip
//                                   size={'medium'}
//                                   label={String(amount) + ' ' + coin}
//                                   icon={
//                                     <Image src={GetImgSrcByCrypto(coin as COINS)} alt="logo" width={20} height={20} />
//                                   }
//                                   variant={'outlined'}
//                                 />
//                               </Grid>
//                             ))}
//                         </Grid>
//                       </Box>
//                       <Box>
//                         <Button style={{ marginRight: 10 }} variant={'outlined'} href={item.txUrl} target={'_blank'}>
//                           Check transactions
//                         </Button>
//                         <Button
//                           variant={'outlined'}
//                           href={GetBlockchainAddressUrl(getNetwork() === 'mainnet' ? true : false, item.address)}
//                           target={'_blank'}
//                         >
//                           Check onChain
//                         </Button>
//                       </Box>
//                     </Stack>
//                     <Box mt={2}>
//                       <Stack
//                         direction={'row'}
//                         alignItems={'center'}
//                         justifyContent={'space-around'}
//                         mt={4}
//                         textAlign={'center'}
//                       >
//                         <Card>
//                           <CardContent>
//                             <Box px={10}>
//                               <Typography>Energy</Typography>
//                               <Typography mt={2} fontWeight={'bold'}>
//                                 {item.resource.energy}
//                               </Typography>
//                             </Box>
//                           </CardContent>
//                         </Card>

//                         <Card>
//                           <CardContent>
//                             <Box px={10}>
//                               <Typography>Bandwidth</Typography>
//                               <Typography mt={2} fontWeight={'bold'}>
//                                 {item.resource.bandwidth}
//                               </Typography>
//                             </Box>
//                           </CardContent>
//                         </Card>
//                       </Stack>
//                     </Box>
//                     <Box mt={5}>
//                       {item.transactions && item.transactions.length > 0 ? (
//                         <TransactionsTab rows={item.transactions} />
//                       ) : (
//                         <Typography>There are no transactions yet.</Typography>
//                       )}
//                     </Box>
//                   </Box>
//                 ))}
//             </Box>
//           )}
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Tron;

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Copy, Settings } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import { EthereumTransactionDetail } from '@/packages/web3/types'
import { GetBlockchainAddressUrl } from '@/utils/chain/tron'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import TronSVG from '@/assets/chain/tron.svg'
import TransactionsTab from '@/components/Tab/TransactionTab'
import { GetImgSrcByCrypto } from '@/utils/qrcode'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useShallow } from 'zustand/react/shallow'

type walletType = {
  id: number
  address: string
  type: string
  balance: any
  txUrl: string
  transactions: EthereumTransactionDetail[]
  resource: {
    bandwidth: number
    energy: number
  }
}

const Tron = () => {
  const [isSettings, setIsSettings] = useState<boolean>(false)
  const [wallet, setWallet] = useState<walletType[]>([])

  const [settingId, setSettingId] = useState<number>(0)
  const [paymentExpire, setPaymentExpire] = useState<number>(0)
  const [confirmBlock, setConfirmBlock] = useState<number>(0)
  const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false)
  const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0)

  const { network, userId } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
      userId: state.userId,
    }))
  )

  const { walletId } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
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

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const onClickRescanAddress = async () => {
    await getTronWalletAddress(walletId, network)
    showSnack('success', 'Successful rescan!')
  }

  const getTronWalletAddress = async (walletId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          wallet_id: walletId,
          chain_id: CHAINS.TRON,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let ws: walletType[] = []
          response.data.forEach(async (item: any) => {
            ws.push({
              id: item.id,
              address: item.address,
              type: item.note,
              balance: item.balance,
              txUrl: item.tx_url,
              transactions: item.transactions,
              resource: {
                bandwidth: item.resource.bandwidth,
                energy: item.resource.energy,
              },
            })
          })
          setWallet(ws)
        } else {
          setWallet([])
        }
      } else {
        showSnack('error', 'Can not find the data on site!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getTronPaymentSetting = async (userId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: userId,
          chain_id: CHAINS.TRON,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        setSettingId(response.data.id)
        setPaymentExpire(response.data.payment_expire)
        setConfirmBlock(response.data.confirm_block)
        setShowRecommendedFee(response.data.show_recommended_fee === 1 ? true : false)
        setCurrentUsedAddressId(
          response.data.current_used_address_id ? response.data.current_used_address_id : 0
        )
      } else {
        showSnack('error', 'The network error occurred. Please try again later.')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const updatePaymentSetting = async () => {
    try {
      const response: any = await axios.put(Http.update_payment_setting_by_id, {
        id: settingId,
        payment_expire: paymentExpire,
        confirm_block: confirmBlock,
        show_recommended_fee: showRecommendedFee ? 1 : 2,
        current_used_address_id: currentUsedAddressId,
      })
      if (response.result) {
        showSnack('success', 'Successful update!')
        await init(walletId, storeId, network)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const init = async (walletId: number, storeId: number, network: string) => {
    await Promise.all([
      await getTronWalletAddress(walletId, network),
      await getTronPaymentSetting(userId, storeId, network),
    ])
  }

  useEffect(() => {
    getTronWalletAddress(walletId, network)
  }, [walletId, network])

  useEffect(() => {
    getTronPaymentSetting(userId, storeId, network)
  }, [userId, storeId, network])

  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pt-10">
          <div className="flex items-center gap-2">
            <Image src={TronSVG} alt="" width={50} height={50} />
            <h2 className="text-lg font-semibold">Tron Wallet</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                window.location.href = '/wallets/tron/send'
              }}
            >
              Send
            </Button>
            <Button
              onClick={() => {
                window.location.href = `/wallets/receive?chainId=${
                  CHAINS.TRON
                }&storeId=${storeId}&network=${network}`
              }}
            >
              Receive
            </Button>
            <Button
              onClick={() => {
                window.location.href = '/wallets/manage/privatekey'
              }}
            >
              Private Key
            </Button>
            <Button onClick={onClickRescanAddress}>Rescan address</Button>
            <Button variant="ghost" size="icon" onClick={() => setIsSettings(!isSettings)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-10">
          {isSettings ? (
            <div className="max-w-md">
              <h3 className="text-lg font-semibold">Payment</h3>

              <div className="mt-4 space-y-2">
                <Label>The transaction address currently used</Label>
                <Select
                  value={String(currentUsedAddressId)}
                  onValueChange={(v) => setCurrentUsedAddressId(Number(v))}
                >
                  <SelectTrigger className="w-[320px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {wallet.map((item, index) => (
                      <SelectItem value={String(item.id)} key={index}>
                        {item.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 space-y-2">
                <Label>
                  Payment invalid if transactions fails to confirm … after invoice expiration
                </Label>
                <div className="relative w-[220px]">
                  <Input
                    type="number"
                    value={paymentExpire}
                    onChange={(e) => setPaymentExpire(Number(e.target.value))}
                    className="pr-20"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                    minutes
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>Consider the invoice settled when the payment transaction …</Label>
                <Select
                  value={String(confirmBlock)}
                  onValueChange={(v) => setConfirmBlock(Number(v))}
                >
                  <SelectTrigger className="w-[320px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Is unconfirmed</SelectItem>
                    <SelectItem value="1">Has at least 1 confirmation</SelectItem>
                    <SelectItem value="2">Has at least 2 confirmation</SelectItem>
                    <SelectItem value="3">Has at least 6 confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Switch checked={showRecommendedFee} onCheckedChange={setShowRecommendedFee} />
                <Label className="cursor-pointer" onClick={() => setShowRecommendedFee((v) => !v)}>
                  Show recommended fee
                </Label>
              </div>

              <Button className="mt-6" onClick={updatePaymentSetting}>
                Save Payment Settings
              </Button>
            </div>
          ) : (
            <div className="space-y-16">
              {wallet &&
                wallet.length > 0 &&
                wallet.map((item, index) => (
                  <div key={index}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{item.type}</p>

                        <button
                          type="button"
                          onClick={async () => {
                            await navigator.clipboard.writeText(item.address)
                            showSnack('success', 'Successfully copy')
                          }}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {item.address}
                        </button>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.balance &&
                            Object.entries(item.balance).map(([coin, amount], balanceIndex) => (
                              <Badge
                                key={balanceIndex}
                                variant="outline"
                                className="gap-1.5 px-3 py-1 font-normal"
                              >
                                <Image
                                  src={GetImgSrcByCrypto(coin as COINS)}
                                  alt="logo"
                                  width={16}
                                  height={16}
                                />
                                {String(amount)} {coin}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <a href={item.txUrl} target="_blank" rel="noreferrer">
                            Check transactions
                          </a>
                        </Button>
                        <Button variant="outline" asChild>
                          <a
                            href={GetBlockchainAddressUrl(network === 'mainnet', item.address)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Check onChain
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-around">
                      <Card className="flex-1 min-w-[160px]">
                        <CardContent className="py-6 text-center">
                          <p className="text-muted-foreground">Energy</p>
                          <p className="mt-2 font-semibold">{item.resource.energy}</p>
                        </CardContent>
                      </Card>

                      <Card className="flex-1 min-w-[160px]">
                        <CardContent className="py-6 text-center">
                          <p className="text-muted-foreground">Bandwidth</p>
                          <p className="mt-2 font-semibold">{item.resource.bandwidth}</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="mt-6">
                      {item.transactions && item.transactions.length > 0 ? (
                        <TransactionsTab rows={item.transactions} />
                      ) : (
                        <p className="text-muted-foreground">There are no transactions yet.</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tron
