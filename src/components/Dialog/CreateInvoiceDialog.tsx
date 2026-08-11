// import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
// import Image from 'next/image';
// import { CURRENCY_SYMBOLS } from '@/packages/constants';
// import { CHAINS, COIN } from '@/packages/constants/blockchain';
// import { FindChainNamesByChains } from '@/utils/web3';

// type DialogType = {
//   selectCoinItem: COIN;
//   currency: string;
//   amount: number;
//   cryptoAmount: string;
//   rate: number;
//   openDialog: boolean;
//   setOpenDialog: (value: boolean) => void;
//   handleClose: () => void;
//   onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
// };

// export default function CreateInvoiceDialog(props: DialogType) {
//   return (
//     <Dialog
//       open={props.openDialog}
//       onClose={props.handleClose}
//       aria-labelledby="alert-dialog-title"
//       aria-describedby="alert-dialog-description"
//       fullWidth
//     >
//       <DialogTitle id="alert-dialog-title">Create Invoice</DialogTitle>
//       <DialogContent>
//         {props.selectCoinItem?.icon && <Image src={props.selectCoinItem?.icon} alt="icon" width={50} height={50} />}

//         <Stack direction={'row'} mt={2}>
//           <Box>
//             <Typography>Select Chain</Typography>
//             <Typography mt={1}>Select Coin</Typography>
//             <Typography mt={1}>Crypto Rate</Typography>
//             <Typography mt={1}>You Will Pay</Typography>
//           </Box>
//           <Box ml={6}>
//             <Typography>{FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)}</Typography>
//             <Box mt={1}>{props.selectCoinItem?.name}</Box>
//             <Typography mt={1}>
//               1 {props.selectCoinItem?.name} = {CURRENCY_SYMBOLS[props.currency]}
//               {props.rate}
//             </Typography>
//             <Typography mt={1}>
//               {props.cryptoAmount} {props.selectCoinItem?.name}
//             </Typography>
//           </Box>
//         </Stack>
//       </DialogContent>
//       <DialogActions>
//         <Button variant={'contained'} onClick={props.handleClose}>
//           Close
//         </Button>
//         <Button
//           color="success"
//           variant={'contained'}
//           onClick={async () => {
//             props.selectCoinItem && (await props.onClickCoin(props.selectCoinItem, props.cryptoAmount, props.rate));
//             props.handleClose();
//           }}
//         >
//           Create Invoice
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

import { useState } from 'react'
import Image from 'next/image'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { CURRENCY_SYMBOLS } from '@/packages/constants'
import { CHAINS, COIN } from '@/packages/constants/blockchain'
import { FindChainNamesByChains } from '@/utils/web3'

type DialogType = {
  selectCoinItem: COIN
  currency: string
  amount: number
  cryptoAmount: string
  rate: number
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  handleClose: () => void
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? '—'}</span>
    </div>
  )
}

export default function CreateInvoiceDialog(props: DialogType) {
  const [isCreating, setIsCreating] = useState(false)

  const chainName = FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && props.handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Coin header */}
          {props.selectCoinItem?.icon && (
            <div className="flex items-center gap-3">
              <Image
                src={props.selectCoinItem.icon}
                alt={props.selectCoinItem.name ?? 'coin'}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-medium">{props.selectCoinItem.name}</p>
                <p className="text-sm text-muted-foreground">{chainName}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Details */}
          <div className="space-y-0.5">
            <DetailRow label="Select Chain" value={chainName} />
            <DetailRow label="Select Coin" value={props.selectCoinItem?.name} />
            <DetailRow
              label="Crypto Rate"
              value={`1 ${props.selectCoinItem?.name} = ${
                CURRENCY_SYMBOLS[props.currency]
              }${props.rate}`}
            />
            <Separator className="my-2" />
            <DetailRow
              label="You Will Pay"
              value={`${props.cryptoAmount} ${props.selectCoinItem?.name}`}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={props.handleClose}>
            Close
          </Button>
          <Button
            disabled={isCreating || !props.selectCoinItem}
            onClick={async () => {
              if (!props.selectCoinItem) return
              try {
                setIsCreating(true)
                await props.onClickCoin(props.selectCoinItem, props.cryptoAmount, props.rate)
                props.handleClose()
              } finally {
                setIsCreating(false)
              }
            }}
          >
            {isCreating ? 'Creating...' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
