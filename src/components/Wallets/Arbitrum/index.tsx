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
//   Select,
//   Stack,
//   Switch,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { CHAINS, COINS } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import { EthereumTransactionDetail } from '@/packages/web3/types';
// import { GetBlockchainAddressUrl, GetBlockchainTxUrl } from '@/utils/chain/arb';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import ArbitrumSVG from '@/assets/chain/arbitrum.svg';
// import Image from 'next/image';
// import { WeiToGwei } from '@/utils/number';
// import TransactionsTab from '@/components/Tab/TransactionTab';
// import { GetImgSrcByCrypto } from '@/utils/qrcode';

// type walletType = {
//   id: number;
//   address: string;
//   type: string;
//   balance: any;
//   txUrl: string;
//   transactions: EthereumTransactionDetail[];
// };

// type feeType = {
//   high: number;
//   average: number;
//   low: number;
// };

// const Arbitrum = () => {
//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { getNetwork, getUserId } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state);

//   const [isSettings, setIsSettings] = useState<boolean>(false);
//   const [wallet, setWallet] = useState<walletType[]>([]);
//   const [feeObj, setFeeObj] = useState<feeType>();

//   const [settingId, setSettingId] = useState<number>(0);
//   const [paymentExpire, setPaymentExpire] = useState<number>(0);
//   const [confirmBlock, setConfirmBlock] = useState<number>(0);
//   const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false);
//   const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0);

//   const onClickRescanAddress = async () => {
//     await getArbWalletAddress();

//     setSnackSeverity('success');
//     setSnackMessage('Successful rescan!');
//     setSnackOpen(true);
//   };

//   const getArbWalletAddress = async () => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
//         params: {
//           wallet_id: getWalletId(),
//           chain_id: CHAINS.ARBITRUM,
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

//   const getArbPaymentSetting = async () => {
//     try {
//       const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
//         params: {
//           user_id: getUserId(),
//           chain_id: CHAINS.ARBITRUM,
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

//   const getArbFeeRate = async () => {
//     try {
//       const response: any = await axios.get(Http.find_fee_rate, {
//         params: {
//           chain_id: CHAINS.ARBITRUM,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result) {
//         setFeeObj({
//           high: response.data.fast,
//           average: response.data.normal,
//           low: response.data.slow,
//         });
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

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
//     await getArbWalletAddress();
//     await getArbPaymentSetting();
//     await getArbFeeRate();
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
//             <Image src={ArbitrumSVG} alt="" width={50} height={50} />
//             <Typography variant="h6" pl={1}>
//               Arbitrum Wallet
//             </Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} gap={2}>
//             <Box>
//               <Button
//                 variant={'contained'}
//                 onClick={() => {
//                   window.location.href = `/wallets/send?chainId=${CHAINS.ARBITRUM}`;
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
//                     CHAINS.ARBITRUM
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

//         <Box mt={8}>
//           <Typography variant="h6">Arbitrum Gas Tracker</Typography>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-around'} mt={4} textAlign={'center'}>
//             <Card>
//               <CardContent>
//                 <Box px={10}>
//                   <Typography>Low</Typography>
//                   <Typography mt={2} fontWeight={'bold'}>
//                     {WeiToGwei(Number(feeObj?.low)).toFixed(3)} gwei
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent>
//                 <Box px={10}>
//                   <Typography>Average</Typography>
//                   <Typography mt={2} fontWeight={'bold'}>
//                     {WeiToGwei(Number(feeObj?.average)).toFixed(3)} gwei
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardContent>
//                 <Box px={10}>
//                   <Typography>High</Typography>
//                   <Typography mt={2} fontWeight={'bold'}>
//                     {WeiToGwei(Number(feeObj?.high)).toFixed(3)} gwei
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Stack>
//         </Box>

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
//                           Arbitrum
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

// export default Arbitrum;

// import { useEffect, useState } from 'react'
// import Image from 'next/image'
// import { UserCircle, Settings } from 'lucide-react'
// import {
//   useSnackPresistStore,
//   useStorePresistStore,
//   useUserPresistStore,
//   useWalletPresistStore,
// } from '@/lib/store'
// import { CHAINS, COINS } from '@/packages/constants/blockchain'
// import { EthereumTransactionDetail } from '@/packages/web3/types'
// import { GetBlockchainAddressUrl, GetBlockchainTxUrl } from '@/utils/chain/arb'
// import axios from '@/utils/http/axios'
// import { Http } from '@/utils/http/http'
// import ArbitrumSVG from '@/assets/chain/arbitrum.svg'
// import { WeiToGwei } from '@/utils/number'
// import TransactionsTab from '@/components/Tab/TransactionTab'
// import { GetImgSrcByCrypto } from '@/utils/qrcode'

// type walletType = {
//   id: number
//   address: string
//   type: string
//   balance: any
//   txUrl: string
//   transactions: EthereumTransactionDetail[]
// }

// type feeType = {
//   high: number
//   average: number
//   low: number
// }

// const Arbitrum = () => {
//   const { getWalletId } = useWalletPresistStore((state) => state)
//   const { getNetwork, getUserId } = useUserPresistStore((state) => state)
//   const { getStoreId } = useStorePresistStore((state) => state)
//   const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state)

//   const [isSettings, setIsSettings] = useState<boolean>(false)
//   const [wallet, setWallet] = useState<walletType[]>([])
//   const [feeObj, setFeeObj] = useState<feeType>()

//   const [settingId, setSettingId] = useState<number>(0)
//   const [paymentExpire, setPaymentExpire] = useState<number>(0)
//   const [confirmBlock, setConfirmBlock] = useState<number>(0)
//   const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false)
//   const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0)

//   const onClickRescanAddress = async () => {
//     await getArbWalletAddress()

//     setSnackSeverity('success')
//     setSnackMessage('Successful rescan!')
//     setSnackOpen(true)
//   }

//   const getArbWalletAddress = async () => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
//         params: {
//           wallet_id: getWalletId(),
//           chain_id: CHAINS.ARBITRUM,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       })

//       if (response.result) {
//         if (response.data.length > 0) {
//           let ws: walletType[] = []
//           response.data.forEach(async (item: any) => {
//             ws.push({
//               id: item.id,
//               address: item.address,
//               type: item.note,
//               balance: item.balance,
//               txUrl: item.tx_url,
//               transactions: item.transactions,
//             })
//           })
//           setWallet(ws)
//         } else {
//           setWallet([])
//         }
//       } else {
//         setSnackSeverity('error')
//         setSnackMessage('Can not find the data on site!')
//         setSnackOpen(true)
//       }
//     } catch (e) {
//       setSnackSeverity('error')
//       setSnackMessage('The network error occurred. Please try again later.')
//       setSnackOpen(true)
//       console.error(e)
//     }
//   }

//   const getArbPaymentSetting = async () => {
//     try {
//       const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
//         params: {
//           user_id: getUserId(),
//           chain_id: CHAINS.ARBITRUM,
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       })

//       if (response.result) {
//         setSettingId(response.data.id)
//         setPaymentExpire(response.data.payment_expire)
//         setConfirmBlock(response.data.confirm_block)
//         setShowRecommendedFee(response.data.show_recommended_fee === 1 ? true : false)
//         setCurrentUsedAddressId(
//           response.data.current_used_address_id ? response.data.current_used_address_id : 0
//         )
//       } else {
//         setSnackSeverity('error')
//         setSnackMessage('The network error occurred. Please try again later.')
//         setSnackOpen(true)
//       }
//     } catch (e) {
//       setSnackSeverity('error')
//       setSnackMessage('The network error occurred. Please try again later.')
//       setSnackOpen(true)
//       console.error(e)
//     }
//   }

//   const getArbFeeRate = async () => {
//     try {
//       const response: any = await axios.get(Http.find_fee_rate, {
//         params: {
//           chain_id: CHAINS.ARBITRUM,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       })
//       if (response.result) {
//         setFeeObj({
//           high: response.data.fast,
//           average: response.data.normal,
//           low: response.data.slow,
//         })
//       }
//     } catch (e) {
//       setSnackSeverity('error')
//       setSnackMessage('The network error occurred. Please try again later.')
//       setSnackOpen(true)
//       console.error(e)
//     }
//   }

//   const updatePaymentSetting = async () => {
//     try {
//       const response: any = await axios.put(Http.update_payment_setting_by_id, {
//         id: settingId,
//         payment_expire: paymentExpire,
//         confirm_block: confirmBlock,
//         show_recommended_fee: showRecommendedFee ? 1 : 2,
//         current_used_address_id: currentUsedAddressId,
//       })
//       if (response.result) {
//         setSnackSeverity('success')
//         setSnackMessage('Successful update!')
//         setSnackOpen(true)

//         await init()
//       }
//     } catch (e) {
//       setSnackSeverity('error')
//       setSnackMessage('The network error occurred. Please try again later.')
//       setSnackOpen(true)
//       console.error(e)
//     }
//   }

//   const init = async () => {
//     await getArbWalletAddress()
//     await getArbPaymentSetting()
//     await getArbFeeRate()
//   }

//   useEffect(() => {
//     init()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   return (
//     <div>
//       <div className="container mx-auto px-4">
//         {/* Header Section */}
//         <div className="flex items-center justify-between pt-10">
//           <div className="flex items-center">
//             <Image src={ArbitrumSVG} alt="" width={50} height={50} />
//             <h1 className="text-xl font-bold pl-2">Arbitrum Wallet</h1>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors"
//               onClick={() => {
//                 window.location.href = `/wallets/send?chainId=${CHAINS.ARBITRUM}`
//               }}
//             >
//               Send
//             </button>
//             <button
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors"
//               onClick={() => {
//                 window.location.href = `/wallets/receive?chainId=${
//                   CHAINS.ARBITRUM
//                 }&storeId=${getStoreId()}&network=${getNetwork()}`
//               }}
//             >
//               Receive
//             </button>
//             <button
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors"
//               onClick={() => {
//                 window.location.href = '/wallets/manage/privatekey'
//               }}
//             >
//               Private Key
//             </button>
//             <button
//               className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors"
//               onClick={onClickRescanAddress}
//             >
//               Rescan address
//             </button>
//             <button
//               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
//               onClick={() => {
//                 setIsSettings(!isSettings)
//               }}
//             >
//               <Settings className="w-5 h-5" />
//             </button>
//           </div>
//         </div>

//         {/* Gas Tracker */}
//         <div className="mt-8">
//           <h2 className="text-xl font-bold">Arbitrum Gas Tracker</h2>
//           <div className="flex items-center justify-around mt-4 text-center gap-4">
//             <div className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-gray-900 p-6 flex-1 max-w-sm">
//               <div className="px-10">
//                 <p className="text-gray-600 dark:text-gray-400">Low</p>
//                 <p className="mt-2 font-bold text-lg">
//                   {WeiToGwei(Number(feeObj?.low)).toFixed(3)} gwei
//                 </p>
//               </div>
//             </div>

//             <div className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-gray-900 p-6 flex-1 max-w-sm">
//               <div className="px-10">
//                 <p className="text-gray-600 dark:text-gray-400">Average</p>
//                 <p className="mt-2 font-bold text-lg">
//                   {WeiToGwei(Number(feeObj?.average)).toFixed(3)} gwei
//                 </p>
//               </div>
//             </div>

//             <div className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm bg-white dark:bg-gray-900 p-6 flex-1 max-w-sm">
//               <div className="px-10">
//                 <p className="text-gray-600 dark:text-gray-400">High</p>
//                 <p className="mt-2 font-bold text-lg">
//                   {WeiToGwei(Number(feeObj?.high)).toFixed(3)} gwei
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Dynamic Content: Settings or Wallet List */}
//         <div className="mt-8">
//           {isSettings ? (
//             <div>
//               <div className="mt-5">
//                 <h2 className="text-xl font-bold">Payment</h2>
//                 <div className="mt-3">
//                   <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                     The transaction address currently used
//                   </p>
//                   <div className="mt-1">
//                     <select
//                       className="min-w-[300px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={currentUsedAddressId}
//                       onChange={(e) => {
//                         setCurrentUsedAddressId(Number(e.target.value))
//                       }}
//                     >
//                       <option value={0}>None</option>
//                       {wallet.map((item, index) => (
//                         <option value={item.id} key={index}>
//                           {item.address}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="mt-3">
//                   <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Payment invalid if transactions fails to confirm … after invoice expiration
//                   </p>
//                   <div className="mt-1">
//                     <div className="relative inline-flex items-center min-w-[300px]">
//                       <input
//                         type="number"
//                         className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         aria-label="weight"
//                         value={paymentExpire}
//                         onChange={(e) => {
//                           setPaymentExpire(Number(e.target.value))
//                         }}
//                       />
//                       <span className="absolute right-3 text-sm text-gray-500">minutes</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-3">
//                   <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Consider the invoice settled when the payment transaction …
//                   </p>
//                   <div className="mt-1">
//                     <select
//                       className="min-w-[300px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       value={confirmBlock}
//                       onChange={(e) => {
//                         setConfirmBlock(Number(e.target.value))
//                       }}
//                     >
//                       <option value={0}>Is unconfirmed</option>
//                       <option value={1}>Has at least 1 confirmation</option>
//                       <option value={2}>Has at least 2 confirmation</option>
//                       <option value={3}>Has at least 6 confirmation</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="mt-3">
//                   <div className="flex items-center">
//                     <button
//                       type="button"
//                       role="switch"
//                       aria-checked={showRecommendedFee}
//                       className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//                         showRecommendedFee ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
//                       }`}
//                       onClick={() => setShowRecommendedFee(!showRecommendedFee)}
//                     >
//                       <span
//                         className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
//                           showRecommendedFee ? 'translate-x-5' : 'translate-x-0'
//                         }`}
//                       />
//                     </button>
//                     <div className="ml-2">
//                       <p className="text-sm font-medium">Show recommended fee</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6">
//                   <button
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors"
//                     onClick={updatePaymentSetting}
//                   >
//                     Save Payment Settings
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div>
//               {wallet &&
//                 wallet.length > 0 &&
//                 wallet.map((item, index) => (
//                   <div key={index} className="mb-10">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <p className="font-bold text-lg">Arbitrum</p>
//                         <div className="mt-2">
//                           <button
//                             className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
//                             onClick={async () => {
//                               await navigator.clipboard.writeText(item.address)

//                               setSnackMessage('Successfully copy')
//                               setSnackSeverity('success')
//                               setSnackOpen(true)
//                             }}
//                           >
//                             <UserCircle className="w-4 h-4 text-gray-500" />
//                             <span>{item.address}</span>
//                           </button>
//                         </div>

//                         <div className="mt-2 flex flex-wrap gap-2">
//                           {item.balance &&
//                             Object.entries(item.balance).map(([coin, amount], balanceIndex) => (
//                               <div key={balanceIndex}>
//                                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-sm">
//                                   <Image
//                                     src={GetImgSrcByCrypto(coin as COINS)}
//                                     alt="logo"
//                                     width={20}
//                                     height={20}
//                                   />
//                                   <span>
//                                     {String(amount)} {coin}
//                                   </span>
//                                 </div>
//                               </div>
//                             ))}
//                         </div>
//                       </div>

//                       <div className="flex gap-2.5">
//                         <a
//                           href={item.txUrl}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md font-medium text-sm transition-colors inline-block"
//                         >
//                           Check transactions
//                         </a>
//                         <a
//                           href={GetBlockchainAddressUrl(
//                             getNetwork() === 'mainnet' ? true : false,
//                             item.address
//                           )}
//                           target="_blank"
//                           rel="noreferrer"
//                           className="px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md font-medium text-sm transition-colors inline-block"
//                         >
//                           Check onChain
//                         </a>
//                       </div>
//                     </div>

//                     <div className="mt-5">
//                       {item.transactions && item.transactions.length > 0 ? (
//                         <TransactionsTab rows={item.transactions} />
//                       ) : (
//                         <p className="text-gray-500">There are no transactions yet.</p>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Arbitrum

import ArbitrumSVG from '@/assets/chain/arbitrum.svg'
import { CHAINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/arb'
import EvmChainWalletPage from '../EvmChainWalletPage'

const Arbitrum = () => (
  <EvmChainWalletPage
    chainId={CHAINS.ARBITRUM}
    displayName="Arbitrum Wallet"
    gasTrackerTitle="Arbitrum Gas Tracker"
    chainSvg={ArbitrumSVG}
    sendHref={`/wallets/send?chainId=${CHAINS.ARBITRUM}`}
    getBlockchainAddressUrl={GetBlockchainAddressUrl}
  />
)

export default Arbitrum
