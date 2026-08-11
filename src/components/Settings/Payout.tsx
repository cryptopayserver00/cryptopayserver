// import {
//   Box,
//   Button,
//   FormControl,
//   InputAdornment,
//   OutlinedInput,
//   Paper,
//   Stack,
//   Switch,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { CHAINS } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { FindChainNamesByChains } from '@/utils/web3';

// const Payout = () => {
//   const [id, setId] = useState<number>(0);
//   const [isConfigure, setIsConfigure] = useState<boolean>(false);
//   const [configureChain, setConfigureChain] = useState<CHAINS>(CHAINS.BITCOIN);
//   const [showApprovePayoutProcess, setShowApprovePayoutProcess] = useState<boolean>();
//   const [interval, setInterval] = useState<number>(0);
//   const [feeBlockTarget, setFeeBlockTarget] = useState<number>(0);
//   const [threshold, setThreshold] = useState<number>(0);

//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const onClickSave = async () => {
//     try {
//       if (!id) {
//         return;
//       }

//       const response: any = await axios.put(Http.update_payout_setting_by_id, {
//         id: id,
//         show_approve_payout_process: showApprovePayoutProcess ? 1 : 2,
//         interval: interval,
//         fee_block_target: feeBlockTarget,
//         threshold: threshold,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Update successful!');
//         setSnackOpen(true);

//         setIsConfigure(false);
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
//     } finally {
//       clearData();
//     }
//   };

//   const clearData = () => {
//     setId(0);
//     setConfigureChain(CHAINS.BITCOIN);
//     setShowApprovePayoutProcess(false);
//     setInterval(0);
//     setFeeBlockTarget(0);
//     setThreshold(0);
//   };

//   return (
//     <Box>
//       {!isConfigure ? (
//         <Box>
//           <Box>
//             <Typography variant="h6">Payout Processors</Typography>
//             <Typography mt={2}>
//               Payout Processors allow CryptoPay Server to handle payouts in an automated way.
//             </Typography>
//           </Box>

//           <Box mt={5}>
//             <Typography variant="h6">Automated Crypto Sender</Typography>

//             <Box mt={4}>
//               <StorePayoutTable
//                 setId={setId}
//                 setIsConfigure={setIsConfigure}
//                 setConfigureChain={setConfigureChain}
//                 setShowApprovePayoutProcess={setShowApprovePayoutProcess}
//                 setInterval={setInterval}
//                 setFeeBlockTarget={setFeeBlockTarget}
//                 setThreshold={setThreshold}
//               />
//             </Box>
//           </Box>
//         </Box>
//       ) : (
//         <Box>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//             <Typography variant="h6">{FindChainNamesByChains(configureChain)} Payout Processors</Typography>
//             <Button
//               variant={'contained'}
//               onClick={() => {
//                 clearData();
//                 setIsConfigure(false);
//               }}
//             >
//               back
//             </Button>
//           </Stack>
//           <Typography mt={2}>Set a schedule for automated {FindChainNamesByChains(configureChain)} Payouts.</Typography>
//           <Stack direction={'row'} alignItems={'center'} mt={1}>
//             <Switch
//               checked={showApprovePayoutProcess}
//               onChange={() => {
//                 setShowApprovePayoutProcess(!showApprovePayoutProcess);
//               }}
//             />
//             <Typography ml={2}>Process approved payouts instantly</Typography>
//           </Stack>
//           <Box mt={1}>
//             <Typography>Interval*</Typography>
//             <Box mt={1}>
//               <FormControl sx={{ width: '25ch' }} variant="outlined">
//                 <OutlinedInput
//                   size={'small'}
//                   type="number"
//                   endAdornment={<InputAdornment position="end">minutes</InputAdornment>}
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={interval}
//                   onChange={(e: any) => {
//                     setInterval(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//           <Box mt={2}>
//             <Typography>Fee block target*</Typography>
//             <Box mt={1}>
//               <FormControl sx={{ width: '25ch' }} variant="outlined">
//                 <OutlinedInput
//                   size={'small'}
//                   type="number"
//                   endAdornment={<InputAdornment position="end">blocks</InputAdornment>}
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={feeBlockTarget}
//                   onChange={(e: any) => {
//                     setFeeBlockTarget(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//           </Box>
//           <Box mt={2}>
//             <Typography>Threshold*</Typography>
//             <Box mt={1}>
//               <FormControl sx={{ width: '25ch' }} variant="outlined">
//                 <OutlinedInput
//                   size={'small'}
//                   type="number"
//                   endAdornment={<InputAdornment position="end">USD</InputAdornment>}
//                   aria-describedby="outlined-weight-helper-text"
//                   inputProps={{
//                     'aria-label': 'weight',
//                   }}
//                   value={threshold}
//                   onChange={(e: any) => {
//                     setThreshold(e.target.value);
//                   }}
//                 />
//               </FormControl>
//             </Box>
//             <Typography mt={1} fontWeight={14}>
//               Only process payouts when this payout sum is reached.
//             </Typography>
//           </Box>

//           <Box mt={5}>
//             <Button size="large" variant={'contained'} onClick={onClickSave} color={'success'}>
//               Save
//             </Button>
//           </Box>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default Payout;

// type TableType = {
//   setId: (value: number) => void;
//   setIsConfigure: (value: boolean) => void;
//   setConfigureChain: (value: CHAINS) => void;
//   setShowApprovePayoutProcess: (value: boolean) => void;
//   setInterval: (value: number) => void;
//   setFeeBlockTarget: (value: number) => void;
//   setThreshold: (value: number) => void;
// };

// type RowType = {
//   id: number;
//   pid: number;
//   chainId: CHAINS;
//   showApprovePayoutProcess: boolean;
//   interval: number;
//   feeBlockTarget: number;
//   threshold: number;
// };

// function StorePayoutTable(props: TableType) {
//   const [rows, setRows] = useState<RowType[]>([]);

//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { getUserId, getNetwork } = useUserPresistStore((state) => state);

//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const onClickConfigure = async (row: RowType) => {
//     props.setId(row.pid);
//     props.setConfigureChain(row.chainId);
//     props.setShowApprovePayoutProcess(row.showApprovePayoutProcess);
//     props.setInterval(row.interval);
//     props.setFeeBlockTarget(row.feeBlockTarget);
//     props.setThreshold(row.threshold);

//     props.setIsConfigure(true);
//   };

//   const findPayout = async () => {
//     try {
//       const response: any = await axios.get(Http.find_payout_setting, {
//         params: {
//           user_id: getUserId(),
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });

//       if (response.result) {
//         if (response.data.length > 0) {
//           let rt: RowType[] = [];
//           response.data.forEach(async (item: any, index: number) => {
//             rt.push({
//               id: index + 1,
//               pid: item.id,
//               chainId: item.chain_id,
//               showApprovePayoutProcess: item.show_approve_payout_process === 1 ? true : false,
//               interval: item.interval,
//               feeBlockTarget: item.fee_block_target,
//               threshold: item.threshold,
//             });
//           });
//           setRows(rt);
//         } else {
//           setRows([]);
//         }
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const init = async () => {
//     await findPayout();
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <TableContainer component={Paper}>
//       <Table sx={{ minWidth: 650 }} aria-label="simple table">
//         <TableHead>
//           <TableRow>
//             <TableCell>Payment Method</TableCell>
//             <TableCell align="right">Actions</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {rows && rows.length > 0 ? (
//             <>
//               {rows.map((row) => (
//                 <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
//                   <TableCell component="th" scope="row">
//                     {FindChainNamesByChains(row.chainId)}
//                   </TableCell>
//                   <TableCell align="right">
//                     <Button
//                       onClick={() => {
//                         onClickConfigure(row);
//                       }}
//                     >
//                       Configure
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </>
//           ) : (
//             <TableRow>
//               <TableCell colSpan={100} align="center">
//                 No rows
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// }

import { useEffect, useState } from 'react'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CHAINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { FindChainNamesByChains } from '@/utils/web3'

const Payout = () => {
  const [id, setId] = useState<number>(0)
  const [isConfigure, setIsConfigure] = useState<boolean>(false)
  const [configureChain, setConfigureChain] = useState<CHAINS>(CHAINS.BITCOIN)
  const [showApprovePayoutProcess, setShowApprovePayoutProcess] = useState<boolean>(false)
  const [interval, setInterval] = useState<number>(0)
  const [feeBlockTarget, setFeeBlockTarget] = useState<number>(0)
  const [threshold, setThreshold] = useState<number>(0)

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state)

  const onClickSave = async () => {
    try {
      if (!id) {
        return
      }

      const response: any = await axios.put(Http.update_payout_setting_by_id, {
        id: id,
        show_approve_payout_process: showApprovePayoutProcess ? 1 : 2,
        interval: interval,
        fee_block_target: feeBlockTarget,
        threshold: threshold,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Update successful!')
        setSnackOpen(true)

        setIsConfigure(false)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      clearData()
    }
  }

  const clearData = () => {
    setId(0)
    setConfigureChain(CHAINS.BITCOIN)
    setShowApprovePayoutProcess(false)
    setInterval(0)
    setFeeBlockTarget(0)
    setThreshold(0)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {!isConfigure ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Payout Processors
            </h3>
            <p className="text-sm text-muted-foreground">
              Payout Processors allow CryptoPay Server to handle payouts in an automated way.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Automated Crypto Sender
            </h3>

            <div className="pt-2">
              <StorePayoutTable
                setId={setId}
                setIsConfigure={setIsConfigure}
                setConfigureChain={setConfigureChain}
                setShowApprovePayoutProcess={setShowApprovePayoutProcess}
                setInterval={setInterval}
                setFeeBlockTarget={setFeeBlockTarget}
                setThreshold={setThreshold}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {FindChainNamesByChains(configureChain)} Payout Processors
            </h3>
            <Button
              variant="outline"
              onClick={() => {
                clearData()
                setIsConfigure(false)
              }}
            >
              Back
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Set a schedule for automated {FindChainNamesByChains(configureChain)} Payouts.
          </p>

          <div className="flex items-center space-x-3 pt-2">
            <Switch
              id="instant-payouts"
              checked={showApprovePayoutProcess}
              onCheckedChange={setShowApprovePayoutProcess}
            />
            <Label htmlFor="instant-payouts" className="cursor-pointer">
              Process approved payouts instantly
            </Label>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="interval">Interval*</Label>
            <div className="relative w-64">
              <Input
                id="interval"
                type="number"
                value={interval || ''}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                minutes
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="fee-block-target">Fee block target*</Label>
            <div className="relative w-64">
              <Input
                id="fee-block-target"
                type="number"
                value={feeBlockTarget || ''}
                onChange={(e) => setFeeBlockTarget(Number(e.target.value))}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                blocks
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="threshold">Threshold*</Label>
            <div className="relative w-64">
              <Input
                id="threshold"
                type="number"
                value={threshold || ''}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                USD
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Only process payouts when this payout sum is reached.
            </p>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={onClickSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-8"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payout

type TableType = {
  setId: (value: number) => void
  setIsConfigure: (value: boolean) => void
  setConfigureChain: (value: CHAINS) => void
  setShowApprovePayoutProcess: (value: boolean) => void
  setInterval: (value: number) => void
  setFeeBlockTarget: (value: number) => void
  setThreshold: (value: number) => void
}

type RowType = {
  id: number
  pid: number
  chainId: CHAINS
  showApprovePayoutProcess: boolean
  interval: number
  feeBlockTarget: number
  threshold: number
}

function StorePayoutTable(props: TableType) {
  const [rows, setRows] = useState<RowType[]>([])

  const { getStoreId } = useStorePresistStore((state) => state)
  const { getUserId, getNetwork } = useUserPresistStore((state) => state)

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state)

  const onClickConfigure = (row: RowType) => {
    props.setId(row.pid)
    props.setConfigureChain(row.chainId)
    props.setShowApprovePayoutProcess(row.showApprovePayoutProcess)
    props.setInterval(row.interval)
    props.setFeeBlockTarget(row.feeBlockTarget)
    props.setThreshold(row.threshold)

    props.setIsConfigure(true)
  }

  const findPayout = async () => {
    try {
      const response: any = await axios.get(Http.find_payout_setting, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = []
          response.data.forEach((item: any, index: number) => {
            rt.push({
              id: index + 1,
              pid: item.id,
              chainId: item.chain_id,
              showApprovePayoutProcess: item.show_approve_payout_process === 1,
              interval: item.interval,
              feeBlockTarget: item.fee_block_target,
              threshold: item.threshold,
            })
          })
          setRows(rt)
        } else {
          setRows([])
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const init = async () => {
    await findPayout()
  }

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Method</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows && rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{FindChainNamesByChains(row.chainId)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onClickConfigure(row)}>
                    Configure
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
