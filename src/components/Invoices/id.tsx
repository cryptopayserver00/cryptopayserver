// import { ContentCopy, HelpOutline, Lock, Store, WarningAmber } from '@mui/icons-material';
// import {
//   Box,
//   Button,
//   Container,
//   Stack,
//   Typography,
//   Paper,
//   Alert,
//   IconButton,
//   AlertTitle,
//   Icon,
//   Grid,
//   Chip,
//   Divider,
//   Link,
// } from '@mui/material';
// import { useSnackPresistStore } from '@/lib/store';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { QRCodeSVG } from 'qrcode.react';
// import { OmitMiddleString } from '@/utils/strings';
// import { CURRENCY_SYMBOLS, ORDER_STATUS, WALLET } from '@/packages/constants';
// import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode';
// import {
//   FindChainNamesByChains,
//   FindTokenByChainIdsAndSymbol,
//   GetBlockchainAddressUrlByChainIds,
//   GetBlockchainTxUrlByChainIds,
//   GetChainIds,
// } from '@/utils/web3';
// import { CHAINS, COINS } from '@/packages/constants/blockchain';
// import WalletConnectButton from '@/components/Button/WalletConnectButton';
// import Image from 'next/image';
// import HelpDrawer from '@/components/Drawer/HelpDrawer';
// import ReportPaymentDialog from '@/components/Dialog/ReportPaymentDialog';

// type OrderType = {
//   orderId: number;
//   amount: number;
//   buyerEmail: string;
//   crypto: string;
//   currency: string;
//   description: string;
//   destinationAddress: string;
//   metadata: string;
//   notificationEmail: string;
//   notificationUrl: string;
//   orderStatus: string;
//   paid: number;
//   paymentMethod: string;
//   createdDate: number;
//   expirationDate: number;
//   rate: number;
//   lightningInvoice: string;
//   lightningUrl: string;
//   totalPrice: string;
//   amountDue: string;
//   fromAddress: string;
//   toAddress: string;
//   hash: string;
//   blockTimestamp: number;
//   network: number;
//   chainId: number;
//   qrCodeText: string;
//   qrLightningCodeText: string;
//   storeName: string;
//   storeBrandColor: string;
//   storeLogoUrl: string;
//   storeWebsite: string;
// };

// const InvoiceDetails = () => {
//   const router = useRouter();
//   const { id } = router.query;

//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const [countdownVal, setCountdownVal] = useState<string>('0');
//   const [openDrawer, setOpenDrawer] = useState(false);
//   const [openDialog, setOpenDialog] = useState<boolean>(false);

//   const [order, setOrder] = useState<OrderType>();
//   const [crypto, setCrypto] = useState<COINS>();
//   const [qrCode, setQrCode] = useState<string>('');
//   const [destinationAddress, setDestinationAddress] = useState<string>('');

//   const init = async (id: any, order?: OrderType) => {
//     try {
//       const response: any = await axios.get(Http.find_invoice_by_id, {
//         params: {
//           id: id,
//         },
//       });

//       if (response.result) {
//         setOrder({
//           orderId: response.data.order_id,
//           amount: response.data.amount,
//           buyerEmail: response.data.buyer_email,
//           crypto: response.data.crypto,
//           currency: response.data.currency,
//           description: response.data.description,
//           destinationAddress: response.data.destination_address,
//           metadata: response.data.metadata,
//           notificationEmail: response.data.notification_email,
//           notificationUrl: response.data.notification_url,
//           orderStatus: response.data.order_status,
//           paid: response.data.paid,
//           paymentMethod: response.data.payment_method,
//           createdDate: new Date(response.data.created_at).getTime(),
//           expirationDate: new Date(response.data.expiration_at).getTime(),
//           rate: response.data.rate,
//           lightningInvoice: response.data.lightning_invoice,
//           lightningUrl: response.data.lightning_url,
//           totalPrice: response.data.crypto_amount,
//           amountDue: response.data.crypto_amount,
//           fromAddress: response.data.from_address,
//           toAddress: response.data.to_address,
//           hash: response.data.hash,
//           blockTimestamp: Number(response.data.block_timestamp),
//           network: response.data.network,
//           chainId: response.data.chain_id,
//           qrCodeText: response.data.qr_code_text,
//           qrLightningCodeText: response.data.qr_lightning_code_text,
//           storeName: response.data.store_name,
//           storeBrandColor: response.data.store_brand_color,
//           storeLogoUrl: response.data.store_logo_url,
//           storeWebsite: response.data.store_website,
//         });

//         if (order === undefined) {
//           setCrypto(response.data.crypto);
//           setQrCode(response.data.qr_code_text);
//           setDestinationAddress(response.data.destination_address);
//         }
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Can not find the invoice!');
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
//     if (id) {
//       const activeInit = setInterval(async () => {
//         await init(id, order as OrderType);
//       }, 10 * 1000);

//       return () => clearInterval(activeInit);
//     }

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, order]);

//   useEffect(() => {
//     if (id) {
//       init(id);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const countDownTime = () => {
//     if (!order?.expirationDate || order?.expirationDate <= 0) {
//       return;
//     }

//     const currentTime = Date.now();
//     const remainingTime = order?.expirationDate - currentTime;

//     if (remainingTime <= 0) {
//       return;
//     }

//     const seconds = Math.floor((remainingTime / 1000) % 60);
//     const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
//     const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

//     setCountdownVal(formattedTime);
//   };

//   useEffect(() => {
//     const activeCountDownTime = setInterval(() => {
//       countDownTime();
//     }, 1000);

//     return () => clearInterval(activeCountDownTime);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [order?.expirationDate]);

//   const onClickCrypto = () => {
//     setCrypto(order?.crypto as COINS);
//     setQrCode(String(order?.qrCodeText));
//     setDestinationAddress(String(order?.destinationAddress));
//   };

//   const onClickBtcLn = () => {
//     setCrypto(COINS.BTC_LN);
//     setQrCode(String(order?.qrLightningCodeText));
//     setDestinationAddress(String(order?.lightningInvoice));
//   };

//   return (
//     <Box mt={4}>
//       <Container>
//         {order?.network === 2 && (
//           <Box mb={2}>
//             <Alert severity="warning">
//               <AlertTitle>Warning</AlertTitle>
//               <Typography>
//                 This is a test network, and the currency has no real value. If you need free coins, you can get
//                 them&nbsp;
//                 <Link href={'/freecoin'} target="_blank">
//                   here.
//                 </Link>
//               </Typography>
//             </Alert>
//           </Box>
//         )}

//         <Box mb={2}>
//           {order?.orderStatus === ORDER_STATUS.Settled && (
//             <Alert variant="filled" severity="success">
//               <Stack direction={'row'} alignItems={'center'}>
//                 <Typography>The order has been paid successfully</Typography>
//               </Stack>
//             </Alert>
//           )}

//           {order?.orderStatus === ORDER_STATUS.Expired && (
//             <Alert variant="filled" severity="warning">
//               <Stack direction={'row'} alignItems={'center'}>
//                 <Typography>The order has expired, please do not continue to pay</Typography>
//               </Stack>
//             </Alert>
//           )}
//           {order?.orderStatus === ORDER_STATUS.Invalid && (
//             <Alert variant="filled" severity="error">
//               <Stack direction={'row'} alignItems={'center'}>
//                 <Typography>The order has invalid, please do not continue to pay</Typography>
//               </Stack>
//             </Alert>
//           )}
//         </Box>

//         <Grid container spacing={20}>
//           <Grid item xs={6} md={6} sm={6}>
//             <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//               <Stack direction={'row'} alignItems={'center'}>
//                 {order?.storeLogoUrl ? (
//                   <Image alt="logo" src={order?.storeLogoUrl} width={100} height={40} />
//                 ) : (
//                   <Icon component={Store} />
//                 )}
//                 <Box mx={1}>
//                   <Link href={String(order?.storeWebsite)}>{order?.storeName}</Link>
//                 </Box>
//                 {order?.network === 2 && <Chip label="TestMode" color={'warning'} variant={'filled'} />}
//               </Stack>

//               <Stack direction={'row'} alignItems={'center'}>
//                 {countdownVal !== '0' && <Typography mx={1}>{countdownVal}</Typography>}
//                 <IconButton
//                   aria-label="icon"
//                   onClick={() => {
//                     setOpenDrawer(true);
//                   }}
//                 >
//                   <HelpOutline />
//                 </IconButton>
//               </Stack>
//             </Stack>

//             <Stack direction={'row'} alignItems={'center'} mt={6}>
//               <Typography variant="h4" fontWeight={'bold'}>
//                 {order?.totalPrice}
//               </Typography>
//               <Typography ml={1} variant="h4" fontWeight={'bold'}>
//                 {order?.crypto}
//               </Typography>
//             </Stack>

//             <Box py={4}>
//               <Divider />
//             </Box>

//             <Box>
//               <Typography>Invoice Information</Typography>

//               <Stack direction={'row'} mt={4}>
//                 <Box>
//                   <Typography mt={1}>Invoice</Typography>
//                   <Typography mt={1}>Due Date</Typography>
//                   <Typography mt={1}>Description</Typography>
//                   <Typography mt={1}>Buyer Email</Typography>
//                   <Typography mt={1}>Metadata</Typography>
//                 </Box>
//                 <Box ml={6}>
//                   <Typography mt={1}>{order?.orderId ? order?.orderId : 'None'}</Typography>
//                   <Typography mt={1}>
//                     {order?.expirationDate ? new Date(Number(order?.expirationDate)).toLocaleString() : 'No due date'}
//                   </Typography>
//                   <Typography mt={1}>{order?.description ? order?.description : 'None'}</Typography>
//                   <Typography mt={1}>{order?.buyerEmail ? order?.buyerEmail : 'None'}</Typography>
//                   <Typography mt={1}>{order?.metadata ? order?.metadata : 'None'}</Typography>
//                 </Box>
//               </Stack>
//             </Box>

//             <Box py={4}>
//               <Divider />
//             </Box>

//             <Box>
//               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                 <Typography>Total Price</Typography>
//                 <Typography fontWeight={'bold'}>
//                   {order?.totalPrice} {order?.crypto}
//                 </Typography>
//               </Stack>
//               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                 <Typography>Total Fiat</Typography>
//                 <Typography fontWeight={'bold'}>
//                   {CURRENCY_SYMBOLS[String(order?.currency)]}
//                   {order?.amount}
//                 </Typography>
//               </Stack>
//               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                 <Typography>Exchange Rate</Typography>
//                 <Typography fontWeight={'bold'}>
//                   1 {order?.crypto} = {CURRENCY_SYMBOLS[String(order?.currency)]}
//                   {order?.rate}
//                 </Typography>
//               </Stack>
//               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                 <Typography>Amount Due</Typography>
//                 <Typography fontWeight={'bold'}>
//                   {order?.amountDue} {order?.crypto}
//                 </Typography>
//               </Stack>
//             </Box>

//             {order?.orderStatus === ORDER_STATUS.Settled && (
//               <>
//                 <Box py={4}>
//                   <Divider />
//                 </Box>
//                 <Box mt={2}>
//                   <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                     <Typography>Order Status</Typography>
//                     <Chip label={order?.orderStatus} color={'success'} variant={'filled'} />
//                   </Stack>
//                   <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                     <Typography>Hash</Typography>
//                     <Link
//                       target="_blank"
//                       href={GetBlockchainTxUrlByChainIds(
//                         order?.network === 1 ? true : false,
//                         order?.chainId,
//                         order?.hash,
//                       )}
//                     >
//                       {OmitMiddleString(order?.hash)}
//                     </Link>
//                   </Stack>
//                   <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                     <Typography>From Address</Typography>
//                     <Link
//                       target="_blank"
//                       href={GetBlockchainAddressUrlByChainIds(
//                         order?.network === 1 ? true : false,
//                         order?.chainId,
//                         order?.fromAddress,
//                       )}
//                     >
//                       {OmitMiddleString(order?.fromAddress)}
//                     </Link>
//                   </Stack>
//                   <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
//                     <Typography>To Address</Typography>
//                     <Link
//                       target="_blank"
//                       href={GetBlockchainAddressUrlByChainIds(
//                         order?.network === 1 ? true : false,
//                         order?.chainId,
//                         order?.toAddress,
//                       )}
//                     >
//                       {OmitMiddleString(order?.toAddress)}
//                     </Link>
//                   </Stack>
//                 </Box>
//               </>
//             )}

//             <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={10}>
//               <Stack direction={'row'} alignItems={'center'}>
//                 <Icon component={Lock} />
//                 <Typography ml={1}>Secured by</Typography>
//                 <Typography fontWeight={'bold'} ml={1}>
//                   CryptoPayServer
//                 </Typography>
//               </Stack>

//               <Stack direction={'row'} alignItems={'center'} gap={0.5}>
//                 <Link href={'#'} underline="hover" color={'#000'}>
//                   Terms
//                 </Link>
//                 <Typography>·</Typography>
//                 <Link href={'#'} underline="hover" color={'#000'}>
//                   Privacy
//                 </Link>
//               </Stack>
//             </Stack>
//           </Grid>

//           <Grid item xs={6} md={6} sm={6}>
//             <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//               <Typography>Payment Method</Typography>
//               <Button
//                 variant="outlined"
//                 startIcon={<WarningAmber />}
//                 onClick={() => {
//                   setOpenDialog(true);
//                 }}
//                 color={'warning'}
//               >
//                 Report
//               </Button>
//             </Stack>

//             <Box mt={2}>
//               <Typography mb={2}>Deposit currency</Typography>
//               <Stack direction={'row'} gap={1}>
//                 {order?.crypto && (
//                   <Button
//                     variant={crypto === order?.crypto ? 'contained' : 'outlined'}
//                     color={'success'}
//                     startIcon={
//                       <Image alt="crypto" width={20} height={20} src={GetImgSrcByCrypto(order?.crypto as COINS)} />
//                     }
//                     fullWidth
//                     onClick={onClickCrypto}
//                   >
//                     {order?.crypto}
//                   </Button>
//                 )}
//                 {order?.chainId === CHAINS.BITCOIN && order?.lightningInvoice && (
//                   <Button
//                     variant={crypto === COINS.BTC_LN ? 'contained' : 'outlined'}
//                     color={'success'}
//                     startIcon={<Image alt="crypto" width={20} height={20} src={GetImgSrcByCrypto(COINS.BTC_LN)} />}
//                     fullWidth
//                     onClick={onClickBtcLn}
//                   >
//                     {COINS.BTC_LN}
//                   </Button>
//                 )}
//               </Stack>

//               <Typography my={2}>Select network</Typography>
//               {order?.chainId && (
//                 <Button
//                   variant={'contained'}
//                   color={'success'}
//                   startIcon={
//                     <Image alt="chain" width={20} height={20} src={GetImgSrcByChain(order?.chainId as CHAINS)} />
//                   }
//                   fullWidth
//                 >
//                   {FindChainNamesByChains(order?.chainId)?.toUpperCase()}
//                 </Button>
//               )}
//             </Box>

//             <Box mt={2} textAlign={'center'}>
//               <Paper style={{ padding: 20 }}>
//                 <QRCodeSVG
//                   value={qrCode}
//                   width={'100%'}
//                   height={'100%'}
//                   imageSettings={{
//                     src: GetImgSrcByCrypto(crypto as COINS),
//                     width: 20,
//                     height: 20,
//                     excavate: true,
//                   }}
//                 />

//                 <Box mt={2}>
//                   <Button
//                     variant="outlined"
//                     fullWidth
//                     onClick={async () => {
//                       await navigator.clipboard.writeText(destinationAddress);

//                       setSnackMessage('Successfully copy');
//                       setSnackSeverity('success');
//                       setSnackOpen(true);
//                     }}
//                   >
//                     {OmitMiddleString(destinationAddress)}
//                   </Button>
//                 </Box>

//                 <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1} gap={2}>
//                   <Button
//                     variant={'contained'}
//                     startIcon={<ContentCopy />}
//                     fullWidth
//                     onClick={async () => {
//                       await navigator.clipboard.writeText(destinationAddress);

//                       setSnackMessage('Successfully copy');
//                       setSnackSeverity('success');
//                       setSnackOpen(true);
//                     }}
//                   >
//                     Copy Address
//                   </Button>

//                   {order?.orderStatus !== 'Settled' && crypto !== COINS.BTC_LN && (
//                     <WalletConnectButton
//                       color={'success'}
//                       network={Number(order?.network)}
//                       chainId={Number(order?.chainId)}
//                       address={String(order?.destinationAddress)}
//                       contractAddress={
//                         FindTokenByChainIdsAndSymbol(
//                           GetChainIds(order?.network === 1 ? true : false, Number(order?.chainId)),
//                           order?.crypto as COINS,
//                         )?.contractAddress
//                       }
//                       decimals={
//                         FindTokenByChainIdsAndSymbol(
//                           GetChainIds(order?.network === 1 ? true : false, Number(order?.chainId)),
//                           order?.crypto as COINS,
//                         )?.decimals
//                       }
//                       value={String(order?.totalPrice)}
//                       buttonSize={'medium'}
//                       buttonVariant={'contained'}
//                       fullWidth={true}
//                     />
//                   )}
//                 </Stack>
//               </Paper>
//             </Box>
//           </Grid>
//         </Grid>

//         <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
//         <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
//       </Container>
//     </Box>
//   );
// };

// export default InvoiceDetails;

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { AlertTriangle, Copy, HelpCircle, Lock, Store as StoreIcon } from 'lucide-react'

import { useSnackPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { OmitMiddleString } from '@/utils/strings'
import { CURRENCY_SYMBOLS, ORDER_STATUS, WALLET } from '@/packages/constants'
import { GetImgSrcByChain, GetImgSrcByCrypto } from '@/utils/qrcode'
import {
  FindChainNamesByChains,
  FindTokenByChainIdsAndSymbol,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
  GetChainIds,
} from '@/utils/web3'
import { CHAINS, COINS } from '@/packages/constants/blockchain'
import WalletConnectButton from '@/components/Button/WalletConnectButton'
import HelpDrawer from '@/components/Drawer/HelpDrawer'
import ReportPaymentDialog from '@/components/Dialog/ReportPaymentDialog'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type OrderType = {
  orderId: number
  amount: number
  buyerEmail: string
  crypto: string
  currency: string
  description: string
  destinationAddress: string
  metadata: string
  notificationEmail: string
  notificationUrl: string
  orderStatus: string
  paid: number
  paymentMethod: string
  createdDate: number
  expirationDate: number
  rate: number
  lightningInvoice: string
  lightningUrl: string
  totalPrice: string
  amountDue: string
  fromAddress: string
  toAddress: string
  hash: string
  blockTimestamp: number
  network: number
  chainId: number
  qrCodeText: string
  qrLightningCodeText: string
  storeName: string
  storeBrandColor: string
  storeLogoUrl: string
  storeWebsite: string
}

// 详情行组件,替代原来重复的 Stack + Typography 组合
const DetailRow = ({
  label,
  value,
  bold = false,
}: {
  label: string
  value: React.ReactNode
  bold?: boolean
}) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-muted-foreground">{label}</span>
    <span className={cn(bold && 'font-semibold')}>{value}</span>
  </div>
)

const InvoiceDetails = () => {
  const router = useRouter()
  const { id } = router.query

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)

  const [countdownVal, setCountdownVal] = useState<string>('0')
  const [openDrawer, setOpenDrawer] = useState(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const [order, setOrder] = useState<OrderType>()
  const [crypto, setCrypto] = useState<COINS>()
  const [qrCode, setQrCode] = useState<string>('')
  const [destinationAddress, setDestinationAddress] = useState<string>('')

  const init = async (id: any, order?: OrderType) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_id, {
        params: {
          id: id,
        },
      })

      if (response.result) {
        setOrder({
          orderId: response.data.order_id,
          amount: response.data.amount,
          buyerEmail: response.data.buyer_email,
          crypto: response.data.crypto,
          currency: response.data.currency,
          description: response.data.description,
          destinationAddress: response.data.destination_address,
          metadata: response.data.metadata,
          notificationEmail: response.data.notification_email,
          notificationUrl: response.data.notification_url,
          orderStatus: response.data.order_status,
          paid: response.data.paid,
          paymentMethod: response.data.payment_method,
          createdDate: new Date(response.data.created_at).getTime(),
          expirationDate: new Date(response.data.expiration_at).getTime(),
          rate: response.data.rate,
          lightningInvoice: response.data.lightning_invoice,
          lightningUrl: response.data.lightning_url,
          totalPrice: response.data.crypto_amount,
          amountDue: response.data.crypto_amount,
          fromAddress: response.data.from_address,
          toAddress: response.data.to_address,
          hash: response.data.hash,
          blockTimestamp: Number(response.data.block_timestamp),
          network: response.data.network,
          chainId: response.data.chain_id,
          qrCodeText: response.data.qr_code_text,
          qrLightningCodeText: response.data.qr_lightning_code_text,
          storeName: response.data.store_name,
          storeBrandColor: response.data.store_brand_color,
          storeLogoUrl: response.data.store_logo_url,
          storeWebsite: response.data.store_website,
        })

        if (order === undefined) {
          setCrypto(response.data.crypto)
          setQrCode(response.data.qr_code_text)
          setDestinationAddress(response.data.destination_address)
        }
      } else {
        setSnackSeverity('error')
        setSnackMessage('Can not find the invoice!')
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
    if (id) {
      const activeInit = setInterval(async () => {
        await init(id, order as OrderType)
      }, 10 * 1000)

      return () => clearInterval(activeInit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, order])

  useEffect(() => {
    if (id) {
      init(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const countDownTime = () => {
    if (!order?.expirationDate || order?.expirationDate <= 0) {
      return
    }

    const currentTime = Date.now()
    const remainingTime = order?.expirationDate - currentTime

    if (remainingTime <= 0) {
      return
    }

    const seconds = Math.floor((remainingTime / 1000) % 60)
    const minutes = Math.floor((remainingTime / 1000 / 60) % 60)
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    setCountdownVal(formattedTime)
  }

  useEffect(() => {
    const activeCountDownTime = setInterval(() => {
      countDownTime()
    }, 1000)

    return () => clearInterval(activeCountDownTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.expirationDate])

  const onClickCrypto = () => {
    setCrypto(order?.crypto as COINS)
    setQrCode(String(order?.qrCodeText))
    setDestinationAddress(String(order?.destinationAddress))
  }

  const onClickBtcLn = () => {
    setCrypto(COINS.BTC_LN)
    setQrCode(String(order?.qrLightningCodeText))
    setDestinationAddress(String(order?.lightningInvoice))
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setSnackMessage('Successfully copy')
    setSnackSeverity('success')
    setSnackOpen(true)
  }

  return (
    <div className="mt-4">
      <div className="mx-auto max-w-screen-xl px-4">
        {order?.network === 2 && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <AlertTriangle className="h-4 w-4 !text-amber-600" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription className="text-amber-800">
              This is a test network, and the currency has no real value. If you need free coins,
              you can get them{' '}
              <Link
                href="/freecoin"
                target="_blank"
                className="font-medium underline underline-offset-2"
              >
                here.
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {order?.orderStatus === ORDER_STATUS.Settled && (
          <Alert className="mb-4 border-transparent bg-green-600 text-white [&_svg]:text-white">
            <AlertDescription>The order has been paid successfully</AlertDescription>
          </Alert>
        )}

        {order?.orderStatus === ORDER_STATUS.Expired && (
          <Alert className="mb-4 border-transparent bg-amber-500 text-white [&_svg]:text-white">
            <AlertDescription>
              The order has expired, please do not continue to pay
            </AlertDescription>
          </Alert>
        )}

        {order?.orderStatus === ORDER_STATUS.Invalid && (
          <Alert
            variant="destructive"
            className="mb-4 border-transparent bg-red-600 text-white [&_svg]:text-white"
          >
            <AlertDescription>
              The order has invalid, please do not continue to pay
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
          {/* 左栏:发票信息 */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {order?.storeLogoUrl ? (
                  <Image alt="logo" src={order.storeLogoUrl} width={100} height={40} />
                ) : (
                  <StoreIcon className="h-5 w-5 text-muted-foreground" />
                )}
                <Link href={String(order?.storeWebsite)} className="hover:underline">
                  {order?.storeName}
                </Link>
                {order?.network === 2 && (
                  <Badge className="border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100">
                    TestMode
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {countdownVal !== '0' && (
                  <span className="mx-1 text-sm tabular-nums text-muted-foreground">
                    {countdownVal}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="help"
                  onClick={() => setOpenDrawer(true)}
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{order?.totalPrice}</span>
              <span className="text-3xl font-bold">{order?.crypto}</span>
            </div>

            <Separator className="my-8" />

            <div>
              <p className="font-medium">Invoice Information</p>
              <div className="mt-4 space-y-1">
                <DetailRow label="Invoice" value={order?.orderId ? order.orderId : 'None'} />
                <DetailRow
                  label="Due Date"
                  value={
                    order?.expirationDate
                      ? new Date(Number(order.expirationDate)).toLocaleString()
                      : 'No due date'
                  }
                />
                <DetailRow
                  label="Description"
                  value={order?.description ? order.description : 'None'}
                />
                <DetailRow
                  label="Buyer Email"
                  value={order?.buyerEmail ? order.buyerEmail : 'None'}
                />
                <DetailRow label="Metadata" value={order?.metadata ? order.metadata : 'None'} />
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-1">
              <DetailRow label="Total Price" value={`${order?.totalPrice} ${order?.crypto}`} bold />
              <DetailRow
                label="Total Fiat"
                value={`${CURRENCY_SYMBOLS[String(order?.currency)]}${order?.amount}`}
                bold
              />
              <DetailRow
                label="Exchange Rate"
                value={`1 ${order?.crypto} = ${CURRENCY_SYMBOLS[String(order?.currency)]}${order?.rate}`}
                bold
              />
              <DetailRow label="Amount Due" value={`${order?.amountDue} ${order?.crypto}`} bold />
            </div>

            {order?.orderStatus === ORDER_STATUS.Settled && (
              <>
                <Separator className="my-8" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Order Status</span>
                    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                      {order?.orderStatus}
                    </Badge>
                  </div>
                  <DetailRow
                    label="Hash"
                    value={
                      <Link
                        target="_blank"
                        href={GetBlockchainTxUrlByChainIds(
                          order?.network === 1,
                          order?.chainId,
                          order?.hash
                        )}
                        className="text-primary hover:underline"
                      >
                        {OmitMiddleString(order?.hash)}
                      </Link>
                    }
                  />
                  <DetailRow
                    label="From Address"
                    value={
                      <Link
                        target="_blank"
                        href={GetBlockchainAddressUrlByChainIds(
                          order?.network === 1,
                          order?.chainId,
                          order?.fromAddress
                        )}
                        className="text-primary hover:underline"
                      >
                        {OmitMiddleString(order?.fromAddress)}
                      </Link>
                    }
                  />
                  <DetailRow
                    label="To Address"
                    value={
                      <Link
                        target="_blank"
                        href={GetBlockchainAddressUrlByChainIds(
                          order?.network === 1,
                          order?.chainId,
                          order?.toAddress
                        )}
                        className="text-primary hover:underline"
                      >
                        {OmitMiddleString(order?.toAddress)}
                      </Link>
                    }
                  />
                </div>
              </>
            )}

            <div className="mt-16 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Secured by</span>
                <span className="font-semibold text-foreground">CryptoPayServer</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm">
                <Link href="#" className="hover:underline">
                  Terms
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link href="#" className="hover:underline">
                  Privacy
                </Link>
              </div>
            </div>
          </div>

          {/* 右栏:支付方式 */}
          <div>
            <div className="flex items-center justify-between">
              <p className="font-medium">Payment Method</p>
              <Button
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                onClick={() => setOpenDialog(true)}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report
              </Button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-muted-foreground">Deposit currency</p>
              <div className="flex gap-2">
                {order?.crypto && (
                  <Button
                    variant={crypto === order.crypto ? 'default' : 'outline'}
                    className={cn(
                      'w-full',
                      crypto === order.crypto
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'border-green-600 text-green-700 hover:bg-green-50'
                    )}
                    onClick={onClickCrypto}
                  >
                    <Image
                      alt="crypto"
                      width={20}
                      height={20}
                      src={GetImgSrcByCrypto(order.crypto as COINS)}
                      className="mr-2"
                    />
                    {order.crypto}
                  </Button>
                )}
                {order?.chainId === CHAINS.BITCOIN && order?.lightningInvoice && (
                  <Button
                    variant={crypto === COINS.BTC_LN ? 'default' : 'outline'}
                    className={cn(
                      'w-full',
                      crypto === COINS.BTC_LN
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'border-green-600 text-green-700 hover:bg-green-50'
                    )}
                    onClick={onClickBtcLn}
                  >
                    <Image
                      alt="crypto"
                      width={20}
                      height={20}
                      src={GetImgSrcByCrypto(COINS.BTC_LN)}
                      className="mr-2"
                    />
                    {COINS.BTC_LN}
                  </Button>
                )}
              </div>

              <p className="my-2 text-muted-foreground">Select network</p>
              {order?.chainId && (
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Image
                    alt="chain"
                    width={20}
                    height={20}
                    src={GetImgSrcByChain(order.chainId as CHAINS)}
                    className="mr-2"
                  />
                  {FindChainNamesByChains(order.chainId)?.toUpperCase()}
                </Button>
              )}
            </div>

            <div className="mt-4">
              <Card className="p-5 text-center">
                <QRCodeSVG
                  value={qrCode}
                  width="100%"
                  height="100%"
                  imageSettings={{
                    src: GetImgSrcByCrypto(crypto as COINS),
                    width: 20,
                    height: 20,
                    excavate: true,
                  }}
                />

                <Button
                  variant="outline"
                  className="mt-4 w-full font-mono text-sm"
                  onClick={() => copyToClipboard(destinationAddress)}
                >
                  {OmitMiddleString(destinationAddress)}
                </Button>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <Button className="w-full" onClick={() => copyToClipboard(destinationAddress)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </Button>

                  {order?.orderStatus !== 'Settled' && crypto !== COINS.BTC_LN && (
                    <WalletConnectButton
                      // color={'success'}
                      network={Number(order?.network)}
                      chainId={Number(order?.chainId)}
                      address={String(order?.destinationAddress)}
                      contractAddress={
                        FindTokenByChainIdsAndSymbol(
                          GetChainIds(order?.network === 1, Number(order?.chainId)),
                          order?.crypto as COINS
                        )?.contractAddress
                      }
                      decimals={
                        FindTokenByChainIdsAndSymbol(
                          GetChainIds(order?.network === 1, Number(order?.chainId)),
                          order?.crypto as COINS
                        )?.decimals
                      }
                      value={String(order?.totalPrice)}
                      buttonSize={'default'}
                      buttonVariant={'default'}
                      fullWidth={true}
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
      </div>
    </div>
  )
}

export default InvoiceDetails
