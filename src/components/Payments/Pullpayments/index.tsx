// import { ExpandMore, ReportGmailerrorred } from '@mui/icons-material';
// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Alert,
//   AlertTitle,
//   Box,
//   Button,
//   Checkbox,
//   Container,
//   FormControl,
//   FormControlLabel,
//   IconButton,
//   InputAdornment,
//   MenuItem,
//   OutlinedInput,
//   Select,
//   Stack,
//   Tab,
//   Tabs,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { CURRENCY, PULL_PAYMENT_STATUS } from '@/packages/constants';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import PullPaymentDataGrid from '@/components/DataList/PullPaymentDataGrid';

// const Pullpayments = () => {
//   const [openExplain, setOpenExplain] = useState<boolean>(false);
//   const [openCreatePullPayment, setOpenCreatePullPayment] = useState<boolean>(false);

//   const [value, setValue] = useState(0);
//   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//     setValue(newValue);
//   };

//   const [name, setName] = useState<string>('');
//   const [amount, setAmount] = useState<number>(0);
//   const [currency, setCurrency] = useState<string>(CURRENCY[0]);
//   const [showAutoApproveClaim, setShowAutoApproveClaim] = useState<boolean>(true);
//   const [description, setDescription] = useState<string>('');
//   const [showNameAlert, setShowNameAlert] = useState<boolean>(false);
//   const [showAmountAlert, setShowAmountAlert] = useState<boolean>(false);

//   const { getUserId, getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const clearData = () => {
//     setName('');
//     setAmount(0);
//     setCurrency(CURRENCY[0]);
//     setShowAutoApproveClaim(false);
//     setDescription('');
//   };

//   const checkName = (): boolean => {
//     if (name && name != '') {
//       setShowNameAlert(false);
//       return true;
//     }

//     setShowNameAlert(true);
//     return false;
//   };

//   const checkAmount = (): boolean => {
//     if (amount && amount > 0) {
//       setShowAmountAlert(false);
//       return true;
//     }

//     setShowAmountAlert(true);
//     return false;
//   };

//   const onClickCreate = async () => {
//     try {
//       if (!CURRENCY.includes(currency)) {
//         setSnackSeverity('error');
//         setSnackMessage('Incorrect currency');
//         setSnackOpen(true);
//         return;
//       }

//       if (!checkName()) {
//         return;
//       }

//       if (!checkAmount()) {
//         return;
//       }

//       const response: any = await axios.post(Http.create_pull_payment, {
//         user_id: getUserId(),
//         store_id: getStoreId(),
//         network: getNetwork() === 'mainnet' ? 1 : 2,
//         name: name,
//         amount: amount,
//         currency: currency,
//         show_auto_approve_claim: showAutoApproveClaim ? 1 : 2,
//         description: description,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful create!');
//         setSnackOpen(true);

//         clearData();
//         setOpenCreatePullPayment(false);
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
//         {openCreatePullPayment ? (
//           <Box>
//             <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
//               <Typography variant="h6">Create pull payment</Typography>
//               <Stack direction={'row'} alignItems={'center'} gap={1}>
//                 <Button
//                   variant={'contained'}
//                   onClick={() => {
//                     setOpenCreatePullPayment(false);
//                   }}
//                 >
//                   Back
//                 </Button>
//                 <Button variant={'contained'} onClick={onClickCreate} color="success">
//                   Create
//                 </Button>
//               </Stack>
//             </Stack>

//             <Box mt={4}>
//               <Stack direction={'row'} alignItems={'center'}>
//                 <Typography>Name</Typography>
//                 <Typography color={'red'}>*</Typography>
//               </Stack>
//               <Box mt={1}>
//                 <FormControl sx={{ width: 500 }} variant="outlined">
//                   <OutlinedInput
//                     size={'small'}
//                     aria-describedby="outlined-weight-helper-text"
//                     inputProps={{
//                       'aria-label': 'weight',
//                     }}
//                     value={name}
//                     onChange={(e: any) => {
//                       setName(e.target.value);
//                     }}
//                   />
//                 </FormControl>
//               </Box>
//               {showNameAlert && (
//                 <Typography mt={1} color={'red'}>
//                   The Name field is required.
//                 </Typography>
//               )}
//             </Box>

//             <Stack mt={4} alignItems={'baseline'} direction={'row'} gap={4}>
//               <Box width={'100%'}>
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Typography>Amount</Typography>
//                   <Typography color={'red'}>*</Typography>
//                 </Stack>
//                 <Box mt={1}>
//                   <FormControl sx={{ width: 500 }} variant="outlined">
//                     <OutlinedInput
//                       size={'small'}
//                       type="number"
//                       aria-describedby="outlined-weight-helper-text"
//                       inputProps={{
//                         'aria-label': 'weight',
//                       }}
//                       value={amount}
//                       onChange={(e: any) => {
//                         setAmount(e.target.value);
//                       }}
//                     />
//                   </FormControl>
//                 </Box>
//                 {showAmountAlert && (
//                   <Typography mt={1} color={'red'}>
//                     Please provide an amount greater than 0
//                   </Typography>
//                 )}
//               </Box>
//               <Box width={'100%'}>
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Typography>Currency</Typography>
//                   <Typography color={'red'}>*</Typography>
//                 </Stack>
//                 <Box mt={1}>
//                   <FormControl fullWidth>
//                     <Select
//                       size={'small'}
//                       inputProps={{ 'aria-label': 'Without label' }}
//                       value={currency}
//                       onChange={(e: any) => {
//                         setCurrency(e.target.value);
//                       }}
//                     >
//                       {CURRENCY &&
//                         CURRENCY.length > 0 &&
//                         CURRENCY.map((item, index) => (
//                           <MenuItem value={item} key={index}>
//                             {item}
//                           </MenuItem>
//                         ))}
//                     </Select>
//                   </FormControl>
//                 </Box>
//               </Box>
//             </Stack>

//             <Box mt={4}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={showAutoApproveClaim}
//                     onChange={() => {
//                       setShowAutoApproveClaim(!showAutoApproveClaim);
//                     }}
//                   />
//                 }
//                 label="Automatically approve claims"
//               />
//             </Box>

//             {/* <Box mt={4}>
//               <Typography>Payout Methods</Typography>
//               <Box mt={1}>
//                 <FormControlLabel control={<Checkbox defaultChecked />} label="chain" />
//               </Box>
//             </Box> */}

//             <Box mt={4}>
//               <Typography>Description</Typography>
//               <Box mt={1}>
//                 <TextField
//                   multiline
//                   rows={10}
//                   fullWidth
//                   value={description}
//                   onChange={(e: any) => {
//                     setDescription(e.target.value);
//                   }}
//                 />
//               </Box>
//             </Box>
//           </Box>
//         ) : (
//           <Box>
//             <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
//               <Stack direction={'row'} alignItems={'center'}>
//                 <Typography variant="h6">Pull payments</Typography>
//                 <IconButton
//                   onClick={() => {
//                     setOpenExplain(!openExplain);
//                   }}
//                 >
//                   <ReportGmailerrorred />
//                 </IconButton>
//               </Stack>
//               <Button
//                 variant={'contained'}
//                 onClick={() => {
//                   setOpenCreatePullPayment(true);
//                 }}
//               >
//                 Create pull payment
//               </Button>
//             </Stack>

//             {openExplain && (
//               <Alert severity="info">
//                 <AlertTitle>Info</AlertTitle>
//                 Pull Payments allow receivers to claim specified funds from your wallet at their convenience.
//                 <br />
//                 Once submitted and approved, the funds will be released.
//               </Alert>
//             )}

//             <Box mt={5}>
//               <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                 <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
//                   <Tab label={PULL_PAYMENT_STATUS.Active} {...a11yProps(0)} />
//                   <Tab label={PULL_PAYMENT_STATUS.Expired} {...a11yProps(1)} />
//                   <Tab label={PULL_PAYMENT_STATUS.Settled} {...a11yProps(2)} />
//                   <Tab label={PULL_PAYMENT_STATUS.Archived} {...a11yProps(3)} />
//                   <Tab label={PULL_PAYMENT_STATUS.Future} {...a11yProps(4)} />
//                 </Tabs>
//               </Box>
//               <CustomTabPanel value={value} index={0}>
//                 <PullPaymentDataGrid status={PULL_PAYMENT_STATUS.Active} />
//               </CustomTabPanel>
//               <CustomTabPanel value={value} index={1}>
//                 <PullPaymentDataGrid status={PULL_PAYMENT_STATUS.Expired} />
//               </CustomTabPanel>
//               <CustomTabPanel value={value} index={2}>
//                 <PullPaymentDataGrid status={PULL_PAYMENT_STATUS.Settled} />
//               </CustomTabPanel>
//               <CustomTabPanel value={value} index={3}>
//                 <PullPaymentDataGrid status={PULL_PAYMENT_STATUS.Archived} />
//               </CustomTabPanel>
//               <CustomTabPanel value={value} index={4}>
//                 <PullPaymentDataGrid status={PULL_PAYMENT_STATUS.Future} />
//               </CustomTabPanel>
//             </Box>
//           </Box>
//         )}
//       </Container>
//     </Box>
//   );
// };

// export default Pullpayments;

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function CustomTabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <Box
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </Box>
//   );
// }

// function a11yProps(index: number) {
//   return {
//     id: `simple-tab-${index}`,
//     'aria-controls': `simple-tabpanel-${index}`,
//   };
// }

import { useState } from 'react'
import { Info, ArrowLeft, Plus } from 'lucide-react'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CURRENCY, PULL_PAYMENT_STATUS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import PullPaymentDataGrid from '@/components/DataList/PullPaymentDataGrid'

const Pullpayments = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)
  const [openCreatePullPayment, setOpenCreatePullPayment] = useState<boolean>(false)

  const [name, setName] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [currency, setCurrency] = useState<string>(CURRENCY[0])
  const [showAutoApproveClaim, setShowAutoApproveClaim] = useState<boolean>(true)
  const [description, setDescription] = useState<string>('')
  const [showNameAlert, setShowNameAlert] = useState<boolean>(false)
  const [showAmountAlert, setShowAmountAlert] = useState<boolean>(false)

  const { getUserId, getNetwork } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

  // Tab 选项卡数据源
  const tabList = [
    { key: 'active', label: PULL_PAYMENT_STATUS.Active, status: PULL_PAYMENT_STATUS.Active },
    { key: 'expired', label: PULL_PAYMENT_STATUS.Expired, status: PULL_PAYMENT_STATUS.Expired },
    { key: 'settled', label: PULL_PAYMENT_STATUS.Settled, status: PULL_PAYMENT_STATUS.Settled },
    { key: 'archived', label: PULL_PAYMENT_STATUS.Archived, status: PULL_PAYMENT_STATUS.Archived },
    { key: 'future', label: PULL_PAYMENT_STATUS.Future, status: PULL_PAYMENT_STATUS.Future },
  ]

  const clearData = () => {
    setName('')
    setAmount(0)
    setCurrency(CURRENCY[0])
    setShowAutoApproveClaim(false)
    setDescription('')
    setShowNameAlert(false)
    setShowAmountAlert(false)
  }

  const checkName = (): boolean => {
    if (name && name.trim() !== '') {
      setShowNameAlert(false)
      return true
    }
    setShowNameAlert(true)
    return false
  }

  const checkAmount = (): boolean => {
    if (amount && amount > 0) {
      setShowAmountAlert(false)
      return true
    }
    setShowAmountAlert(true)
    return false
  }

  const onClickCreate = async () => {
    try {
      if (!CURRENCY.includes(currency)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect currency')
        setSnackOpen(true)
        return
      }

      if (!checkName()) {
        return
      }

      if (!checkAmount()) {
        return
      }

      const response: any = await axios.post(Http.create_pull_payment, {
        user_id: getUserId(),
        store_id: getStoreId(),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        name: name,
        amount: amount,
        currency: currency,
        show_auto_approve_claim: showAutoApproveClaim ? 1 : 2,
        description: description,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful create!')
        setSnackOpen(true)

        clearData()
        setOpenCreatePullPayment(false)
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

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {openCreatePullPayment ? (
        <div className="space-y-6">
          {/* 页头操作区域 */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create Pull Payment
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenCreatePullPayment(false)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={onClickCreate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create
              </Button>
            </div>
          </div>

          {/* 表单卡片 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Pull Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2 max-w-md">
                <Label className="flex items-center gap-0.5">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (showNameAlert && e.target.value) setShowNameAlert(false)
                  }}
                  placeholder="Enter payment name"
                />
                {showNameAlert && (
                  <p className="text-xs text-destructive font-medium mt-1">
                    The Name field is required.
                  </p>
                )}
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(Number(e.target.value))
                      if (showAmountAlert && Number(e.target.value) > 0) setShowAmountAlert(false)
                    }}
                    placeholder="0.00"
                  />
                  {showAmountAlert && (
                    <p className="text-xs text-destructive font-medium mt-1">
                      Please provide an amount greater than 0
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-0.5">
                    Currency <span className="text-destructive">*</span>
                  </Label>
                  <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY &&
                        CURRENCY.length > 0 &&
                        CURRENCY.map((item, index) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Automatically approve claims Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="auto-approve"
                  checked={showAutoApproveClaim}
                  onCheckedChange={(checked) => setShowAutoApproveClaim(!!checked)}
                />
                <Label htmlFor="auto-approve" className="cursor-pointer font-normal text-sm">
                  Automatically approve claims
                </Label>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the purpose of this pull payment..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 页头及操作按钮 */}
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Pull Payments</h1>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setOpenExplain(!openExplain)}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setOpenCreatePullPayment(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create Pull Payment
            </Button>
          </div>

          {/* 说明 Alert 区块 */}
          {openExplain && (
            <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-300">Info</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
                Pull Payments allow receivers to claim specified funds from your wallet at their
                convenience.
                <br />
                Once submitted and approved, the funds will be released.
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs 切片区域 */}
          <Tabs defaultValue={tabList[0].key} className="w-full space-y-4">
            <div className="overflow-x-auto pb-1">
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
                {tabList.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {tabList.map((tab) => (
              <TabsContent
                key={tab.key}
                value={tab.key}
                className="pt-2 focus-visible:outline-none"
              >
                <PullPaymentDataGrid status={tab.status} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  )
}

export default Pullpayments
