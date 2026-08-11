// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputAdornment,
//   OutlinedInput,
// } from '@mui/material';
// import { CHAINS, COIN } from '@/packages/constants/blockchain';
// import { useState } from 'react';
// import { FindChainNamesByChains } from '@/utils/web3';

// type DialogType = {
//   currency: string;
//   selectCoinItem: COIN;
//   openDialog: boolean;
//   setOpenDialog: (value: boolean) => void;
//   onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
// };

// export default function CreateFundsDialog(props: DialogType) {
//   const [address, setAddress] = useState<string>('');
//   const [amount, setAmount] = useState<number>(0);

//   const handleClose = () => {
//     setAddress('');
//     setAmount(0);

//     props.setOpenDialog(false);
//   };

//   return (
//     <Dialog
//       open={props.openDialog}
//       onClose={handleClose}
//       aria-labelledby="alert-dialog-title"
//       aria-describedby="alert-dialog-description"
//       fullWidth
//     >
//       <DialogTitle id="alert-dialog-title">Claim Funds</DialogTitle>
//       <DialogContent>
//         <Box mb={2}>
//           <FormControl variant="outlined" fullWidth size={'small'}>
//             <OutlinedInput
//               type="text"
//               endAdornment={
//                 <InputAdornment position="end">
//                   {FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)}
//                 </InputAdornment>
//               }
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               value={address}
//               onChange={(e: any) => {
//                 setAddress(e.target.value);
//               }}
//               placeholder="Enter your address"
//             />
//           </FormControl>
//         </Box>

//         <Box mb={2}>
//           <FormControl variant="outlined" fullWidth size={'small'}>
//             <OutlinedInput
//               type="number"
//               endAdornment={<InputAdornment position="end">{props.currency}</InputAdornment>}
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               value={amount}
//               onChange={(e: any) => {
//                 setAmount(e.target.value);
//               }}
//               placeholder="Enter you amount"
//             />
//           </FormControl>
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button variant={'contained'} onClick={handleClose}>
//           Close
//         </Button>
//         <Button
//           color="success"
//           variant={'contained'}
//           onClick={async () => {
//             await props.onClickCoin(props.selectCoinItem as COIN, address, amount);
//             handleClose();
//           }}
//         >
//           Claim Funds
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CHAINS, COIN } from '@/packages/constants/blockchain'
import { FindChainNamesByChains } from '@/utils/web3'

type DialogType = {
  currency: string
  selectCoinItem: COIN
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>
}

export default function CreateFundsDialog(props: DialogType) {
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [isClaiming, setIsClaiming] = useState(false)

  const handleClose = () => {
    setAddress('')
    setAmount(0)
    props.setOpenDialog(false)
  }

  const chainName = FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Claim Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="claim-address">Address</Label>
            <div className="relative">
              <Input
                id="claim-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="pr-24 font-mono text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                {chainName}
              </span>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="claim-amount">Amount</Label>
            <div className="relative">
              <Input
                id="claim-amount"
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Enter your amount"
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                {props.currency}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            disabled={isClaiming || !address}
            onClick={async () => {
              try {
                setIsClaiming(true)
                await props.onClickCoin(props.selectCoinItem as COIN, address, amount as any)
                handleClose()
              } finally {
                setIsClaiming(false)
              }
            }}
          >
            {isClaiming ? 'Claiming...' : 'Claim Funds'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
