// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Alert,
//   AlertTitle,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Container,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Icon,
//   IconButton,
//   Stack,
//   Switch,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { AccountBalanceWallet, ExpandMore, ReportGmailerrorred } from '@mui/icons-material';
// import Image from 'next/image';
// import { BLOCKCHAINNAMES, CHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain';

// type blockchainCoinType = {
//   chainId: CHAINS;
//   icon: any;
//   name: COINS;
//   isMainCoin: boolean;
//   address: string;
//   enabled: boolean;
//   scan: boolean;
// };

// type blockchainType = {
//   icon: any;
//   name: CHAINNAMES;
//   desc: string;
//   coins: blockchainCoinType[];
// };

// const ManageWallet = () => {
//   const [openExplain, setOpenExplain] = useState<boolean>(false);

//   const [walletName, setWalletName] = useState<string>('');
//   const [newWalletName, setNewWalletName] = useState<string>('');
//   const [isBackup, setIsBackup] = useState<boolean>(false);
//   const [open, setOpen] = useState<boolean>(false);

//   const [blockchains, setBlockchains] = useState<blockchainType[]>([]);

//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);
//   const { getUserId, getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);

//   const handleOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setNewWalletName('');

//     setOpen(false);
//   };

//   const getWalletInfo = async () => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_by_id, {
//         params: {
//           id: getWalletId(),
//         },
//       });

//       if (response.result && response.data) {
//         setWalletName(response.data.name);
//         setIsBackup(response.data.is_backup === 1 ? true : false);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickRename = async () => {
//     try {
//       if (!newWalletName || newWalletName === '') {
//         setSnackSeverity('error');
//         setSnackMessage('Incorrect name input');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.put(Http.update_name_by_wallet_id, {
//         wallet_id: getWalletId(),
//         name: newWalletName,
//       });
//       if (response.result) {
//         await getWalletInfo();
//         handleClose();

//         setSnackSeverity('success');
//         setSnackMessage('Successful update!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onChangeCoin = async (chainId: CHAINS, coinName: COINS) => {
//     try {
//       const response: any = await axios.put(Http.update_wallet_coin_enable_by_id, {
//         user_id: getUserId(),
//         store_id: getStoreId(),
//         chain_id: chainId,
//         name: coinName,
//         network: getNetwork() === 'mainnet' ? 1 : 2,
//       });

//       if (response.result) {
//         await getWalletManage();

//         setSnackSeverity('success');
//         setSnackMessage('Update successful!');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Update failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const getWalletManage = async () => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_manage_by_network, {
//         params: {
//           wallet_id: getWalletId(),
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result) {
//         const respBalances = response.data.balances;
//         const respCoins = response.data.coins;
//         const respScan = response.data.scan;

//         const blockchain = BLOCKCHAINNAMES.filter((item) =>
//           getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet,
//         );

//         let blockchains: blockchainType[] = [];
//         for (const chain of blockchain) {
//           let blockchain: blockchainType = {
//             icon: chain.icon,
//             name: chain.name,
//             desc: chain.desc,
//             coins: [],
//           };

//           let coins: blockchainCoinType[] = [];
//           for (const coin of chain.coins) {
//             let blockchainCoin: blockchainCoinType = {
//               chainId: coin.chainId,
//               icon: coin.icon,
//               name: coin.name,
//               isMainCoin: coin.isMainCoin,
//               address: '',
//               enabled: false,
//               scan: false,
//             };

//             const findBalance = respBalances?.find((item: any) => item.chain_id === coin.chainId);
//             blockchainCoin.address = findBalance.address ? findBalance?.address : '';
//             blockchainCoin.enabled = respCoins?.find(
//               (item: any) => item.chain_id === coin.chainId && item.name === coin.name,
//             ).enabled;

//             if (respScan.result) {
//               blockchainCoin.scan = true;
//             } else {
//               const hasScan = respScan.data?.find(
//                 (item: any) => item.chain_id === coin.chainId && item.address === blockchainCoin.address,
//               );

//               blockchainCoin.scan = hasScan ? false : true;
//             }

//             coins.push(blockchainCoin);
//           }

//           blockchain.coins = coins;
//           blockchains.push(blockchain);
//         }

//         setBlockchains(blockchains);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const init = async () => {
//     await getWalletInfo();
//     await getWalletManage();
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onClickRefresh = async () => {
//     await getWalletManage();
//   };

//   return (
//     <Box>
//       <Container>
//         <Typography variant="h6">Wallet Manage</Typography>

//         <Box mt={4}>
//           <Card>
//             <CardContent>
//               <Stack direction={'row'} alignItems={'flex-start'} justifyContent={'space-between'}>
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Icon component={AccountBalanceWallet} fontSize={'large'} />
//                   <Typography fontWeight={'bold'} px={2}>
//                     {walletName ? walletName : 'UNKOWN NAME'}
//                   </Typography>
//                   <Chip color={isBackup ? 'success' : 'error'} label={isBackup ? 'Backed up' : 'Not backed up'} />
//                 </Stack>
//                 <Stack direction={'row'} alignItems={'center'} gap={1}>
//                   <Button variant={'contained'} onClick={handleOpen}>
//                     Rename wallet
//                   </Button>
//                   <Button
//                     color="success"
//                     variant={'contained'}
//                     onClick={() => {
//                       window.location.href = '/wallet/phrase/intro';
//                     }}
//                   >
//                     Go back up
//                   </Button>
//                 </Stack>
//               </Stack>

//               <Box mt={4}>
//                 <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pb={2}>
//                   <Stack direction={'row'} alignItems={'center'}>
//                     <Typography variant="h6">Coin Manage</Typography>
//                     <IconButton
//                       onClick={() => {
//                         setOpenExplain(!openExplain);
//                       }}
//                     >
//                       <ReportGmailerrorred />
//                     </IconButton>
//                   </Stack>

//                   <Button variant={'contained'} color={'success'} onClick={onClickRefresh}>
//                     Refresh
//                   </Button>
//                 </Stack>

//                 {openExplain && (
//                   <Alert severity="info">
//                     <AlertTitle>Info</AlertTitle>
//                     Refresh: All data of the blockchain tokens will be refreshed.
//                     <br />
//                     <br />
//                     Scanned or no scan: Whether the address used by this coin is within the scanning range; if within
//                     the range, it will be processed for creating the order. &quot;Scanned&quot; indicates it exists, &quot;No Scan&quot;
//                     indicates it does not exist.
//                     <br />
//                     <br />
//                     Enable or Disable: Click the following button to enable or disable the display of this token,
//                     involving all the users who create invoices.
//                   </Alert>
//                 )}

//                 {blockchains &&
//                   blockchains.length > 0 &&
//                   blockchains.map((item, index) => (
//                     <Accordion defaultExpanded={index === 0 || index === 1 ? true : false} key={index}>
//                       <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
//                         <Stack direction={'row'} alignItems={'center'} gap={2}>
//                           <Image src={item.icon} alt="icon" width={40} height={40} />
//                           <Typography>{item.name}</Typography>
//                         </Stack>
//                       </AccordionSummary>
//                       <AccordionDetails>
//                         <Typography>{item.desc}</Typography>
//                         <Typography py={2} fontWeight={'bold'} color={'orange'}>
//                           Click the following button to enable or disable the display of this token
//                         </Typography>
//                         {item.coins &&
//                           item.coins.length > 0 &&
//                           item.coins.map((coinItem, coinIndex) => (
//                             <Stack
//                               direction={'row'}
//                               alignItems={'center'}
//                               justifyContent={'space-between'}
//                               pb={2}
//                               key={coinIndex}
//                             >
//                               <Stack direction={'row'} alignItems={'center'} gap={2}>
//                                 <Image src={coinItem.icon} alt="icon" width={40} height={40} />
//                                 <Typography>{coinItem.name}</Typography>
//                                 {coinItem.isMainCoin && <Chip color={'info'} label={'main coin'} variant={'filled'} />}

//                                 {coinItem.scan ? (
//                                   <Chip color="success" label={'Scanned'} variant={'filled'} />
//                                 ) : (
//                                   <Chip color="error" label={'No Scan'} variant={'filled'} />
//                                 )}
//                               </Stack>
//                               <Switch
//                                 checked={coinItem.enabled}
//                                 onChange={() => {
//                                   onChangeCoin(coinItem.chainId, coinItem.name);
//                                 }}
//                               />
//                             </Stack>
//                           ))}
//                       </AccordionDetails>
//                     </Accordion>
//                   ))}
//               </Box>
//             </CardContent>
//           </Card>
//         </Box>

//         <Dialog
//           open={open}
//           onClose={handleClose}
//           aria-labelledby="alert-dialog-title"
//           aria-describedby="alert-dialog-description"
//           fullWidth
//         >
//           <DialogTitle id="alert-dialog-title">Rename Wallet</DialogTitle>
//           <DialogContent>
//             <TextField
//               autoFocus
//               required
//               margin="dense"
//               type={'text'}
//               fullWidth
//               variant="standard"
//               value={newWalletName}
//               onChange={(e: any) => {
//                 setNewWalletName(e.target.value);
//               }}
//             />
//           </DialogContent>
//           <DialogActions>
//             <Button variant={'contained'} onClick={handleClose}>
//               Close
//             </Button>
//             <Button variant={'contained'} onClick={onClickRename} color="success">
//               Confirm
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </Box>
//   );
// };

// export default ManageWallet;

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, ChevronDown, Info, Wallet } from 'lucide-react'

import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { BLOCKCHAINNAMES, CHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type blockchainCoinType = {
  chainId: CHAINS
  icon: any
  name: COINS
  isMainCoin: boolean
  address: string
  enabled: boolean
  scan: boolean
}

type blockchainType = {
  icon: any
  name: CHAINNAMES
  desc: string
  coins: blockchainCoinType[]
}

const ManageWallet = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)

  const [walletName, setWalletName] = useState<string>('')
  const [newWalletName, setNewWalletName] = useState<string>('')
  const [isBackup, setIsBackup] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  const [blockchains, setBlockchains] = useState<blockchainType[]>([])

  const { getWalletId } = useWalletPresistStore((state) => state)
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state)
  const { getUserId, getNetwork } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const handleClose = () => {
    setNewWalletName('')
    setOpen(false)
  }

  const getWalletInfo = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: getWalletId(),
        },
      })

      if (response.result && response.data) {
        setWalletName(response.data.name)
        setIsBackup(response.data.is_backup === 1 ? true : false)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onClickRename = async () => {
    try {
      if (!newWalletName || newWalletName === '') {
        showSnack('error', 'Incorrect name input')
        return
      }

      const response: any = await axios.put(Http.update_name_by_wallet_id, {
        wallet_id: getWalletId(),
        name: newWalletName,
      })
      if (response.result) {
        await getWalletInfo()
        handleClose()
        showSnack('success', 'Successful update!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const onChangeCoin = async (chainId: CHAINS, coinName: COINS) => {
    try {
      const response: any = await axios.put(Http.update_wallet_coin_enable_by_id, {
        user_id: getUserId(),
        store_id: getStoreId(),
        chain_id: chainId,
        name: coinName,
        network: getNetwork() === 'mainnet' ? 1 : 2,
      })

      if (response.result) {
        await getWalletManage()
        showSnack('success', 'Update successful!')
      } else {
        showSnack('error', 'Update failed!')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const getWalletManage = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_manage_by_network, {
        params: {
          wallet_id: getWalletId(),
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        const respBalances = response.data.balances
        const respCoins = response.data.coins
        const respScan = response.data.scan

        const blockchain = BLOCKCHAINNAMES.filter((item) =>
          getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet
        )

        let blockchains: blockchainType[] = []
        for (const chain of blockchain) {
          let blockchain: blockchainType = {
            icon: chain.icon,
            name: chain.name,
            desc: chain.desc,
            coins: [],
          }

          let coins: blockchainCoinType[] = []
          for (const coin of chain.coins) {
            let blockchainCoin: blockchainCoinType = {
              chainId: coin.chainId,
              icon: coin.icon,
              name: coin.name,
              isMainCoin: coin.isMainCoin,
              address: '',
              enabled: false,
              scan: false,
            }

            const findBalance = respBalances?.find((item: any) => item.chain_id === coin.chainId)
            blockchainCoin.address = findBalance.address ? findBalance?.address : ''
            blockchainCoin.enabled = respCoins?.find(
              (item: any) => item.chain_id === coin.chainId && item.name === coin.name
            ).enabled

            if (respScan.result) {
              blockchainCoin.scan = true
            } else {
              const hasScan = respScan.data?.find(
                (item: any) =>
                  item.chain_id === coin.chainId && item.address === blockchainCoin.address
              )

              blockchainCoin.scan = hasScan ? false : true
            }

            coins.push(blockchainCoin)
          }

          blockchain.coins = coins
          blockchains.push(blockchain)
        }

        setBlockchains(blockchains)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const init = async () => {
    await getWalletInfo()
    await getWalletManage()
  }

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onClickRefresh = async () => {
    await getWalletManage()
  }

  // 默认展开前两项,对应原来的 defaultExpanded
  const defaultExpandedValues = blockchains.slice(0, 2).map((_, index) => `item-${index}`)

  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Wallet Manage</h2>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Wallet className="h-7 w-7 text-muted-foreground" />
                <span className="font-semibold">{walletName ? walletName : 'UNKOWN NAME'}</span>
                <Badge
                  className={cn(
                    'border-transparent',
                    isBackup
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : 'bg-red-100 text-red-800 hover:bg-red-100'
                  )}
                >
                  {isBackup ? 'Backed up' : 'Not backed up'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => setOpen(true)}>Rename wallet</Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    window.location.href = '/wallet/phrase/intro'
                  }}
                >
                  Go back up
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-1">
                  <h3 className="text-lg font-semibold">Coin Manage</h3>
                  <Button variant="ghost" size="icon" onClick={() => setOpenExplain(!openExplain)}>
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>

                <Button className="bg-green-600 hover:bg-green-700" onClick={onClickRefresh}>
                  Refresh
                </Button>
              </div>

              {openExplain && (
                <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-900">
                  <Info className="h-4 w-4 !text-blue-600" />
                  <AlertTitle>Info</AlertTitle>
                  <AlertDescription className="space-y-2 text-blue-800">
                    <p>Refresh: All data of the blockchain tokens will be refreshed.</p>
                    <p>
                      Scanned or no scan: Whether the address used by this coin is within the
                      scanning range; if within the range, it will be processed for creating the
                      order. &quot;Scanned&quot; indicates it exists, &quot;No Scan&quot; indicates
                      it does not exist.
                    </p>
                    <p>
                      Enable or Disable: Click the following button to enable or disable the display
                      of this token, involving all the users who create invoices.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {blockchains && blockchains.length > 0 && (
                <Accordion type="multiple" defaultValue={defaultExpandedValues}>
                  {blockchains.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Image src={item.icon} alt="icon" width={40} height={40} />
                          <span>{item.name}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{item.desc}</p>
                        <p className="py-3 font-semibold text-amber-600">
                          Click the following button to enable or disable the display of this token
                        </p>

                        <div className="space-y-3">
                          {item.coins &&
                            item.coins.length > 0 &&
                            item.coins.map((coinItem, coinIndex) => (
                              <div
                                key={coinIndex}
                                className="flex flex-wrap items-center justify-between gap-2"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <Image src={coinItem.icon} alt="icon" width={40} height={40} />
                                  <span>{coinItem.name}</span>
                                  {coinItem.isMainCoin && (
                                    <Badge className="border-transparent bg-sky-100 text-sky-800 hover:bg-sky-100">
                                      main coin
                                    </Badge>
                                  )}
                                  {coinItem.scan ? (
                                    <Badge className="border-transparent bg-green-100 text-green-800 hover:bg-green-100">
                                      Scanned
                                    </Badge>
                                  ) : (
                                    <Badge className="border-transparent bg-red-100 text-red-800 hover:bg-red-100">
                                      No Scan
                                    </Badge>
                                  )}
                                </div>
                                <Switch
                                  checked={coinItem.enabled}
                                  onCheckedChange={() =>
                                    onChangeCoin(coinItem.chainId, coinItem.name)
                                  }
                                />
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Wallet</DialogTitle>
            </DialogHeader>

            <Input
              autoFocus
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onClickRename()
              }}
            />

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={onClickRename}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default ManageWallet
