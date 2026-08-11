// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   MenuItem,
//   Select,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore } from '@/lib/store';
// import { WALLET } from '@/packages/constants';
// import { CHAINNAMES } from '@/packages/constants/blockchain';
// import { useState } from 'react';

// type DialogType = {
//   openDialog: boolean;
//   setOpenDialog: (value: boolean) => void;
// };

// export default function ReportPaymentDialog(props: DialogType) {
//   const [issueWallet, setIssueWallet] = useState<typeof WALLET>();
//   const [issuePaymentMethod, setIssuePaymentMethod] = useState<CHAINNAMES>();
//   const [issueMessage, setIssueMessage] = useState<string>('');

//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const handleDialogClose = () => {
//     setIssueWallet(undefined);
//     setIssuePaymentMethod(undefined);
//     setIssueMessage('');

//     props.setOpenDialog(false);
//   };

//   const onClickSubmitIssue = async () => {
//     try {
//       setSnackSeverity('success');
//       setSnackMessage('report issue success!');
//       setSnackOpen(true);

//       props.setOpenDialog(false);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <Dialog
//       open={props.openDialog}
//       onClose={handleDialogClose}
//       aria-labelledby="alert-dialog-title"
//       aria-describedby="alert-dialog-description"
//       fullWidth
//     >
//       <DialogTitle id="alert-dialog-title">Report An Issue</DialogTitle>
//       <DialogContent>
//         <Typography fontWeight={'bold'}>I have an issue in making payment</Typography>

//         <Typography mt={2} mb={1}>
//           Select wallet which you have used
//         </Typography>
//         <Box mb={2}>
//           <FormControl variant="outlined" fullWidth size={'small'}>
//             <Select
//               size={'small'}
//               inputProps={{ 'aria-label': 'Without label' }}
//               onChange={(e: any) => {
//                 setIssueWallet(e.target.value);
//               }}
//               value={issueWallet}
//               placeholder="Select wallet"
//             >
//               {WALLET &&
//                 WALLET.length > 0 &&
//                 WALLET.map((item, index) => (
//                   <MenuItem value={item} key={index}>
//                     {item}
//                   </MenuItem>
//                 ))}
//             </Select>
//           </FormControl>
//         </Box>

//         <Typography mb={1}>Select payment method which you have used</Typography>
//         <Box mb={2}>
//           <FormControl variant="outlined" fullWidth size={'small'}>
//             <Select
//               size={'small'}
//               inputProps={{ 'aria-label': 'Without label' }}
//               onChange={(e) => {
//                 setIssuePaymentMethod(e.target.value as CHAINNAMES);
//               }}
//               value={issuePaymentMethod}
//             >
//               {CHAINNAMES &&
//                 Object.entries(CHAINNAMES).length > 0 &&
//                 Object.entries(CHAINNAMES).map((item, index) => (
//                   <MenuItem value={item[1]} key={index}>
//                     {item[1]}
//                   </MenuItem>
//                 ))}
//             </Select>
//           </FormControl>
//         </Box>

//         <Typography mb={1}>Provide more information like error message, failure etc</Typography>
//         <Box mb={2}>
//           <FormControl variant="outlined" fullWidth size={'small'}>
//             <TextField
//               fullWidth
//               hiddenLabel
//               multiline
//               minRows={4}
//               value={issueMessage}
//               onChange={(e: any) => {
//                 setIssueMessage(e.target.value);
//               }}
//               placeholder="Type a reason..."
//             />
//           </FormControl>
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button variant={'contained'} onClick={handleDialogClose}>
//           Close
//         </Button>
//         <Button
//           variant={'contained'}
//           onClick={async () => {
//             await onClickSubmitIssue();
//           }}
//           color="success"
//         >
//           Submit
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSnackPresistStore } from '@/lib/store'
import { WALLET } from '@/packages/constants'
import { CHAINNAMES } from '@/packages/constants/blockchain'

type DialogType = {
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
}

export default function ReportPaymentDialog(props: DialogType) {
  const [issueWallet, setIssueWallet] = useState<string>('')
  const [issuePaymentMethod, setIssuePaymentMethod] = useState<string>('')
  const [issueMessage, setIssueMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)

  const handleDialogClose = () => {
    setIssueWallet('')
    setIssuePaymentMethod('')
    setIssueMessage('')
    props.setOpenDialog(false)
  }

  const onClickSubmitIssue = async () => {
    try {
      setIsSubmitting(true)
      setSnackSeverity('success')
      setSnackMessage('report issue success!')
      setSnackOpen(true)
      handleDialogClose()
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && handleDialogClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Report An Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <p className="text-sm font-medium">I have an issue in making payment</p>

          {/* Wallet */}
          <div className="space-y-2">
            <Label>Select wallet which you have used</Label>
            <Select value={issueWallet} onValueChange={setIssueWallet}>
              <SelectTrigger>
                <SelectValue placeholder="Select wallet" />
              </SelectTrigger>
              <SelectContent>
                {WALLET?.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment method */}
          <div className="space-y-2">
            <Label>Select payment method which you have used</Label>
            <Select value={issuePaymentMethod} onValueChange={setIssuePaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CHAINNAMES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>Provide more information like error message, failure etc</Label>
            <Textarea
              value={issueMessage}
              onChange={(e) => setIssueMessage(e.target.value)}
              placeholder="Type a reason..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
          <Button disabled={isSubmitting} onClick={onClickSubmitIssue}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
