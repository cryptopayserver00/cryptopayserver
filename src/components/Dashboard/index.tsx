// import {
//   Alert,
//   AlertTitle,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Container,
//   Grid,
//   Link,
//   Stack,
//   Typography,
// } from '@mui/material';
// import StoreData from './StoreData';
// import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { PAYOUT_STATUS } from '@/packages/constants';
// import TransactionDataGrid from '@/components/DataList/TransactionDataGrid';
// import InvoiceDataGrid from '@/components/DataList/InvoiceDataGrid';
// import PayoutDataGrid from '@/components/DataList/PayoutDataGrid';
// import TokenDataGrid from '@/components/DataList/TokenDataGrid';

// const Dashboard = () => {
//   const [enablePasswordWarn, setEnablePasswordWarn] = useState<boolean>(false);
//   const [enableBackupWarn, setEnableBackupWarn] = useState<boolean>(false);

//   const { getStoreName } = useStorePresistStore((state) => state);
//   const { getNetwork } = useUserPresistStore((state) => state);
//   const { getWalletId } = useWalletPresistStore((state) => state);

//   const init = async () => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_by_id, {
//         params: {
//           id: getWalletId(),
//         },
//       });

//       if (response.result && !response.data.password) {
//         setEnablePasswordWarn(true);
//       } else {
//         setEnablePasswordWarn(false);
//       }

//       if (response.result && response.data.is_backup === 2) {
//         setEnableBackupWarn(true);
//       } else {
//         setEnableBackupWarn(false);
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       {enablePasswordWarn && (
//         <Box mb={1}>
//           <Alert severity="warning">
//             <AlertTitle>Warning</AlertTitle>
//             <Typography>
//               You don&apos;t have to setup the wallet password. Please click&nbsp;
//               <Link href={'/wallet/setPassword'}>here</Link>
//               &nbsp;to setup.
//             </Typography>
//           </Alert>
//         </Box>
//       )}

//       {enableBackupWarn && (
//         <Box mb={1}>
//           <Alert severity="warning">
//             <AlertTitle>Warning</AlertTitle>
//             <Typography>
//               You don&apos;t have to backup your wallet mnemonic phrase. Please click&nbsp;
//               <Link href={'/wallet/phrase/intro'}>here</Link>
//               &nbsp;to recording.
//             </Typography>
//           </Alert>
//         </Box>
//       )}

//       <Container>
//         <Box my={2}>
//           <Chip size={'medium'} variant={'outlined'} label={getStoreName()} />
//         </Box>
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <Card variant="outlined">
//               <CardContent>
//                 <StoreData />
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid item xs={12}>
//             <Card variant="outlined">
//               <CardContent>
//                 <TokenDataGrid source="dashboard" />
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* <Grid item xs={12}>
//             <Card variant="outlined">
//               <CardContent>
//                 <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                   <Typography variant="h5">Recent Transactions</Typography>
//                   <Button
//                     onClick={() => {
//                       window.location.href = '/payments/transactions';
//                     }}
//                     variant="contained"
//                   >
//                     View All
//                   </Button>
//                 </Stack>

//                 <Box mt={3}>
//                   <TransactionDataGrid source="dashboard" network={getNetwork()} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid> */}

//           <Grid item xs={12}>
//             <Card variant="outlined">
//               <CardContent>
//                 <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                   <Typography variant="h5">Recent Invoices</Typography>
//                   <Button
//                     onClick={() => {
//                       window.location.href = '/payments/invoices';
//                     }}
//                     variant="contained"
//                   >
//                     View All
//                   </Button>
//                 </Stack>

//                 <Box mt={3}>
//                   <InvoiceDataGrid source="dashboard" />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid item xs={12}>
//             <Card variant="outlined">
//               <CardContent>
//                 <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                   <Typography variant="h5">Recent Payouts</Typography>
//                   <Button
//                     onClick={() => {
//                       window.location.href = '/payments/payouts';
//                     }}
//                     variant="contained"
//                   >
//                     View All
//                   </Button>
//                 </Stack>

//                 <Box mt={3}>
//                   <PayoutDataGrid status={PAYOUT_STATUS.AwaitingPayment} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default Dashboard;

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import StoreData from './StoreData'
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { PAYOUT_STATUS } from '@/packages/constants'
import InvoiceDataGrid from '@/components/DataList/InvoiceDataGrid'
import PayoutDataGrid from '@/components/DataList/PayoutDataGrid'
import TokenDataGrid from '@/components/DataList/TokenDataGrid'

const Dashboard = () => {
  const [enablePasswordWarn, setEnablePasswordWarn] = useState(false)
  const [enableBackupWarn, setEnableBackupWarn] = useState(false)

  const { getStoreName } = useStorePresistStore((state) => state)
  const { getWalletId } = useWalletPresistStore((state) => state)

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: getWalletId(),
        },
      })

      if (response.result && !response.data.password) {
        setEnablePasswordWarn(true)
      } else {
        setEnablePasswordWarn(false)
      }

      if (response.result && response.data.is_backup === 2) {
        setEnableBackupWarn(true)
      } else {
        setEnableBackupWarn(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {enablePasswordWarn && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You don&apos;t have to setup the wallet password. Please click{' '}
            <Link href="/wallet/setPassword" className="font-medium underline underline-offset-4">
              here
            </Link>{' '}
            to setup.
          </AlertDescription>
        </Alert>
      )}

      {enableBackupWarn && (
        <Alert
          variant="default"
          className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You don&apos;t have to backup your wallet mnemonic phrase. Please click{' '}
            <Link href="/wallet/phrase/intro" className="font-medium underline underline-offset-4">
              here
            </Link>{' '}
            to recording.
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        {/* Store name */}
        <div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            {getStoreName()}
          </Badge>
        </div>

        {/* Store Data */}
        <Card>
          <CardContent className="pt-6">
            <StoreData />
          </CardContent>
        </Card>

        {/* Tokens */}
        <Card>
          <CardContent className="pt-6">
            <TokenDataGrid source="dashboard" />
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                window.location.href = '/payments/invoices'
              }}
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <InvoiceDataGrid source="dashboard" />
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Recent Payouts</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                window.location.href = '/payments/payouts'
              }}
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <PayoutDataGrid status={PAYOUT_STATUS.AwaitingPayment} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
