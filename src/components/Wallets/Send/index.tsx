// import {
//   Box,
//   Button,
//   Chip,
//   Container,
//   FormControl,
//   Grid,
//   Icon,
//   InputAdornment,
//   OutlinedInput,
//   Stack,
//   ToggleButton,
//   ToggleButtonGroup,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { CHAINS, COIN, COINS } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { BigDiv, BigMul, GweiToEther, WeiToGwei } from '@/utils/number';
// import Image from 'next/image';
// import { OmitMiddleString } from '@/utils/strings';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
// import Link from 'next/link';
// import { COINGECKO_IDS, PAYOUT_STATUS } from '@/packages/constants';
// import { useRouter } from 'next/router';
// import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode';
// import { FindChainNamesByChains, FindChainPathNamesByChains, GetBlockchainTxUrlByChainIds } from '@/utils/web3';

// type feeType = {
//   high: number;
//   average: number;
//   low: number;
// };

// type maxPriortyFeeType = {
//   fast: number;
//   normal: number;
//   slow: number;
// };

// type Coin = {
//   [currency: string]: string;
// };

// type AddressBookRowType = {
//   id: number;
//   chainId: number;
//   isMainnet: boolean;
//   name: string;
//   address: string;
// };

// const WalletsSend = () => {
//   const router = useRouter();
//   const { chainId, payoutId } = router.query;

//   const [mainCoin, setMainCoin] = useState<COINS>();

//   const [alignment, setAlignment] = useState<'high' | 'average' | 'low'>('average');
//   const [maxPriortyFeeAlignment, setMaxPriortyFeeAlignment] = useState<'fast' | 'normal' | 'slow'>('normal');
//   const [feeObj, setFeeObj] = useState<feeType>();
//   const [maxPriortyFeeObj, setMaxPriortyFeeObj] = useState<maxPriortyFeeType>();
//   const [addressBookrows, setAddressBookrows] = useState<AddressBookRowType[]>([]);

//   const [page, setPage] = useState<number>(1);
//   const [fromAddress, setFromAddress] = useState<string>('');
//   const [balance, setBalance] = useState<Coin>({});
//   const [destinationAddress, setDestinationAddress] = useState<string>('');
//   const [amount, setAmount] = useState<string>('');
//   const [maxFee, setMaxFee] = useState<number>(0);
//   const [maxPriortyFee, setMaxPriortyFee] = useState<number>(0);
//   const [gasLimit, setGasLimit] = useState<number>(0);

//   const [networkFee, setNetworkFee] = useState<string>('');
//   const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');
//   const [nonce, setNonce] = useState<number>(0);
//   const [coin, setCoin] = useState<COINS>();
//   const [displaySign, setDisplaySign] = useState<boolean>(false);
//   const [amountRed, setAmountRed] = useState<boolean>(false);

//   const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false);
//   const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false);

//   const { getNetwork, getUserId } = useUserPresistStore((state) => state);
//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const handleChangeFees = (e: any) => {
//     switch (e.target.value) {
//       case 'high':
//         setMaxFee(WeiToGwei(Number(feeObj?.high)));
//         break;
//       case 'average':
//         setMaxFee(WeiToGwei(Number(feeObj?.average)));
//         break;
//       case 'low':
//         setMaxFee(WeiToGwei(Number(feeObj?.low)));
//         break;
//     }
//     setAlignment(e.target.value);
//   };

//   const handleChangeMaxPriortyFee = (e: any) => {
//     switch (e.target.value) {
//       case 'fast':
//         setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.fast)));
//         break;
//       case 'normal':
//         setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.normal)));
//         break;
//       case 'slow':
//         setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.slow)));
//         break;
//     }
//     setMaxPriortyFeeAlignment(e.target.value);
//   };

//   const getBalance = async (chainId: number) => {
//     try {
//       const response: any = await axios.get(Http.find_asset_balance, {
//         params: {
//           chain_id: chainId,
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result) {
//         setFromAddress(response.data.address);
//         setBalance(response.data.balance);
//         setMainCoin(response.data.main_coin.name);

//         await getNonce(chainId, response.data.address);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const getGasLimit = async (from: string): Promise<boolean> => {
//     try {
//       const response: any = await axios.get(Http.find_gas_limit, {
//         params: {
//           chain_id: chainId,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           coin: coin,
//           from: from,
//           to: destinationAddress,
//           value: amount,
//         },
//       });
//       if (response.result) {
//         setGasLimit(response.data);
//         return true;
//       }
//       return false;
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//       return false;
//     }
//   };

//   const getFeeRate = async (chainId: number) => {
//     try {
//       const response: any = await axios.get(Http.find_fee_rate, {
//         params: {
//           chain_id: chainId,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result) {
//         setFeeObj({
//           high: response.data.fast,
//           average: response.data.normal,
//           low: response.data.slow,
//         });
//         setMaxFee(WeiToGwei(response.data.normal));
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const getMaxPriortyFee = async (chainId: number) => {
//     try {
//       const response: any = await axios.get(Http.find_max_priorty_fee, {
//         params: {
//           chain_id: chainId,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result) {
//         setMaxPriortyFeeObj({
//           fast: response.data.fast,
//           normal: response.data.normal,
//           slow: response.data.slow,
//         });
//         setMaxPriortyFee(WeiToGwei(response.data.normal));
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const getAddressBook = async (chainId: number) => {
//     try {
//       const response: any = await axios.get(Http.find_address_book, {
//         params: {
//           chain_id: chainId,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result && response.data.length > 0) {
//         let rt: AddressBookRowType[] = [];
//         response.data.forEach((item: any) => {
//           rt.push({
//             id: item.id,
//             chainId: item.chain_id,
//             isMainnet: item.network === 1 ? true : false,
//             name: item.name,
//             address: item.address,
//           });
//         });

//         setAddressBookrows(rt);
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const getNonce = async (chainId: number, address: string) => {
//     if (address && address != '') {
//       try {
//         const response: any = await axios.get(Http.find_nonce, {
//           params: {
//             chain_id: chainId,
//             network: getNetwork() === 'mainnet' ? 1 : 2,
//             address: address,
//           },
//         });
//         if (response.result) {
//           setNonce(response.data);
//         }
//       } catch (e) {
//         setSnackSeverity('error');
//         setSnackMessage('The network error occurred. Please try again later.');
//         setSnackOpen(true);
//         console.error(e);
//       }
//     }
//   };

//   const getPayoutInfo = async (id: number) => {
//     try {
//       const response: any = await axios.get(Http.find_payout_by_id, {
//         params: {
//           id: id,
//         },
//       });

//       if (response.result) {
//         setDestinationAddress(response.data.address);

//         const ids = COINGECKO_IDS[response.data.crypto as COINS];
//         const rate_response: any = await axios.get(Http.find_crypto_price, {
//           params: {
//             ids: ids,
//             currency: response.data.currency,
//           },
//         });
//         if (rate_response.result) {
//           const rate = rate_response.data[ids][response.data.currency.toLowerCase()];
//           const totalPrice = parseFloat(BigDiv(Number(response.data.amount).toString(), rate)).toFixed(8);
//           setAmount(totalPrice);
//           setCoin(response.data.crypto);

//           setIsDisableDestinationAddress(true);
//           setIsDisableAmount(true);
//         }
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const checkAddress = async (): Promise<boolean> => {
//     if (destinationAddress === fromAddress) {
//       return false;
//     }

//     if (!destinationAddress || destinationAddress === '') {
//       return false;
//     }

//     try {
//       const response: any = await axios.get(Http.checkout_chain_address, {
//         params: {
//           chain_id: chainId,
//           address: destinationAddress,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       return response.result;
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//       return false;
//     }
//   };

//   const checkAmount = (): boolean => {
//     if (amount && parseFloat(amount) > 0 && parseFloat(balance[String(coin)]) >= parseFloat(amount)) {
//       return true;
//     }

//     return false;
//   };

//   const checkNonce = (): boolean => {
//     if (nonce >= 0) {
//       return true;
//     }

//     return false;
//   };

//   const checkMaxFee = (): boolean => {
//     if (maxFee && maxFee >= 0) {
//       return true;
//     }

//     return false;
//   };

//   const checkMaxPriortyFee = (): boolean => {
//     if (maxPriortyFee && maxPriortyFee >= 0) {
//       return true;
//     }

//     return false;
//   };

//   const checkGasLimit = async (): Promise<boolean> => {
//     if (gasLimit && gasLimit > 0) {
//       return true;
//     }

//     return await getGasLimit(fromAddress);
//   };

//   const onClickSignTransaction = async () => {
//     if (!(await checkAddress())) {
//       setSnackSeverity('error');
//       setSnackMessage('The destination address cannot be empty or input errors');
//       setSnackOpen(true);
//       return;
//     }

//     if (!checkAmount()) {
//       setSnackSeverity('error');
//       setSnackMessage('Insufficient balance or input error');
//       setSnackOpen(true);
//       return;
//     }

//     if (!checkNonce()) {
//       setSnackSeverity('error');
//       setSnackMessage('Incorrect nonce amount');
//       setSnackOpen(true);
//       return;
//     }

//     if (!checkMaxFee()) {
//       setSnackSeverity('error');
//       setSnackMessage('Incorrect max fee');
//       setSnackOpen(true);
//       return;
//     }

//     if (Number(chainId) !== CHAINS.BSC) {
//       if (!checkMaxPriortyFee()) {
//         setSnackSeverity('error');
//         setSnackMessage('Incorrect max priorty fee');
//         setSnackOpen(true);
//         return;
//       }
//     }

//     if (!(await checkGasLimit())) {
//       setSnackSeverity('error');
//       setSnackMessage('Incorrect gas limit');
//       setSnackOpen(true);
//       return;
//     } else {
//       setDisplaySign(true);
//     }

//     if (displaySign) {
//       if (coin === mainCoin) {
//         if (
//           !networkFee ||
//           !amount ||
//           parseFloat(networkFee) * 2 + parseFloat(amount) > parseFloat(balance[String(mainCoin)])
//         ) {
//           setSnackSeverity('error');
//           setSnackMessage('Insufficient balance or Insufficient gas fee');
//           setSnackOpen(true);
//           return;
//         }
//       } else {
//         if (!networkFee || !amount || parseFloat(networkFee) * 2 > parseFloat(balance[String(mainCoin)])) {
//           setSnackSeverity('error');
//           setSnackMessage('Insufficient balance or Insufficient gas fee');
//           setSnackOpen(true);
//           return;
//         }
//       }

//       if (networkFee && networkFee != '') {
//         setPage(2);
//       }
//     }
//   };

//   const onClickSignAndPay = async () => {
//     try {
//       const response: any = await axios.post(Http.send_transaction, {
//         chain_id: chainId,
//         from_address: fromAddress,
//         to_address: destinationAddress,
//         network: getNetwork() === 'mainnet' ? 1 : 2,
//         wallet_id: getWalletId(),
//         user_id: getUserId(),
//         value: amount,
//         coin: coin,
//         nonce: nonce,
//         max_fee: maxFee,
//         max_priorty_fee: maxPriortyFee,
//         gas_limit: gasLimit,
//       });

//       if (response.result) {
//         if (payoutId) {
//           const update_payout_resp: any = await axios.put(Http.update_payout_by_id, {
//             id: payoutId,
//             tx: response.data.hash,
//             crypto_amount: amount,
//             payout_status: PAYOUT_STATUS.Completed,
//           });

//           if (!update_payout_resp.result) {
//             setSnackSeverity('error');
//             setSnackMessage('Can not update the status of payout!');
//             setSnackOpen(true);
//             return;
//           }
//         }

//         setSnackSeverity('success');
//         setSnackMessage('Successful creation!');
//         setSnackOpen(true);

//         setBlockExplorerLink(
//           GetBlockchainTxUrlByChainIds(getNetwork() === 'mainnet', Number(chainId), response.data.hash),
//         );
//         setPage(3);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickParseClipboardText = async (text: string) => {
//     try {
//       if (!text || text === '') {
//         setSnackSeverity('error');
//         setSnackMessage('Invalid parsing');
//         setSnackOpen(true);
//         return;
//       }

//       text = text.trim();

//       const response: any = await axios.get(Http.parse_qrcode_text, {
//         params: {
//           chain_id: chainId,
//           text: text,
//         },
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Parsing success');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Invalid parsing');
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
//     if (maxFee && maxFee > 0 && gasLimit && gasLimit > 0) {
//       setNetworkFee(parseFloat(BigMul(GweiToEther(maxFee).toString(), gasLimit.toString())).toFixed(8));
//     }
//   }, [maxFee, gasLimit]);

//   const init = async (chainId: number, payoutId: number) => {
//     await getBalance(chainId);
//     await getFeeRate(chainId);
//     if (chainId !== CHAINS.BSC) {
//       await getMaxPriortyFee(chainId);
//     }
//     await getAddressBook(chainId);

//     if (payoutId) {
//       await getPayoutInfo(payoutId);
//     }
//   };

//   useEffect(() => {
//     if (!chainId) {
//       return;
//     }
//     init(Number(chainId), Number(payoutId));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chainId, payoutId]);

//   return (
//     <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={10}>
//       <Stack direction={'row'} alignItems={'center'} justifyContent={'center'}>
//         {GetImgSrcByChain(Number(chainId)) && (
//           <Image src={GetImgSrcByChain(Number(chainId))} alt="chain" width={50} height={50} />
//         )}
//         <Typography variant="h4" my={4} ml={2}>
//           Send coin on{' '}
//           {getNetwork() === 'mainnet'
//             ? FindChainNamesByChains(Number(chainId)) + ' mainnet'
//             : FindChainNamesByChains(Number(chainId)) + ' testnet'}
//         </Typography>
//       </Stack>
//       <Container>
//         {page === 1 && (
//           <>
//             <Box mt={4}>
//               <Stack mt={2} direction={'row'} alignItems={'center'}>
//                 <Button
//                   variant={'contained'}
//                   onClick={async () => {
//                     const text = await navigator.clipboard.readText();

//                     await onClickParseClipboardText(text);
//                   }}
//                 >
//                   parse clipboard text
//                 </Button>
//               </Stack>

//               <Stack mt={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
//                 <Typography>From address</Typography>
//               </Stack>
//               <Box mt={1}>
//                 <FormControl fullWidth variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={fromAddress}
//                     disabled
//                   />
//                 </FormControl>
//               </Box>
//             </Box>

//             <Box mt={4}>
//               <Stack mt={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
//                 <Typography>Destination address</Typography>
//               </Stack>
//               <Box mt={1}>
//                 <FormControl fullWidth variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={destinationAddress}
//                     onChange={(e: any) => {
//                       setDestinationAddress(e.target.value);
//                     }}
//                     disabled={isDisableDestinationAddress}
//                   />
//                 </FormControl>
//               </Box>
//             </Box>

//             {addressBookrows && addressBookrows.length > 0 && (
//               <Box mt={4}>
//                 <Typography mb={2}>Address books</Typography>
//                 <Grid container spacing={2}>
//                   {addressBookrows.map((item, index) => (
//                     <Grid item key={index}>
//                       <Chip
//                         label={OmitMiddleString(item.address)}
//                         variant="outlined"
//                         onClick={() => {
//                           setDestinationAddress(item.address);
//                         }}
//                       />
//                     </Grid>
//                   ))}
//                 </Grid>
//               </Box>
//             )}

//             <Box mt={4}>
//               <Typography>Coin</Typography>
//               <Grid mt={2} container gap={2}>
//                 {balance &&
//                   Object.entries(balance).map(([token, amount], balanceIndex) => (
//                     <Grid item key={balanceIndex}>
//                       <Chip
//                         size={'medium'}
//                         label={String(amount) + ' ' + token}
//                         icon={<Image src={GetImgSrcByCrypto(token as COINS)} alt="logo" width={20} height={20} />}
//                         variant={token === coin ? 'filled' : 'outlined'}
//                         onClick={() => {
//                           setCoin(token as COINS);
//                         }}
//                       />
//                     </Grid>
//                   ))}
//               </Grid>
//             </Box>

//             <Box mt={4}>
//               <Typography>Amount</Typography>
//               <Box mt={1}>
//                 <FormControl fullWidth variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     type="number"
//                     value={amount}
//                     onChange={(e: any) => {
//                       setAmount(e.target.value);
//                       if (parseFloat(e.target.value) > parseFloat(balance[String(coin)])) {
//                         setAmountRed(true);
//                       } else {
//                         setAmountRed(false);
//                       }
//                     }}
//                     disabled={isDisableAmount}
//                   />
//                 </FormControl>
//               </Box>
//               {balance[String(coin)] && (
//                 <Typography mt={1} color={amountRed ? 'red' : 'none'} fontWeight={'bold'}>
//                   Your available balance is {balance[String(coin)]} {coin}
//                 </Typography>
//               )}
//             </Box>

//             <Box mt={4}>
//               <Typography>Nonce</Typography>
//               <Box mt={1}>
//                 <FormControl fullWidth variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     type="number"
//                     value={nonce}
//                     onChange={(e: any) => {
//                       setNonce(e.target.value);
//                     }}
//                   />
//                 </FormControl>
//               </Box>
//             </Box>

//             <Box mt={4}>
//               <Typography>{Number(chainId) === CHAINS.BSC ? 'Gas price' : 'Max fee'} (gwei)</Typography>
//               <Box mt={1}>
//                 <FormControl sx={{ width: '25ch' }} variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     type="number"
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={maxFee}
//                     onChange={(e: any) => {
//                       setMaxFee(e.target.value);
//                     }}
//                   />
//                 </FormControl>
//               </Box>
//             </Box>

//             <Stack mt={4} direction={'row'} alignItems={'center'}>
//               <Typography>Select the {Number(chainId) === CHAINS.BSC ? 'gas price' : 'max fee'}</Typography>
//               <Box ml={2}>
//                 <ToggleButtonGroup
//                   color="primary"
//                   value={alignment}
//                   exclusive
//                   onChange={handleChangeFees}
//                   aria-label="type"
//                 >
//                   <ToggleButton value="high">High</ToggleButton>
//                   <ToggleButton value="average">Average</ToggleButton>
//                   <ToggleButton value="low">Low</ToggleButton>
//                 </ToggleButtonGroup>
//               </Box>
//             </Stack>

//             {Number(chainId) !== CHAINS.BSC && (
//               <>
//                 <Box mt={4}>
//                   <Typography>Max priorty fee (gwei)</Typography>
//                   <Box mt={1}>
//                     <FormControl sx={{ width: '25ch' }} variant="outlined">
//                       <OutlinedInput
//                         size={'small'}
//                         type="number"
//                         aria-describedby="outlined-weight-helper-text"
//                         inputProps={{
//                           'aria-label': 'weight',
//                         }}
//                         value={maxPriortyFee}
//                         onChange={(e: any) => {
//                           setMaxPriortyFee(e.target.value);
//                         }}
//                       />
//                     </FormControl>
//                   </Box>
//                 </Box>

//                 <Stack mt={4} direction={'row'} alignItems={'center'}>
//                   <Typography>Select the max priorty fee</Typography>
//                   <Box ml={2}>
//                     <ToggleButtonGroup
//                       color="primary"
//                       value={maxPriortyFeeAlignment}
//                       exclusive
//                       onChange={handleChangeMaxPriortyFee}
//                       aria-label="type"
//                     >
//                       <ToggleButton value="fast">Fast</ToggleButton>
//                       <ToggleButton value="normal">Normal</ToggleButton>
//                       <ToggleButton value="slow">Slow</ToggleButton>
//                     </ToggleButtonGroup>
//                   </Box>
//                 </Stack>
//               </>
//             )}

//             {displaySign && (
//               <>
//                 <Box mt={4}>
//                   <Typography>Gas</Typography>
//                   <Box mt={1}>
//                     <FormControl sx={{ width: '25ch' }} variant="outlined">
//                       <OutlinedInput
//                         size={'small'}
//                         type="number"
//                         aria-describedby="outlined-weight-helper-text"
//                         inputProps={{
//                           'aria-label': 'weight',
//                         }}
//                         value={gasLimit}
//                         onChange={(e: any) => {
//                           setGasLimit(e.target.value);
//                         }}
//                       />
//                     </FormControl>
//                   </Box>
//                 </Box>
//                 <Box mt={4}>
//                   <Typography>
//                     Miner fee: {networkFee} {mainCoin} = {Number(chainId) === CHAINS.BSC ? 'gas price' : 'max fee'}(
//                     {maxFee}) * gas({gasLimit})
//                   </Typography>
//                 </Box>
//               </>
//             )}

//             <Box mt={4}>
//               <Button variant={'contained'} onClick={onClickSignTransaction}>
//                 {displaySign ? 'Sign Transaction' : 'Calculate Gas Fee'}
//               </Button>
//             </Box>
//           </>
//         )}

//         {page === 2 && (
//           <>
//             <Container maxWidth="sm">
//               <Stack mt={10} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                 <Typography>Send to</Typography>
//                 <FormControl variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={OmitMiddleString(destinationAddress)}
//                     disabled
//                   />
//                 </FormControl>
//               </Stack>

//               <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                 <Typography>Spend amount</Typography>
//                 <FormControl variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     endAdornment={<InputAdornment position="end">{coin}</InputAdornment>}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={amount}
//                     disabled
//                   />
//                 </FormControl>
//               </Stack>

//               <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                 <Typography>{Number(chainId) === CHAINS.BSC ? 'Gas price' : 'Max fee'}</Typography>
//                 <FormControl variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     endAdornment={<InputAdornment position="end">Gwei</InputAdornment>}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={maxFee}
//                     disabled
//                   />
//                 </FormControl>
//               </Stack>

//               {Number(chainId) !== CHAINS.BSC && (
//                 <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                   <Typography>Max priorty fee</Typography>
//                   <FormControl variant="outlined">
//                     <OutlinedInput
//                       size={'small'}
//                       endAdornment={<InputAdornment position="end">Gwei</InputAdornment>}
//                       aria-describedby="outlined-weight-helper-text"
//                       inputProps={{
//                         'aria-label': 'weight',
//                       }}
//                       value={maxPriortyFee}
//                       disabled
//                     />
//                   </FormControl>
//                 </Stack>
//               )}

//               <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                 <Typography>Gas limit</Typography>
//                 <FormControl variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={gasLimit}
//                     disabled
//                   />
//                 </FormControl>
//               </Stack>

//               <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                 <Typography>Network fee</Typography>
//                 <FormControl variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     endAdornment={<InputAdornment position="end">{mainCoin}</InputAdornment>}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={networkFee}
//                     disabled
//                   />
//                 </FormControl>
//               </Stack>

//               <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                 <Typography>Nonce</Typography>
//                 <FormControl variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={nonce}
//                     disabled
//                   />
//                 </FormControl>
//               </Stack>

//               <Stack mt={8} direction={'row'} alignItems={'center'} justifyContent={'right'}>
//                 <Button
//                   color={'error'}
//                   variant={'contained'}
//                   onClick={() => {
//                     setPage(1);
//                   }}
//                 >
//                   Reject
//                 </Button>
//                 <Box ml={2}>
//                   <Button variant={'contained'} onClick={onClickSignAndPay} color={'success'}>
//                     Sign & Pay
//                   </Button>
//                 </Box>
//               </Stack>
//             </Container>
//           </>
//         )}

//         {page === 3 && (
//           <>
//             <Box textAlign={'center'} mt={10}>
//               <Icon component={CheckCircleIcon} color={'success'} style={{ fontSize: 80 }} />
//               <Typography mt={2} fontWeight={'bold'} fontSize={20}>
//                 Payment Sent
//               </Typography>
//               <Typography mt={2}>Your transaction has been successfully sent</Typography>
//               <Link href={blockExplorerLink} target="_blank">
//                 <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={2}>
//                   <Icon component={RemoveRedEyeIcon} />
//                   <Typography ml={1}>View on Block Explorer</Typography>
//                 </Stack>
//               </Link>
//               <Box mt={10}>
//                 <Button
//                   size={'large'}
//                   variant={'contained'}
//                   style={{ width: 500 }}
//                   onClick={() => {
//                     window.location.href = '/wallets/' + FindChainPathNamesByChains(Number(chainId));
//                   }}
//                 >
//                   Done
//                 </Button>
//               </Box>
//             </Box>
//           </>
//         )}
//       </Container>
//     </Box>
//   );
// };

// export default WalletsSend;

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Eye } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINS, COIN, COINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { BigDiv, BigMul, GweiToEther, WeiToGwei } from '@/utils/number'
import { OmitMiddleString } from '@/utils/strings'
import { COINGECKO_IDS, PAYOUT_STATUS } from '@/packages/constants'
import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode'
import {
  FindChainNamesByChains,
  FindChainPathNamesByChains,
  GetBlockchainTxUrlByChainIds,
} from '@/utils/web3'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

type feeType = {
  high: number
  average: number
  low: number
}

type maxPriortyFeeType = {
  fast: number
  normal: number
  slow: number
}

type Coin = {
  [currency: string]: string
}

type AddressBookRowType = {
  id: number
  chainId: number
  isMainnet: boolean
  name: string
  address: string
}

// 带单位后缀的只读输入框,原来是 OutlinedInput + InputAdornment 的组合
const SuffixInput = ({ value, suffix }: { value: string | number; suffix: string }) => (
  <div className="relative w-[200px]">
    <Input value={value} disabled className="pr-14" />
    <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
      {suffix}
    </span>
  </div>
)

const WalletsSend = () => {
  const router = useRouter()
  const { chainId, payoutId } = router.query

  const [mainCoin, setMainCoin] = useState<COINS>()

  const [alignment, setAlignment] = useState<'high' | 'average' | 'low'>('average')
  const [maxPriortyFeeAlignment, setMaxPriortyFeeAlignment] = useState<'fast' | 'normal' | 'slow'>(
    'normal'
  )
  const [feeObj, setFeeObj] = useState<feeType>()
  const [maxPriortyFeeObj, setMaxPriortyFeeObj] = useState<maxPriortyFeeType>()
  const [addressBookrows, setAddressBookrows] = useState<AddressBookRowType[]>([])

  const [page, setPage] = useState<number>(1)
  const [fromAddress, setFromAddress] = useState<string>('')
  const [balance, setBalance] = useState<Coin>({})
  const [destinationAddress, setDestinationAddress] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [maxFee, setMaxFee] = useState<number>(0)
  const [maxPriortyFee, setMaxPriortyFee] = useState<number>(0)
  const [gasLimit, setGasLimit] = useState<number>(0)

  const [networkFee, setNetworkFee] = useState<string>('')
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('')
  const [nonce, setNonce] = useState<number>(0)
  const [coin, setCoin] = useState<COINS>()
  const [displaySign, setDisplaySign] = useState<boolean>(false)
  const [amountRed, setAmountRed] = useState<boolean>(false)

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false)
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false)

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

  const handleChangeFees = (value: string) => {
    if (!value) return
    switch (value) {
      case 'high':
        setMaxFee(WeiToGwei(Number(feeObj?.high)))
        break
      case 'average':
        setMaxFee(WeiToGwei(Number(feeObj?.average)))
        break
      case 'low':
        setMaxFee(WeiToGwei(Number(feeObj?.low)))
        break
    }
    setAlignment(value as 'high' | 'average' | 'low')
  }

  const handleChangeMaxPriortyFee = (value: string) => {
    if (!value) return
    switch (value) {
      case 'fast':
        setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.fast)))
        break
      case 'normal':
        setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.normal)))
        break
      case 'slow':
        setMaxPriortyFee(WeiToGwei(Number(maxPriortyFeeObj?.slow)))
        break
    }
    setMaxPriortyFeeAlignment(value as 'fast' | 'normal' | 'slow')
  }

  const getBalance = async (chainId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: chainId,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setFromAddress(response.data.address)
        setBalance(response.data.balance)
        setMainCoin(response.data.main_coin.name)

        await getNonce(chainId, response.data.address)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getGasLimit = async (from: string): Promise<boolean> => {
    try {
      const response: any = await axios.get(Http.find_gas_limit, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
          coin: coin,
          from: from,
          to: destinationAddress,
          value: amount,
        },
      })
      if (response.result) {
        setGasLimit(response.data)
        return true
      }
      return false
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
      return false
    }
  }

  const getFeeRate = async (chainId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setFeeObj({
          high: response.data.fast,
          average: response.data.normal,
          low: response.data.slow,
        })
        setMaxFee(WeiToGwei(response.data.normal))
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getMaxPriortyFee = async (chainId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_max_priorty_fee, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setMaxPriortyFeeObj({
          fast: response.data.fast,
          normal: response.data.normal,
          slow: response.data.slow,
        })
        setMaxPriortyFee(WeiToGwei(response.data.normal))
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getAddressBook = async (chainId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          chain_id: chainId,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result && response.data.length > 0) {
        let rt: AddressBookRowType[] = []
        response.data.forEach((item: any) => {
          rt.push({
            id: item.id,
            chainId: item.chain_id,
            isMainnet: item.network === 1 ? true : false,
            name: item.name,
            address: item.address,
          })
        })

        setAddressBookrows(rt)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getNonce = async (chainId: number, address: string) => {
    if (address && address != '') {
      try {
        const response: any = await axios.get(Http.find_nonce, {
          params: {
            chain_id: chainId,
            network: network === 'mainnet' ? 1 : 2,
            address: address,
          },
        })
        if (response.result) {
          setNonce(response.data)
        }
      } catch (e) {
        showSnack('error', 'The network error occurred. Please try again later.')
        console.error(e)
      }
    }
  }

  const getPayoutInfo = async (id: number) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_id, {
        params: {
          id: id,
        },
      })

      if (response.result) {
        setDestinationAddress(response.data.address)

        const ids = COINGECKO_IDS[response.data.crypto as COINS]
        const rate_response: any = await axios.get(Http.find_crypto_price, {
          params: {
            ids: ids,
            currency: response.data.currency,
          },
        })
        if (rate_response.result) {
          const rate = rate_response.data[ids][response.data.currency.toLowerCase()]
          const totalPrice = parseFloat(
            BigDiv(Number(response.data.amount).toString(), rate)
          ).toFixed(8)
          setAmount(totalPrice)
          setCoin(response.data.crypto)

          setIsDisableDestinationAddress(true)
          setIsDisableAmount(true)
        }
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const checkAddress = async (): Promise<boolean> => {
    if (destinationAddress === fromAddress) {
      return false
    }

    if (!destinationAddress || destinationAddress === '') {
      return false
    }

    try {
      const response: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: chainId,
          address: destinationAddress,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      return response.result
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
      return false
    }
  }

  const checkAmount = (): boolean => {
    if (
      amount &&
      parseFloat(amount) > 0 &&
      parseFloat(balance[String(coin)]) >= parseFloat(amount)
    ) {
      return true
    }

    return false
  }

  const checkNonce = (): boolean => {
    if (nonce >= 0) {
      return true
    }

    return false
  }

  const checkMaxFee = (): boolean => {
    if (maxFee && maxFee >= 0) {
      return true
    }

    return false
  }

  const checkMaxPriortyFee = (): boolean => {
    if (maxPriortyFee && maxPriortyFee >= 0) {
      return true
    }

    return false
  }

  const checkGasLimit = async (): Promise<boolean> => {
    if (gasLimit && gasLimit > 0) {
      return true
    }

    return await getGasLimit(fromAddress)
  }

  const onClickSignTransaction = async () => {
    if (!(await checkAddress())) {
      showSnack('error', 'The destination address cannot be empty or input errors')
      return
    }

    if (!checkAmount()) {
      showSnack('error', 'Insufficient balance or input error')
      return
    }

    if (!checkNonce()) {
      showSnack('error', 'Incorrect nonce amount')
      return
    }

    if (!checkMaxFee()) {
      showSnack('error', 'Incorrect max fee')
      return
    }

    if (Number(chainId) !== CHAINS.BSC) {
      if (!checkMaxPriortyFee()) {
        showSnack('error', 'Incorrect max priorty fee')
        return
      }
    }

    if (!(await checkGasLimit())) {
      showSnack('error', 'Incorrect gas limit')
      return
    } else {
      setDisplaySign(true)
    }

    if (displaySign) {
      if (coin === mainCoin) {
        if (
          !networkFee ||
          !amount ||
          parseFloat(networkFee) * 2 + parseFloat(amount) > parseFloat(balance[String(mainCoin)])
        ) {
          showSnack('error', 'Insufficient balance or Insufficient gas fee')
          return
        }
      } else {
        if (
          !networkFee ||
          !amount ||
          parseFloat(networkFee) * 2 > parseFloat(balance[String(mainCoin)])
        ) {
          showSnack('error', 'Insufficient balance or Insufficient gas fee')
          return
        }
      }

      if (networkFee && networkFee != '') {
        setPage(2)
      }
    }
  }

  const onClickSignAndPay = async () => {
    try {
      const response: any = await axios.post(Http.send_transaction, {
        chain_id: chainId,
        from_address: fromAddress,
        to_address: destinationAddress,
        network: network === 'mainnet' ? 1 : 2,
        wallet_id: walletId,
        user_id: userId,
        value: amount,
        coin: coin,
        nonce: nonce,
        max_fee: maxFee,
        max_priorty_fee: maxPriortyFee,
        gas_limit: gasLimit,
      })

      if (response.result) {
        if (payoutId) {
          const update_payout_resp: any = await axios.put(Http.update_payout_by_id, {
            id: payoutId,
            tx: response.data.hash,
            crypto_amount: amount,
            payout_status: PAYOUT_STATUS.Completed,
          })

          if (!update_payout_resp.result) {
            showSnack('error', 'Can not update the status of payout!')
            return
          }
        }

        showSnack('success', 'Successful creation!')

        setBlockExplorerLink(
          GetBlockchainTxUrlByChainIds(network === 'mainnet', Number(chainId), response.data.hash)
        )
        setPage(3)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onClickParseClipboardText = async (text: string) => {
    try {
      if (!text || text === '') {
        showSnack('error', 'Invalid parsing')
        return
      }

      text = text.trim()

      const response: any = await axios.get(Http.parse_qrcode_text, {
        params: {
          chain_id: chainId,
          text: text,
        },
      })

      if (response.result) {
        showSnack('success', 'Parsing success')
      } else {
        showSnack('error', 'Invalid parsing')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  useEffect(() => {
    if (maxFee && maxFee > 0 && gasLimit && gasLimit > 0) {
      setNetworkFee(
        parseFloat(BigMul(GweiToEther(maxFee).toString(), gasLimit.toString())).toFixed(8)
      )
    }
  }, [maxFee, gasLimit])

  // const init = async (chainId: number, payoutId: number) => {
  //   await Promise.all([getBalance(chainId), getFeeRate(chainId)])

  //   if (chainId !== CHAINS.BSC) {
  //     await getMaxPriortyFee(chainId)
  //   }
  //   await getAddressBook(chainId)

  //   if (payoutId) {
  //     await getPayoutInfo(payoutId)
  //   }
  // }

  useEffect(() => {
    if (payoutId) {
      getPayoutInfo(Number(payoutId))
    }
  }, [payoutId])

  useEffect(() => {
    if (!chainId) {
      return
    }
    getBalance(Number(chainId), storeId, network)
  }, [chainId, storeId, network])

  useEffect(() => {
    if (!chainId) {
      return
    }
    getFeeRate(Number(chainId), network)
  }, [chainId, network])

  useEffect(() => {
    if (!chainId) {
      return
    }
    if (Number(chainId) !== CHAINS.BSC) {
      getMaxPriortyFee(Number(chainId), network)
    }
  }, [chainId, network])

  useEffect(() => {
    if (!chainId) {
      return
    }
    getAddressBook(Number(chainId), network)
  }, [chainId, network])

  return (
    <div className="mb-16 flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 my-8">
        {GetImgSrcByChain(Number(chainId)) && (
          <Image src={GetImgSrcByChain(Number(chainId))} alt="chain" width={50} height={50} />
        )}
        <h1 className="text-3xl font-bold tracking-tight">
          Send coin on{' '}
          {network === 'mainnet'
            ? FindChainNamesByChains(Number(chainId)) + ' mainnet'
            : FindChainNamesByChains(Number(chainId)) + ' testnet'}
        </h1>
      </div>

      <div className="mx-auto w-full max-w-screen-lg px-4">
        {page === 1 && (
          <div className="mx-auto max-w-2xl">
            <Button
              onClick={async () => {
                const text = await navigator.clipboard.readText()
                await onClickParseClipboardText(text)
              }}
            >
              Parse clipboard text
            </Button>

            <div className="mt-6 space-y-2">
              <Label>From address</Label>
              <Input value={fromAddress} disabled />
            </div>

            <div className="mt-6 space-y-2">
              <Label>Destination address</Label>
              <Input
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                disabled={isDisableDestinationAddress}
              />
            </div>

            {addressBookrows && addressBookrows.length > 0 && (
              <div className="mt-6">
                <Label className="mb-2 block">Address books</Label>
                <div className="flex flex-wrap gap-2">
                  {addressBookrows.map((item, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer px-3 py-1 font-normal hover:bg-muted"
                      onClick={() => setDestinationAddress(item.address)}
                    >
                      {OmitMiddleString(item.address)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Label className="mb-2 block">Coin</Label>
              <div className="flex flex-wrap gap-2">
                {balance &&
                  Object.entries(balance).map(([token, tokenAmount], balanceIndex) => (
                    <button
                      key={balanceIndex}
                      type="button"
                      onClick={() => setCoin(token as COINS)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                        token === coin
                          ? 'border-transparent bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Image
                        src={GetImgSrcByCrypto(token as COINS)}
                        alt="logo"
                        width={20}
                        height={20}
                      />
                      {String(tokenAmount)} {token}
                    </button>
                  ))}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (parseFloat(e.target.value) > parseFloat(balance[String(coin)])) {
                    setAmountRed(true)
                  } else {
                    setAmountRed(false)
                  }
                }}
                disabled={isDisableAmount}
              />
              {balance[String(coin)] && (
                <p
                  className={cn(
                    'text-sm font-semibold',
                    amountRed ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  Your available balance is {balance[String(coin)]} {coin}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <Label>Nonce</Label>
              <Input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(Number(e.target.value))}
              />
            </div>

            <div className="mt-6 space-y-2">
              <Label>{Number(chainId) === CHAINS.BSC ? 'Gas price' : 'Max fee'} (gwei)</Label>
              <Input
                type="number"
                className="w-48"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-sm">
                Select the {Number(chainId) === CHAINS.BSC ? 'gas price' : 'max fee'}
              </span>
              <ToggleGroup type="single" value={alignment} onValueChange={handleChangeFees}>
                <ToggleGroupItem value="high">High</ToggleGroupItem>
                <ToggleGroupItem value="average">Average</ToggleGroupItem>
                <ToggleGroupItem value="low">Low</ToggleGroupItem>
              </ToggleGroup>
            </div>

            {Number(chainId) !== CHAINS.BSC && (
              <>
                <div className="mt-6 space-y-2">
                  <Label>Max priorty fee (gwei)</Label>
                  <Input
                    type="number"
                    className="w-48"
                    value={maxPriortyFee}
                    onChange={(e) => setMaxPriortyFee(Number(e.target.value))}
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-sm">Select the max priorty fee</span>
                  <ToggleGroup
                    type="single"
                    value={maxPriortyFeeAlignment}
                    onValueChange={handleChangeMaxPriortyFee}
                  >
                    <ToggleGroupItem value="fast">Fast</ToggleGroupItem>
                    <ToggleGroupItem value="normal">Normal</ToggleGroupItem>
                    <ToggleGroupItem value="slow">Slow</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </>
            )}

            {displaySign && (
              <>
                <div className="mt-6 space-y-2">
                  <Label>Gas</Label>
                  <Input
                    type="number"
                    className="w-48"
                    value={gasLimit}
                    onChange={(e) => setGasLimit(Number(e.target.value))}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Miner fee: {networkFee} {mainCoin} ={' '}
                  {Number(chainId) === CHAINS.BSC ? 'gas price' : 'max fee'}({maxFee}) * gas(
                  {gasLimit})
                </p>
              </>
            )}

            <Button className="mt-6" onClick={onClickSignTransaction}>
              {displaySign ? 'Sign Transaction' : 'Calculate Gas Fee'}
            </Button>
          </div>
        )}

        {page === 2 && (
          <div className="mx-auto max-w-md">
            <div className="mt-10 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Send to</span>
              <Input value={OmitMiddleString(destinationAddress)} disabled className="w-[220px]" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Spend amount</span>
              <SuffixInput value={amount} suffix={String(coin)} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                {Number(chainId) === CHAINS.BSC ? 'Gas price' : 'Max fee'}
              </span>
              <SuffixInput value={maxFee} suffix="Gwei" />
            </div>

            {Number(chainId) !== CHAINS.BSC && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Max priorty fee</span>
                <SuffixInput value={maxPriortyFee} suffix="Gwei" />
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Gas limit</span>
              <Input value={gasLimit} disabled className="w-[220px]" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Network fee</span>
              <SuffixInput value={networkFee} suffix={String(mainCoin)} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Nonce</span>
              <Input value={nonce} disabled className="w-[220px]" />
            </div>

            <div className="mt-8 flex items-center justify-end gap-2">
              <Button variant="destructive" onClick={() => setPage(1)}>
                Reject
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={onClickSignAndPay}>
                Sign & Pay
              </Button>
            </div>
          </div>
        )}

        {page === 3 && (
          <div className="mt-16 flex flex-col items-center text-center">
            <CheckCircle2 className="h-20 w-20 text-green-500" strokeWidth={1.5} />

            <p className="mt-4 text-xl font-bold">Payment Sent</p>
            <p className="mt-2 text-muted-foreground">
              Your transaction has been successfully sent
            </p>

            <Link
              href={blockExplorerLink}
              target="_blank"
              className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Eye className="h-4 w-4" />
              <span>View on Block Explorer</span>
            </Link>

            <Button
              size="lg"
              className="mt-16 w-full max-w-[500px]"
              onClick={() => {
                window.location.href = '/wallets/' + FindChainPathNamesByChains(Number(chainId))
              }}
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletsSend
