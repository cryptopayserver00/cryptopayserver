// import {
//   Alert,
//   AlertTitle,
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   OutlinedInput,
//   Stack,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import lightningPayReq, { PaymentRequestObject } from 'bolt11';
// import { SatoshisToBtc } from '@/utils/number';

// type DialogType = {
//   openDialog: boolean;
//   setOpenDialog: (value: boolean) => void;
//   onClickSendLightningAssets: (value: string) => Promise<void>;
// };

// export default function SendLightningAssetsDialog(props: DialogType) {
//   const [invoice, setInvoice] = useState<string>('');
//   const [decodeInfo, setDecodeInfo] = useState<PaymentRequestObject>();

//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const handleDialogClose = () => {
//     setInvoice('');
//     setDecodeInfo(undefined);
//     props.setOpenDialog(false);
//   };

//   useEffect(() => {
//     try {
//       if (!invoice || invoice === '') return;

//       const decodeInvoice = lightningPayReq.decode(invoice);
//       setDecodeInfo(decodeInvoice);
//     } catch (e) {
//       console.error(e);
//       setSnackSeverity('error');
//       setSnackMessage('Parsing error, please try again');
//       setSnackOpen(true);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [invoice]);

//   return (
//     <Dialog
//       open={props.openDialog}
//       onClose={handleDialogClose}
//       aria-labelledby="alert-dialog-title"
//       aria-describedby="alert-dialog-description"
//       fullWidth
//     >
//       <DialogTitle id="alert-dialog-title">Send Lightning Network Assets</DialogTitle>
//       <DialogContent>
//         <Box mb={2}>
//           <Alert severity="warning">
//             <AlertTitle>Note</AlertTitle>
//             <Typography>Limit exeeded. Please configure your wallet.</Typography>
//           </Alert>
//         </Box>
//         <Box mb={2}>
//           <Typography mb={1} variant="h6">
//             Request String:
//           </Typography>
//           <FormControl variant="outlined" fullWidth size={'small'}>
//             <OutlinedInput
//               multiline
//               minRows={4}
//               type="text"
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               value={invoice}
//               onChange={(e: any) => {
//                 setInvoice(e.target.value);
//               }}
//               placeholder="Enter request String"
//             />
//           </FormControl>
//         </Box>

//         {decodeInfo && (
//           <Box mb={2}>
//             <Typography mb={1} variant="h6">
//               Payment Info:
//             </Typography>

//             <Stack direction={'row'} alignItems={'center'}>
//               <Box minWidth={140}>
//                 <Typography fontWeight={'bold'}>Network</Typography>
//                 <Typography fontWeight={'bold'}>Amount</Typography>
//                 <Typography fontWeight={'bold'}>Date</Typography>
//                 <Typography fontWeight={'bold'}>Payment Hash</Typography>
//                 <Typography fontWeight={'bold'}>Description</Typography>
//               </Box>

//               <Box>
//                 <Typography>{decodeInfo?.network?.bech32 === 'bc' ? 'bitcoin mainnet' : 'bitcoin testnet'}</Typography>
//                 <Typography>{SatoshisToBtc(Number(decodeInfo?.satoshis)).toFixed(8)} BTC</Typography>
//                 <Typography>{new Date(Number(decodeInfo?.timestamp) * 1000).toLocaleString()}</Typography>
//                 <Typography>
//                   {decodeInfo?.tags.find((item) => item.tagName === 'payment_hash')?.data.toString() || 'None'}
//                 </Typography>
//                 <Typography>
//                   {decodeInfo?.tags.find((item) => item.tagName === 'description')?.data.toString() || 'None'}
//                 </Typography>
//               </Box>
//             </Stack>
//           </Box>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button variant={'contained'} onClick={handleDialogClose}>
//           Close
//         </Button>
//         <Button
//           variant={'contained'}
//           onClick={async () => {
//             await props.onClickSendLightningAssets(invoice);
//             handleDialogClose();
//           }}
//           color={'success'}
//           disabled={decodeInfo ? false : true}
//         >
//           Submit
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

import { useEffect, useState } from 'react'
import { Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore } from '@/lib/store'
import lightningPayReq, { PaymentRequestObject } from 'bolt11'
import { SatoshisToBtc } from '@/utils/number'

type DialogType = {
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  onClickSendLightningAssets: (value: string) => Promise<void>
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="text-sm font-medium text-muted-foreground shrink-0 min-w-[110px]">
        {label}
      </span>
      <span className="text-sm text-right break-all">{value ?? 'None'}</span>
    </div>
  )
}

export default function SendLightningAssetsDialog(props: DialogType) {
  const [invoice, setInvoice] = useState('')
  const [decodeInfo, setDecodeInfo] = useState<PaymentRequestObject>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

  const handleDialogClose = () => {
    setInvoice('')
    setDecodeInfo(undefined)
    props.setOpenDialog(false)
  }

  useEffect(() => {
    try {
      if (!invoice || invoice === '') {
        setDecodeInfo(undefined)
        return
      }

      const decodeInvoice = lightningPayReq.decode(invoice)
      setDecodeInfo(decodeInvoice)
    } catch (e) {
      console.error(e)
      setDecodeInfo(undefined)
      setSnackSeverity('error')
      setSnackMessage('Parsing error, please try again')
      setSnackOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice])

  const paymentHash =
    decodeInfo?.tags.find((item) => item.tagName === 'payment_hash')?.data.toString() || 'None'

  const description =
    decodeInfo?.tags.find((item) => item.tagName === 'description')?.data.toString() || 'None'

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && handleDialogClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Send Lightning Network Assets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Warning */}
          <Alert className="border-amber-500/50 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>Limit exceeded. Please configure your wallet.</AlertDescription>
          </Alert>

          {/* Invoice input */}
          <div className="space-y-2">
            <Label htmlFor="invoice">Request String</Label>
            <Textarea
              id="invoice"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Enter request string"
              rows={4}
              className="font-mono text-xs"
            />
          </div>

          {/* Decoded info */}
          {decodeInfo && (
            <div className="space-y-2">
              <Label>Payment Info</Label>
              <div className="rounded-lg border p-4 space-y-0.5">
                <DetailRow
                  label="Network"
                  value={
                    decodeInfo.network?.bech32 === 'bc' ? 'bitcoin mainnet' : 'bitcoin testnet'
                  }
                />
                <DetailRow
                  label="Amount"
                  value={`${SatoshisToBtc(Number(decodeInfo.satoshis)).toFixed(8)} BTC`}
                />
                <DetailRow
                  label="Date"
                  value={new Date(Number(decodeInfo.timestamp) * 1000).toLocaleString()}
                />
                <Separator className="my-2" />
                <DetailRow label="Payment Hash" value={paymentHash} />
                <DetailRow label="Description" value={description} />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
          <Button
            disabled={!decodeInfo || isSubmitting}
            onClick={async () => {
              try {
                setIsSubmitting(true)
                await props.onClickSendLightningAssets(invoice)
                handleDialogClose()
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
