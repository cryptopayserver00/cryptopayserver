// import { Box, Button, Container, Divider, Grid, IconButton, List, ListItem, Stack, Typography } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { useRouter } from 'next/router';
// import { CURRENCY_SYMBOLS, ORDER_STATUS } from '@/packages/constants';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { InvoiceEventDataTab } from '../../DataList/InvoiceEventDataTab';
// import { FindChainNamesByChains, GetBlockchainAddressUrlByChainIds, GetBlockchainTxUrlByChainIds } from '@/utils/web3';
// import Link from 'next/link';
// import { CHAINS } from '@/packages/constants/blockchain';
// import { OmitMiddleString } from '@/utils/strings';
// import Image from 'next/image';
// import { GetImgSrcByChain } from '@/utils/qrcode';
// import { ContentCopy } from '@mui/icons-material';

// type OrderType = {
//   orderId: number;
//   sourceType: string;
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
// };

// const PaymentInvoiceDetails = () => {
//   const router = useRouter();
//   const { id } = router.query;

//   const { getStoreName } = useStorePresistStore((state) => state);
//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const [order, setOrder] = useState<OrderType>({
//     orderId: 0,
//     sourceType: '',
//     amount: 0,
//     buyerEmail: '',
//     crypto: '',
//     currency: '',
//     description: '',
//     destinationAddress: '',
//     metadata: '',
//     notificationEmail: '',
//     notificationUrl: '',
//     orderStatus: '',
//     paid: 0,
//     paymentMethod: '',
//     createdDate: 0,
//     expirationDate: 0,
//     rate: 0,
//     lightningInvoice: '',
//     lightningUrl: '',
//     totalPrice: '0',
//     amountDue: '0',
//     fromAddress: '',
//     toAddress: '',
//     hash: '',
//     blockTimestamp: 0,
//     network: 0,
//     chainId: 0,
//   });

//   const init = async (id: any) => {
//     try {
//       const response: any = await axios.get(Http.find_invoice_by_id, {
//         params: {
//           id: id,
//         },
//       });

//       if (response.result) {
//         setOrder({
//           orderId: response.data.order_id,
//           sourceType: response.data.source_type,
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
//           createdDate: response.data.created_at,
//           expirationDate: response.data.expiration_at,
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
//         });
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
//     id && init(id);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const onClickArchive = async () => {
//     try {
//       const response: any = await axios.put(Http.update_invoice_order_status_by_order_id, {
//         order_id: order.orderId,
//         order_status: ORDER_STATUS.Invalid,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful update!');
//         setSnackOpen(true);

//         window.location.reload();
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
//   };

//   return (
//     <Box>
//       <Container>
//         <Stack direction={'row'} alignItems={'center'} mt={4}>
//           <Typography variant={'h5'} fontWeight={'bold'}>
//             Invoice
//           </Typography>
//           <Typography variant={'h5'} fontWeight={'bold'} ml={1}>
//             {order.orderId}
//           </Typography>
//         </Stack>

//         <Stack direction={'row'} alignItems={'center'} mt={4}>
//           <Button
//             color="success"
//             variant={'contained'}
//             onClick={() => {
//               window.location.href = '/invoices/' + order.orderId;
//             }}
//           >
//             Checkout
//           </Button>
//           {order.orderStatus !== ORDER_STATUS.Invalid && (
//             <Button color="error" variant={'contained'} onClick={onClickArchive} style={{ marginLeft: 20 }}>
//               Archive
//             </Button>
//           )}
//         </Stack>

//         <Box mt={4}>
//           <Typography variant="h5" fontWeight={'bold'}>
//             General Information
//           </Typography>
//           <List style={{ marginTop: 10 }}>
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Store</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>{getStoreName()}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Order Id</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography fontWeight={'bold'}>{order.orderId}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Source Type</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>{order.sourceType}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>State</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography
//                     fontWeight={'bold'}
//                     color={
//                       order.orderStatus === ORDER_STATUS.Expired
//                         ? 'red'
//                         : order.orderStatus === ORDER_STATUS.Settled
//                         ? 'green'
//                         : order.orderStatus === ORDER_STATUS.Processing
//                         ? 'blue'
//                         : order.orderStatus === ORDER_STATUS.Invalid
//                         ? 'red'
//                         : ''
//                     }
//                   >
//                     {order.orderStatus}
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Created Date</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>{new Date(order.createdDate).toLocaleString()}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Expiration Date</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>{new Date(order.expirationDate).toLocaleString()}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Total Amount Due</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>
//                     {CURRENCY_SYMBOLS[order.currency]}
//                     {order.amount}
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Refund Email</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>{order.buyerEmail}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//           </List>
//         </Box>

//         <Box mt={4}>
//           <Typography variant="h5" fontWeight={'bold'}>
//             Product Information
//           </Typography>

//           <List style={{ marginTop: 10 }}>
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Item Description</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>{order.description}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//           </List>
//         </Box>

//         <Box mt={4}>
//           <Typography variant="h5" fontWeight={'bold'}>
//             Buyer Information
//           </Typography>

//           <List style={{ marginTop: 10 }}>
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Email</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>{order.buyerEmail}</Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//           </List>
//         </Box>

//         <Box mt={4}>
//           <Typography variant="h5" fontWeight={'bold'}>
//             Invoice Summary
//           </Typography>

//           <List style={{ marginTop: 10 }}>
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Chain</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Stack direction={'row'} alignItems={'center'} gap={1}>
//                     {order.chainId && <Image alt="icon" width={30} height={30} src={GetImgSrcByChain(order.chainId)} />}
//                     <Typography>{FindChainNamesByChains(order.chainId)?.toUpperCase()}</Typography>
//                   </Stack>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Destination</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Stack direction={'row'} gap={1} alignItems={'center'}>
//                     <Typography fontWeight={'bold'}>{order.destinationAddress}</Typography>
//                     <IconButton
//                       size="small"
//                       onClick={async () => {
//                         await navigator.clipboard.writeText(String(order?.destinationAddress));

//                         setSnackMessage('Successfully copy');
//                         setSnackSeverity('success');
//                         setSnackOpen(true);
//                       }}
//                     >
//                       <ContentCopy fontSize={'small'} />
//                     </IconButton>
//                   </Stack>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             {order.chainId === CHAINS.BITCOIN && (
//               <>
//                 <ListItem>
//                   <Grid container>
//                     <Grid item xs={3}>
//                       <Typography>Lightning invoice</Typography>
//                     </Grid>
//                     <Grid item xs={9}>
//                       {order.lightningInvoice && (
//                         <Stack direction={'row'} gap={1}>
//                           <Typography fontWeight={'bold'}>{OmitMiddleString(order.lightningInvoice)}</Typography>
//                           <IconButton
//                             size="small"
//                             onClick={async () => {
//                               await navigator.clipboard.writeText(String(order?.lightningInvoice));

//                               setSnackMessage('Successfully copy');
//                               setSnackSeverity('success');
//                               setSnackOpen(true);
//                             }}
//                           >
//                             <ContentCopy fontSize={'small'} />
//                           </IconButton>
//                         </Stack>
//                       )}
//                     </Grid>
//                   </Grid>
//                 </ListItem>
//                 {order.lightningUrl && (
//                   <>
//                     <Divider />
//                     <ListItem>
//                       <Grid container>
//                         <Grid item xs={3}>
//                           <Typography>Lightning url</Typography>
//                         </Grid>
//                         <Grid item xs={9}>
//                           {order.lightningUrl && (
//                             <Stack direction={'row'} gap={1}>
//                               <Typography fontWeight={'bold'}>{OmitMiddleString(order.lightningUrl)}</Typography>
//                               <IconButton
//                                 size="small"
//                                 onClick={async () => {
//                                   await navigator.clipboard.writeText(String(order?.lightningUrl));

//                                   setSnackMessage('Successfully copy');
//                                   setSnackSeverity('success');
//                                   setSnackOpen(true);
//                                 }}
//                               >
//                                 <ContentCopy fontSize={'small'} />
//                               </IconButton>
//                             </Stack>
//                           )}
//                         </Grid>
//                       </Grid>
//                     </ListItem>
//                   </>
//                 )}
//               </>
//             )}
//             {order.paymentMethod && (
//               <>
//                 <Divider />
//                 <ListItem>
//                   <Grid container>
//                     <Grid item xs={3}>
//                       <Typography>Payment method</Typography>
//                     </Grid>
//                     <Grid item xs={9}>
//                       <Typography>{order.paymentMethod}</Typography>
//                     </Grid>
//                   </Grid>
//                 </ListItem>
//                 <Divider />
//                 <ListItem>
//                   <Grid container>
//                     <Grid item xs={3}>
//                       <Typography>Rate</Typography>
//                     </Grid>
//                     <Grid item xs={9}>
//                       <Typography>
//                         {CURRENCY_SYMBOLS[order.currency]}
//                         {order.rate}
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </ListItem>
//               </>
//             )}
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Total due</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography>
//                     {order.amountDue} {order.crypto}
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             <Divider />
//             <ListItem>
//               <Grid container>
//                 <Grid item xs={3}>
//                   <Typography>Paid</Typography>
//                 </Grid>
//                 <Grid item xs={9}>
//                   <Typography fontWeight={'bold'} color={order.paid === 1 ? 'green' : 'red'}>
//                     {order.paid === 1 ? 'True' : 'False'}
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </ListItem>
//             {order.orderStatus === ORDER_STATUS.Settled && (
//               <>
//                 {order.hash && (
//                   <>
//                     <Divider />
//                     <ListItem>
//                       <Grid container>
//                         <Grid item xs={3}>
//                           <Typography>Hash</Typography>
//                         </Grid>
//                         <Grid item xs={9}>
//                           <Link
//                             target="_blank"
//                             href={GetBlockchainTxUrlByChainIds(
//                               order.network === 1 ? true : false,
//                               order.chainId,
//                               order.hash,
//                             )}
//                           >
//                             {order.hash}
//                           </Link>
//                         </Grid>
//                       </Grid>
//                     </ListItem>
//                   </>
//                 )}
//                 {order.fromAddress && (
//                   <>
//                     <Divider />
//                     <ListItem>
//                       <Grid container>
//                         <Grid item xs={3}>
//                           <Typography>From Address</Typography>
//                         </Grid>
//                         <Grid item xs={9}>
//                           <Link
//                             target="_blank"
//                             href={GetBlockchainAddressUrlByChainIds(
//                               order.network === 1 ? true : false,
//                               order.chainId,
//                               order.fromAddress,
//                             )}
//                           >
//                             {order.fromAddress}
//                           </Link>
//                         </Grid>
//                       </Grid>
//                     </ListItem>
//                   </>
//                 )}
//                 {order.toAddress && (
//                   <>
//                     <Divider />
//                     <ListItem>
//                       <Grid container>
//                         <Grid item xs={3}>
//                           <Typography>To Address</Typography>
//                         </Grid>
//                         <Grid item xs={9}>
//                           <Link
//                             target="_blank"
//                             href={GetBlockchainAddressUrlByChainIds(
//                               order.network === 1 ? true : false,
//                               order.chainId,
//                               order.toAddress,
//                             )}
//                           >
//                             {order.toAddress}
//                           </Link>
//                         </Grid>
//                       </Grid>
//                     </ListItem>
//                   </>
//                 )}
//                 {order.blockTimestamp && (
//                   <>
//                     <Divider />
//                     <ListItem>
//                       <Grid container>
//                         <Grid item xs={3}>
//                           <Typography>Block Timestamp</Typography>
//                         </Grid>
//                         <Grid item xs={9}>
//                           <Typography>{new Date(order.blockTimestamp).toLocaleString()}</Typography>
//                         </Grid>
//                       </Grid>
//                     </ListItem>
//                   </>
//                 )}
//               </>
//             )}
//           </List>
//         </Box>

//         <Box mt={4}>
//           <Typography variant="h5" fontWeight={'bold'}>
//             Events
//           </Typography>

//           <Box mt={4}>
//             <InvoiceEventDataTab orderId={order.orderId} />
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default PaymentInvoiceDetails;

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { Copy, ExternalLink, ArrowUpRight, Archive, CreditCard } from 'lucide-react'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { useSnackPresistStore, useStorePresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS, ORDER_STATUS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { InvoiceEventDataTab } from '../../DataList/InvoiceEventDataTab'
import {
  FindChainNamesByChains,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
} from '@/utils/web3'
import { CHAINS } from '@/packages/constants/blockchain'
import { OmitMiddleString } from '@/utils/strings'
import { GetImgSrcByChain } from '@/utils/qrcode'
import { useShallow } from 'zustand/react/shallow'

type OrderType = {
  orderId: number
  sourceType: string
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
}

const PaymentInvoiceDetails = () => {
  const router = useRouter()
  const { id } = router.query

  const { storeName } = useStorePresistStore(
    useShallow((state) => ({
      storeName: state.storeName,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const [order, setOrder] = useState<OrderType>({
    orderId: 0,
    sourceType: '',
    amount: 0,
    buyerEmail: '',
    crypto: '',
    currency: '',
    description: '',
    destinationAddress: '',
    metadata: '',
    notificationEmail: '',
    notificationUrl: '',
    orderStatus: '',
    paid: 0,
    paymentMethod: '',
    createdDate: 0,
    expirationDate: 0,
    rate: 0,
    lightningInvoice: '',
    lightningUrl: '',
    totalPrice: '0',
    amountDue: '0',
    fromAddress: '',
    toAddress: '',
    hash: '',
    blockTimestamp: 0,
    network: 0,
    chainId: 0,
  })

  const init = async (id: any) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_id, {
        params: { id },
      })

      if (response.result) {
        setOrder({
          orderId: response.data.order_id,
          sourceType: response.data.source_type,
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
          createdDate: response.data.created_at,
          expirationDate: response.data.expiration_at,
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
        })
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
    id && init(id)
  }, [id])

  const onClickArchive = async () => {
    try {
      const response: any = await axios.put(Http.update_invoice_order_status_by_order_id, {
        order_id: order.orderId,
        order_status: ORDER_STATUS.Invalid,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful update!')
        setSnackOpen(true)

        window.location.reload()
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
    }
  }

  const copyToClipboard = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setSnackMessage('Successfully copied to clipboard')
    setSnackSeverity('success')
    setSnackOpen(true)
  }

  // 根据订单状态渲染 Shadcn Badge 样式
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case ORDER_STATUS.Settled:
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
            Settled
          </Badge>
        )
      case ORDER_STATUS.Processing:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">
            Processing
          </Badge>
        )
      case ORDER_STATUS.Expired:
      case ORDER_STATUS.Invalid:
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* 顶部 Header 和操作区域 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoice</h1>
            <span className="text-2xl font-semibold text-muted-foreground">#{order.orderId}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Store: <span className="font-medium text-foreground">{storeName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            onClick={() => {
              window.location.href = '/invoices/' + order.orderId
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Checkout
          </Button>

          {order.orderStatus !== ORDER_STATUS.Invalid && (
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={onClickArchive}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要内容：基本信息与买家/商品信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">General Information</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 text-sm">
              <DetailRow label="Store" value={storeName} />
              <DetailRow
                label="Order ID"
                value={<span className="font-mono font-medium">{order.orderId}</span>}
              />
              <DetailRow label="Source Type" value={order.sourceType} />
              <DetailRow label="State" value={renderStatusBadge(order.orderStatus)} />
              <DetailRow
                label="Created Date"
                value={order.createdDate ? new Date(order.createdDate).toLocaleString() : '-'}
              />
              <DetailRow
                label="Expiration Date"
                value={order.expirationDate ? new Date(order.expirationDate).toLocaleString() : '-'}
              />
              <DetailRow
                label="Total Amount Due"
                value={
                  <span className="font-semibold text-base">
                    {CURRENCY_SYMBOLS[order.currency]}
                    {order.amount}
                  </span>
                }
              />
              <DetailRow label="Refund Email" value={order.buyerEmail || '-'} />
            </CardContent>
          </Card>

          {/* Product & Buyer Information Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <DetailRow
                  label="Item Description"
                  value={order.description || 'No description provided'}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Buyer Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <DetailRow label="Email" value={order.buyerEmail || '-'} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 右侧卡片：Invoice Summary / Web3 & 支付结算详情 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader className="pb-3 bg-muted/20">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                Invoice Summary
                {order.chainId && (
                  <div className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-md border">
                    <Image
                      alt="chain icon"
                      width={18}
                      height={18}
                      src={GetImgSrcByChain(order.chainId)}
                      className="rounded-full"
                    />
                    <span>{FindChainNamesByChains(order.chainId)?.toUpperCase()}</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/60 text-sm pt-2">
              <DetailRow
                label="Destination"
                value={
                  order.destinationAddress ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs break-all">
                        {OmitMiddleString(order.destinationAddress)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(order.destinationAddress)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    '-'
                  )
                }
              />

              {order.chainId === CHAINS.BITCOIN && (
                <>
                  {order.lightningInvoice && (
                    <DetailRow
                      label="Lightning Invoice"
                      value={
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">
                            {OmitMiddleString(order.lightningInvoice)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(order.lightningInvoice)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      }
                    />
                  )}
                  {order.lightningUrl && (
                    <DetailRow
                      label="Lightning URL"
                      value={
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs">
                            {OmitMiddleString(order.lightningUrl)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => copyToClipboard(order.lightningUrl)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      }
                    />
                  )}
                </>
              )}

              {order.paymentMethod && (
                <DetailRow label="Payment Method" value={order.paymentMethod} />
              )}

              <DetailRow
                label="Rate"
                value={`${CURRENCY_SYMBOLS[order.currency] || ''}${order.rate}`}
              />

              <DetailRow
                label="Total Due"
                value={
                  <span className="font-bold text-foreground">
                    {order.amountDue} {order.crypto}
                  </span>
                }
              />

              <DetailRow
                label="Paid"
                value={
                  order.paid === 1 ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                      True
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-muted-foreground">
                      False
                    </Badge>
                  )
                }
              />

              {/* Settled 结算状态下显示的链上详细信息 */}
              {order.orderStatus === ORDER_STATUS.Settled && (
                <>
                  {order.hash && (
                    <DetailRow
                      label="Hash"
                      value={
                        <Link
                          target="_blank"
                          href={GetBlockchainTxUrlByChainIds(
                            order.network === 1,
                            order.chainId,
                            order.hash
                          )}
                          className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {OmitMiddleString(order.hash)}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      }
                    />
                  )}
                  {order.fromAddress && (
                    <DetailRow
                      label="From Address"
                      value={
                        <Link
                          target="_blank"
                          href={GetBlockchainAddressUrlByChainIds(
                            order.network === 1,
                            order.chainId,
                            order.fromAddress
                          )}
                          className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {OmitMiddleString(order.fromAddress)}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      }
                    />
                  )}
                  {order.toAddress && (
                    <DetailRow
                      label="To Address"
                      value={
                        <Link
                          target="_blank"
                          href={GetBlockchainAddressUrlByChainIds(
                            order.network === 1,
                            order.chainId,
                            order.toAddress
                          )}
                          className="text-xs font-mono text-primary hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {OmitMiddleString(order.toAddress)}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      }
                    />
                  )}
                  {order.blockTimestamp ? (
                    <DetailRow
                      label="Block Timestamp"
                      value={new Date(order.blockTimestamp).toLocaleString()}
                    />
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 底部：事件列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Events</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceEventDataTab orderId={order.orderId} />
        </CardContent>
      </Card>
    </div>
  )
}

// 内部封装的高频行组件，优化排版复用
const DetailRow = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => {
  return (
    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
      <span className="text-muted-foreground text-xs sm:text-sm font-medium shrink-0">{label}</span>
      <div className="text-foreground text-sm text-left sm:text-right font-normal">
        {value || '-'}
      </div>
    </div>
  )
}

export default PaymentInvoiceDetails
