// import { NavigateNext } from '@mui/icons-material';
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Container,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Grid,
//   Icon,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Stack,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import Image from 'next/image';
// import { BLOCKCHAIN, BLOCKCHAINNAMES } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import { VisibilityOff } from '@mui/icons-material';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { FindChainIdsByChainNames, GetBlockchainAddressUrlByChainIds } from '@/utils/web3';
// import Link from 'next/link';

// type RowType = {
//   chainId: number;
//   isMainnet: boolean;
//   address: string;
//   privateKey: string;
//   view: boolean;
// };

// const ManageNetwork = () => {
//   const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>();
//   const [currentItem, setCurrentItem] = useState<BLOCKCHAIN>();
//   const [open, setOpen] = useState<boolean>(false);

//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { getNetwork } = useUserPresistStore((state) => state);
//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const handleOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const onClickAddNetwork = async () => {};

//   useEffect(() => {
//     const value = BLOCKCHAINNAMES.filter((item: any) =>
//       getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet,
//     );
//     setBlockchains(value);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       <Container>
//         <Typography variant="h6">Customize Network</Typography>
//         <Box mt={4}>
//           <Button
//             variant={'contained'}
//             fullWidth
//             onClick={() => {
//               onClickAddNetwork();
//             }}
//           >
//             Add a network
//           </Button>
//         </Box>
//         <Box mt={4}>
//           <Grid container color={'#8f979e'} spacing={3}>
//             {blockchains &&
//               blockchains.length > 0 &&
//               blockchains.map((item, index) => (
//                 <Grid xs={4} item key={index}>
//                   <Card>
//                     <CardContent>
//                       <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                         <Stack direction={'row'} alignItems={'center'}>
//                           <Image src={item.icon} alt="image" width={40} height={40} />
//                           <Typography ml={1} fontWeight={'bold'}>
//                             {item.name}
//                           </Typography>
//                         </Stack>
//                         <Chip label="Active" color={'success'} />
//                       </Stack>

//                       <Typography mt={2}>{item.desc}</Typography>

//                       <Box mt={4}>
//                         <Button
//                           variant={'contained'}
//                           fullWidth
//                           onClick={() => {
//                             setCurrentItem(item);
//                             handleOpen();
//                           }}
//                         >
//                           Check Network
//                         </Button>
//                       </Box>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               ))}
//           </Grid>
//         </Box>

//         <Dialog
//           open={open}
//           onClose={handleClose}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//           fullWidth
//         >
//           <DialogTitle id="alert-dialog-title">{currentItem?.name}</DialogTitle>
//           <DialogContent>
//             <Box mb={2}>
//               <Typography mb={1}>Network name</Typography>
//               <TextField size={'small'} type="text" fullWidth value={currentItem?.name} disabled />
//             </Box>
//             <Box mb={2}>
//               <Typography mb={1}>RPC URL</Typography>
//               {currentItem?.rpc &&
//                 currentItem.rpc.map((item, index) => (
//                   <TextField key={index} size={'small'} type="text" fullWidth value={item} disabled />
//                 ))}
//             </Box>
//             <Box mb={2}>
//               <Typography mb={1}>Chain ID</Typography>
//               <TextField size={'small'} type="text" fullWidth value={currentItem?.chainId} disabled />
//             </Box>
//             <Box mb={2}>
//               <Typography mb={1}>Symbol</Typography>
//               <TextField size={'small'} type="text" fullWidth value={currentItem?.coins[0].symbol} disabled />
//             </Box>
//             <Box mb={2}>
//               <Typography mb={1}>Website</Typography>
//               <TextField size={'small'} type="text" fullWidth value={currentItem?.websiteUrl} disabled />
//             </Box>
//             <Box mb={2}>
//               <Typography mb={1}>Blockchain browser</Typography>
//               <TextField size={'small'} type="text" fullWidth value={currentItem?.explorerUrl} disabled />
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={handleClose}>Close</Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </Box>
//   );
// };

// export default ManageNetwork;

import { useEffect, useState } from 'react'
import Image from 'next/image'

import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store'
import { BLOCKCHAIN, BLOCKCHAINNAMES } from '@/packages/constants/blockchain'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useShallow } from 'zustand/react/shallow'

const ManageNetwork = () => {
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>()
  const [currentItem, setCurrentItem] = useState<BLOCKCHAIN>()
  const [open, setOpen] = useState<boolean>(false)

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const onClickAddNetwork = async () => {}

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) =>
      network === 'mainnet' ? item.isMainnet : !item.isMainnet
    )
    setBlockchains(value)
  }, [network])

  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Customize Network</h2>

        <Button className="mt-4 w-full" onClick={() => onClickAddNetwork()}>
          Add a network
        </Button>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blockchains &&
            blockchains.length > 0 &&
            blockchains.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image src={item.icon} alt="image" width={40} height={40} />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                      Active
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">{item.desc}</p>

                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => {
                      setCurrentItem(item)
                      setOpen(true)
                    }}
                  >
                    Check Network
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentItem?.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Network name</Label>
                <Input value={currentItem?.name ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>RPC URL</Label>
                <div className="space-y-2">
                  {currentItem?.rpc &&
                    currentItem.rpc.map((item, index) => (
                      <Input key={index} value={item} disabled />
                    ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Chain ID</Label>
                <Input value={currentItem?.chainId ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>Symbol</Label>
                <Input value={currentItem?.coins[0]?.symbol ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input value={currentItem?.websiteUrl ?? ''} disabled />
              </div>

              <div className="space-y-1.5">
                <Label>Blockchain browser</Label>
                <Input value={currentItem?.explorerUrl ?? ''} disabled />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ManageNetwork
