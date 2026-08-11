// import {
//   Box,
//   Button,
//   Chip,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   Grid,
//   InputAdornment,
//   OutlinedInput,
//   Typography,
// } from '@mui/material';
// import { CHAINS, COIN } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import { OmitMiddleString } from '@/utils/strings';
// import { FindChainNamesByChains } from '@/utils/web3';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import Image from 'next/image';

// type RowType = {
//   id: number;
//   chainId: number;
//   isMainnet: boolean;
//   name: string;
//   address: string;
// };

// type DialogType = {
//   network: number;
//   selectCoinItem: COIN;
//   openDialog: boolean;
//   setOpenDialog: (value: boolean) => void;
//   onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
// };

// export default function CreateFreeFundsDialog(props: DialogType) {
//   const [rows, setRows] = useState<RowType[]>([]);

//   const [address, setAddress] = useState<string>('');
//   const [amount, setAmount] = useState<number>(0);

//   const handleClose = () => {
//     setAddress('');
//     setAmount(0);
//     setRows([]);

//     props.setOpenDialog(false);
//   };

//   const initAddressBook = async (chainId: number) => {
//     if (!chainId) {
//       return;
//     }

//     try {
//       const response: any = await axios.get(Http.find_address_book, {
//         params: {
//           network: props.network,
//           chain_id: chainId,
//         },
//       });
//       if (response.result && response.data.length > 0) {
//         let rt: RowType[] = [];
//         response.data.forEach((item: any) => {
//           rt.push({
//             id: item.id,
//             chainId: item.chain_id,
//             isMainnet: item.network === 1 ? true : false,
//             name: item.name,
//             address: item.address,
//           });
//         });

//         setRows(rt);
//       }
//     } catch (e) {
//       console.error(e);
//     }

//     props.setOpenDialog(true);
//   };

//   useEffect(() => {
//     initAddressBook(props.selectCoinItem?.chainId);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [props.selectCoinItem]);

//   return (
//     <Dialog
//       open={props.openDialog}
//       onClose={handleClose}
//       aria-labelledby="alert-dialog-title"
//       aria-describedby="alert-dialog-description"
//       fullWidth
//     >
//       <DialogTitle id="alert-dialog-title">Claim Free Funds</DialogTitle>
//       <DialogContent>
//         <Image src={props.selectCoinItem?.icon} alt="icon" width={50} height={50} />

//         <Box my={2}>
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

//         {rows && rows.length > 0 && (
//           <Box mb={2}>
//             <Typography mb={2}>Address Books</Typography>
//             <Grid container spacing={2}>
//               {rows.map((item, index) => (
//                 <Grid item key={index}>
//                   <Chip
//                     label={OmitMiddleString(item.address)}
//                     variant="outlined"
//                     onClick={() => {
//                       setAddress(item.address);
//                     }}
//                   />
//                 </Grid>
//               ))}
//             </Grid>
//           </Box>
//         )}

//         <Box mb={2}>
//           <FormControl variant="outlined" fullWidth size={'small'}>
//             <OutlinedInput
//               type="number"
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

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CHAINS, COIN } from '@/packages/constants/blockchain'
import { OmitMiddleString } from '@/utils/strings'
import { FindChainNamesByChains } from '@/utils/web3'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'

type RowType = {
  id: number
  chainId: number
  isMainnet: boolean
  name: string
  address: string
}

type DialogType = {
  network: number
  selectCoinItem: COIN
  openDialog: boolean
  setOpenDialog: (value: boolean) => void
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>
}

export default function CreateFreeFundsDialog(props: DialogType) {
  const [rows, setRows] = useState<RowType[]>([])
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [isClaiming, setIsClaiming] = useState(false)

  const handleClose = () => {
    setAddress('')
    setAmount(0)
    setRows([])
    props.setOpenDialog(false)
  }

  const initAddressBook = async (chainId: number) => {
    if (!chainId) return

    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          network: props.network,
          chain_id: chainId,
        },
      })

      if (response.result && response.data.length > 0) {
        const rt: RowType[] = response.data.map((item: any) => ({
          id: item.id,
          chainId: item.chain_id,
          isMainnet: item.network === 1,
          name: item.name,
          address: item.address,
        }))
        setRows(rt)
      }
    } catch (e) {
      console.error(e)
    }

    props.setOpenDialog(true)
  }

  useEffect(() => {
    initAddressBook(props.selectCoinItem?.chainId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectCoinItem])

  const chainName = FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)

  return (
    <Dialog open={props.openDialog} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Claim Free Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Coin icon */}
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

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <Input
                id="address"
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

          {/* Address book */}
          {rows.length > 0 && (
            <div className="space-y-2">
              <Label>Address Book</Label>
              <div className="flex flex-wrap gap-2">
                {rows.map((item) => (
                  <Badge
                    key={item.id}
                    variant="outline"
                    className="cursor-pointer font-mono text-xs hover:bg-muted transition-colors"
                    onClick={() => setAddress(item.address)}
                  >
                    {OmitMiddleString(item.address)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter your amount"
            />
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
