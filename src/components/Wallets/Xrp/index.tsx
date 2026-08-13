// import { AccountCircle, Settings } from '@mui/icons-material';
// import {
//   Box,
//   Button,
//   Container,
//   FormControl,
//   IconButton,
//   InputAdornment,
//   MenuItem,
//   OutlinedInput,
//   Select,
//   Stack,
//   Switch,
//   Typography,
//   Chip,
//   Grid,
//   Card,
//   CardContent,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { CHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { GetBlockchainAddressUrl, GetBlockchainTxUrl } from '@/utils/chain/xrp';
// import { EthereumTransactionDetail } from '@/packages/web3/types';
// import Link from 'next/link';
// import XrpSVG from '@/assets/chain/xrp.svg';
// import Image from 'next/image';
// import TransactionsTab from '@/components/Tab/TransactionTab';
// import { GetImgSrcByCrypto } from '@/utils/qrcode';
// import { FindCoinsByMainnetAndName } from '@/utils/web3';
// import { DecodeNonstandardCurrencyCode } from '@/utils/strings';

// type walletType = {
//   id: number;
//   address: string;
//   type: string;
//   balance: any;
//   status: number;
//   txUrl: string;
//   transactions: EthereumTransactionDetail[];
//   trustLine: trustLineType[];
// };

// type feeType = {
//   baseFee: number;
//   medianFee: number;
//   minimumFee: number;
//   openLedgerFee: number;
// };

// type trustLineType = {
//   account: string;
//   balance: string;
//   currency: string;
//   limit: string;
//   limitPeer: string;
//   noRipple: boolean;
//   noRipplePeer: boolean;
//   qualityIn: number;
//   qualityOut: number;
// };

// const XRP = () => {
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

//   const [trustLineToken, setTrustLineToken] = useState<COINS>();
//   const [trustLineLimit, setTrustLineLimit] = useState<number>(0);

//   const coinNames = FindCoinsByMainnetAndName(getNetwork() === 'mainnet' ? true : false, CHAINNAMES.XRP);

//   const onClickRescanAddress = async () => {
//     await getXrpWalletAddress();

//     setSnackSeverity('success');
//     setSnackMessage('Successful rescan!');
//     setSnackOpen(true);
//   };

//   const getXrpWalletAddress = async () => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
//         params: {
//           wallet_id: getWalletId(),
//           chain_id: CHAINS.XRP,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });

//       if (response.result) {
//         if (response.data.length > 0) {
//           let ws: walletType[] = [];
//           response.data.forEach(async (item: any) => {
//             let tl: trustLineType[] = [];

//             item.trust_line &&
//               item.trust_line.length > 0 &&
//               item.trust_line.map((trustItem: any) => {
//                 tl.push({
//                   account: trustItem.account,
//                   balance: trustItem.balance,
//                   currency: DecodeNonstandardCurrencyCode(trustItem.currency),
//                   limit: trustItem.limit,
//                   limitPeer: trustItem.limit_peer,
//                   noRipple: trustItem.no_ripple,
//                   noRipplePeer: trustItem.no_ripple_peer,
//                   qualityIn: trustItem.quality_in,
//                   qualityOut: trustItem.quality_out,
//                 });
//               });

//             ws.push({
//               id: item.id,
//               address: item.address,
//               type: item.note,
//               balance: item.balance,
//               status: item.status,
//               txUrl: item.tx_url,
//               transactions: item.transactions,
//               trustLine: tl,
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

//   const getXrpPaymentSetting = async () => {
//     try {
//       const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
//         params: {
//           user_id: getUserId(),
//           chain_id: CHAINS.XRP,
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

//   const getSolanaFeeRate = async () => {
//     try {
//       const response: any = await axios.get(Http.find_fee_rate, {
//         params: {
//           chain_id: CHAINS.XRP,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result) {
//         setFeeObj({
//           baseFee: response.data.base_fee,
//           medianFee: response.data.median_fee,
//           minimumFee: response.data.minimum_fee,
//           openLedgerFee: response.data.open_ledger_fee,
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

//   const onClickAddTrustLine = async (address: string) => {
//     try {
//       const response: any = await axios.post(Http.create_token_trust_line, {
//         wallet_id: getWalletId(),
//         user_id: getUserId(),
//         chain_id: CHAINS.XRP,
//         network: getNetwork() === 'mainnet' ? 1 : 2,
//         address: address,
//         coin: trustLineToken,
//         limit: trustLineLimit,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful creation!');
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
//     await getXrpWalletAddress();
//     await getXrpPaymentSetting();
//     await getSolanaFeeRate();
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
//             <Image src={XrpSVG} alt="" width={50} height={50} />
//             <Typography variant="h6" pl={1}>
//               XRP Wallet
//             </Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} gap={2}>
//             <Box>
//               <Button
//                 variant={'contained'}
//                 onClick={() => {
//                   window.location.href = '/wallets/xrp/send';
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
//                     CHAINS.XRP
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
//           <Typography variant="h6">Transaction Fee</Typography>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-around'} mt={4} textAlign={'center'}>
//             <Card>
//               <CardContent>
//                 <Box px={6}>
//                   <Typography>Base Fee</Typography>
//                   <Typography mt={2} fontWeight={'bold'}>
//                     {feeObj?.baseFee} XRP
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent>
//                 <Box px={6}>
//                   <Typography>Median Fee</Typography>
//                   <Typography mt={2} fontWeight={'bold'}>
//                     {feeObj?.medianFee} XRP
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent>
//                 <Box px={6}>
//                   <Typography>Minimum Fee</Typography>
//                   <Typography mt={2} fontWeight={'bold'}>
//                     {feeObj?.minimumFee} XRP
//                   </Typography>
//                 </Box>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardContent>
//                 <Box px={6}>
//                   <Typography>Open Ledger Fee</Typography>
//                   <Typography mt={2} fontWeight={'bold'}>
//                     {feeObj?.openLedgerFee} XRP
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
//                     <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                       <Box>
//                         <Typography fontWeight={'bold'} fontSize={18}>
//                           {item.type}
//                         </Typography>
//                         <Box mt={2}>
//                           <Stack direction={'row'} alignItems={'center'} mt={1} gap={1}>
//                             <Chip
//                               icon={<AccountCircle />}
//                               label={item.address}
//                               component="a"
//                               variant="outlined"
//                               clickable
//                               onClick={async () => {
//                                 await navigator.clipboard.writeText(item.address);

//                                 setSnackMessage('Successfully copy');
//                                 setSnackSeverity('success');
//                                 setSnackOpen(true);
//                               }}
//                             />

//                             {item.status === 2 && (
//                               <Chip size={'medium'} label={'INACTIVE'} variant={'outlined'} color={'error'} />
//                             )}
//                           </Stack>
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
//                           href={GetBlockchainAddressUrl(getNetwork() === 'mainnet' ? true : false, item.address)}
//                           target={'_blank'}
//                           variant={'outlined'}
//                         >
//                           Check onChain
//                         </Button>
//                       </Box>
//                     </Stack>
//                     <Box mt={5}>
//                       <Typography fontWeight={'bold'} fontSize={18}>
//                         Token TrustLine
//                       </Typography>

//                       <Typography fontWeight={'bold'} mt={2} mb={1}>
//                         ADD
//                       </Typography>
//                       <Box mt={1}>
//                         <FormControl variant="outlined" fullWidth>
//                           <Select
//                             size={'small'}
//                             inputProps={{ 'aria-label': 'Without label' }}
//                             onChange={(e) => {
//                               setTrustLineToken(e.target.value as COINS);
//                             }}
//                             value={trustLineToken}
//                           >
//                             {coinNames &&
//                               Object.entries(coinNames).length > 0 &&
//                               Object.entries(coinNames).map((item, index) => (
//                                 <MenuItem value={item[1]} key={index}>
//                                   {item[1]}
//                                 </MenuItem>
//                               ))}
//                           </Select>
//                         </FormControl>
//                       </Box>
//                       <Box mt={1}>
//                         <FormControl variant="outlined" fullWidth>
//                           <OutlinedInput
//                             size={'small'}
//                             aria-describedby="outlined-weight-helper-text"
//                             inputProps={{
//                               'aria-label': 'weight',
//                             }}
//                             type={'number'}
//                             value={trustLineLimit}
//                             onChange={(e: any) => {
//                               setTrustLineLimit(e.target.value);
//                             }}
//                             placeholder="Limit"
//                           />
//                         </FormControl>
//                       </Box>
//                       <Box mt={2}>
//                         <Button
//                           variant={'contained'}
//                           onClick={() => {
//                             onClickAddTrustLine(item.address);
//                           }}
//                         >
//                           Add trustline
//                         </Button>
//                       </Box>

//                       <Typography fontWeight={'bold'} mt={2} mb={1}>
//                         VIEW
//                       </Typography>
//                       {item.trustLine && item.trustLine.length > 0 ? (
//                         <Box mt={2}>
//                           {item.trustLine.map((trustItem: trustLineType, trustIndex) => (
//                             <Box mb={2} key={trustIndex}>
//                               <Stack direction={'row'} gap={2}>
//                                 <Typography>Issuer:</Typography>
//                                 <Link
//                                   href={GetBlockchainAddressUrl(
//                                     getNetwork() === 'mainnet' ? true : false,
//                                     trustItem.account,
//                                   )}
//                                   target={'_blank'}
//                                 >
//                                   {trustItem.account}
//                                 </Link>
//                               </Stack>
//                               <Stack direction={'row'} gap={2}>
//                                 <Typography>Token:</Typography>
//                                 <Typography>{trustItem.currency}</Typography>
//                               </Stack>
//                               <Stack direction={'row'} gap={2}>
//                                 <Typography>Limit:</Typography>
//                                 <Typography>{trustItem.limit}</Typography>
//                               </Stack>
//                             </Box>
//                           ))}
//                         </Box>
//                       ) : (
//                         <Typography>No TrustLine Setup.</Typography>
//                       )}
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

// export default XRP;

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Copy, Settings } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import { CHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain'
import { GetBlockchainAddressUrl } from '@/utils/chain/xrp'
import { EthereumTransactionDetail } from '@/packages/web3/types'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import XrpSVG from '@/assets/chain/xrp.svg'
import TransactionsTab from '@/components/Tab/TransactionTab'
import { GetImgSrcByCrypto } from '@/utils/qrcode'
import { FindCoinsByMainnetAndName } from '@/utils/web3'
import { DecodeNonstandardCurrencyCode } from '@/utils/strings'

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
  status: number
  txUrl: string
  transactions: EthereumTransactionDetail[]
  trustLine: trustLineType[]
}

type feeType = {
  baseFee: number
  medianFee: number
  minimumFee: number
  openLedgerFee: number
}

type trustLineType = {
  account: string
  balance: string
  currency: string
  limit: string
  limitPeer: string
  noRipple: boolean
  noRipplePeer: boolean
  qualityIn: number
  qualityOut: number
}

// Trust line 展示,单独抽出复用
const TrustLineRow = ({
  trustItem,
  isMainnet,
}: {
  trustItem: trustLineType
  isMainnet: boolean
}) => (
  <div className="space-y-1 text-sm">
    <div className="flex gap-2">
      <span className="text-muted-foreground">Issuer:</span>
      <Link
        href={GetBlockchainAddressUrl(isMainnet, trustItem.account)}
        target="_blank"
        className="text-primary hover:underline"
      >
        {trustItem.account}
      </Link>
    </div>
    <div className="flex gap-2">
      <span className="text-muted-foreground">Token:</span>
      <span>{trustItem.currency}</span>
    </div>
    <div className="flex gap-2">
      <span className="text-muted-foreground">Limit:</span>
      <span>{trustItem.limit}</span>
    </div>
  </div>
)

const XRP = () => {
  const [isSettings, setIsSettings] = useState<boolean>(false)
  const [wallet, setWallet] = useState<walletType[]>([])
  const [feeObj, setFeeObj] = useState<feeType>()

  const [settingId, setSettingId] = useState<number>(0)
  const [paymentExpire, setPaymentExpire] = useState<number>(0)
  const [confirmBlock, setConfirmBlock] = useState<number>(0)
  const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false)
  const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0)

  const [trustLineToken, setTrustLineToken] = useState<COINS>()
  const [trustLineLimit, setTrustLineLimit] = useState<number>(0)

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

  const coinNames = FindCoinsByMainnetAndName(network === 'mainnet', CHAINNAMES.XRP)

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const onClickRescanAddress = async () => {
    await getXrpWalletAddress(walletId, network)
    showSnack('success', 'Successful rescan!')
  }

  const getXrpWalletAddress = async (walletId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          wallet_id: walletId,
          chain_id: CHAINS.XRP,
          network: network === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let ws: walletType[] = []
          response.data.forEach(async (item: any) => {
            let tl: trustLineType[] = []

            item.trust_line &&
              item.trust_line.length > 0 &&
              item.trust_line.map((trustItem: any) => {
                tl.push({
                  account: trustItem.account,
                  balance: trustItem.balance,
                  currency: DecodeNonstandardCurrencyCode(trustItem.currency),
                  limit: trustItem.limit,
                  limitPeer: trustItem.limit_peer,
                  noRipple: trustItem.no_ripple,
                  noRipplePeer: trustItem.no_ripple_peer,
                  qualityIn: trustItem.quality_in,
                  qualityOut: trustItem.quality_out,
                })
              })

            ws.push({
              id: item.id,
              address: item.address,
              type: item.note,
              balance: item.balance,
              status: item.status,
              txUrl: item.tx_url,
              transactions: item.transactions,
              trustLine: tl,
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

  const getXrpPaymentSetting = async (userId: number, storeId: number, network: string) => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: userId,
          chain_id: CHAINS.XRP,
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

  const getXrpFeeRate = async (network: string) => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: CHAINS.XRP,
          network: network === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setFeeObj({
          baseFee: response.data.base_fee,
          medianFee: response.data.median_fee,
          minimumFee: response.data.minimum_fee,
          openLedgerFee: response.data.open_ledger_fee,
        })
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
        await init(walletId, storeId, userId, network)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onClickAddTrustLine = async (address: string) => {
    try {
      const response: any = await axios.post(Http.create_token_trust_line, {
        wallet_id: walletId,
        user_id: userId,
        chain_id: CHAINS.XRP,
        network: network === 'mainnet' ? 1 : 2,
        address: address,
        coin: trustLineToken,
        limit: trustLineLimit,
      })

      if (response.result) {
        showSnack('success', 'Successful creation!')
        await init(walletId, storeId, userId, network)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const init = async (walletId: number, storeId: number, userId: number, network: string) => {
    await Promise.all([
      await getXrpWalletAddress(walletId, network),
      await getXrpPaymentSetting(userId, storeId, network),
      await getXrpFeeRate(network),
    ])
  }

  useEffect(() => {
    getXrpWalletAddress(walletId, network)
  }, [walletId, network])

  useEffect(() => {
    getXrpPaymentSetting(userId, storeId, network)
  }, [userId, storeId, network])

  useEffect(() => {
    getXrpFeeRate(network)
  }, [network])

  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pt-10">
          <div className="flex items-center gap-2">
            <Image src={XrpSVG} alt="" width={50} height={50} />
            <h2 className="text-lg font-semibold">XRP Wallet</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                window.location.href = '/wallets/xrp/send'
              }}
            >
              Send
            </Button>
            <Button
              onClick={() => {
                window.location.href = `/wallets/receive?chainId=${
                  CHAINS.XRP
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
          <h3 className="text-lg font-semibold">Transaction Fee</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">Base Fee</p>
                <p className="mt-2 font-semibold">{feeObj?.baseFee} XRP</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">Median Fee</p>
                <p className="mt-2 font-semibold">{feeObj?.medianFee} XRP</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">Minimum Fee</p>
                <p className="mt-2 font-semibold">{feeObj?.minimumFee} XRP</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">Open Ledger Fee</p>
                <p className="mt-2 font-semibold">{feeObj?.openLedgerFee} XRP</p>
              </CardContent>
            </Card>
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

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(item.address)
                              showSnack('success', 'Successfully copy')
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {item.address}
                          </button>

                          {item.status === 2 && (
                            <Badge
                              variant="outline"
                              className="border-destructive text-destructive"
                            >
                              INACTIVE
                            </Badge>
                          )}
                        </div>

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

                    <div className="mt-6">
                      <p className="text-lg font-semibold">Token TrustLine</p>

                      <div className="mt-4 max-w-md">
                        <p className="mb-2 font-semibold">ADD</p>

                        <div className="space-y-2">
                          <Select
                            value={trustLineToken}
                            onValueChange={(v) => setTrustLineToken(v as COINS)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select token" />
                            </SelectTrigger>
                            <SelectContent>
                              {coinNames &&
                                Object.entries(coinNames).length > 0 &&
                                Object.entries(coinNames).map((coinItem, coinIndex) => (
                                  <SelectItem value={coinItem[1]} key={coinIndex}>
                                    {coinItem[1]}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          <Input
                            type="number"
                            value={trustLineLimit}
                            onChange={(e) => setTrustLineLimit(Number(e.target.value))}
                            placeholder="Limit"
                          />
                        </div>

                        <Button className="mt-2" onClick={() => onClickAddTrustLine(item.address)}>
                          Add trustline
                        </Button>
                      </div>

                      <p className="mb-2 mt-4 font-semibold">VIEW</p>
                      {item.trustLine && item.trustLine.length > 0 ? (
                        <div className="space-y-4">
                          {item.trustLine.map((trustItem: trustLineType, trustIndex) => (
                            <TrustLineRow
                              key={trustIndex}
                              trustItem={trustItem}
                              isMainnet={network === 'mainnet'}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No TrustLine Setup.</p>
                      )}
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

export default XRP
