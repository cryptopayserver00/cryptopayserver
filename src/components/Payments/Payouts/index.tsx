// import { ReportGmailerrorred } from '@mui/icons-material';
// import { Alert, AlertTitle, Box, Container, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
// import { useEffect, useState } from 'react';
// import PayoutDataGrid from '../../DataList/PayoutDataGrid';
// import { PAYOUT_STATUS } from '@/packages/constants';

// const Payouts = () => {
//   const [openExplain, setOpenExplain] = useState<boolean>(false);

//   const [value, setValue] = useState(0);

//   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//     setValue(newValue);
//   };

//   useEffect;

//   return (
//     <Box>
//       <Container>
//         <Box>
//           <Stack direction={'row'} alignItems={'center'} pt={5}>
//             <Typography variant="h6">Payouts</Typography>
//             <IconButton
//               onClick={() => {
//                 setOpenExplain(!openExplain);
//               }}
//             >
//               <ReportGmailerrorred />
//             </IconButton>
//           </Stack>

//           {openExplain && (
//             <Alert severity="info">
//               <AlertTitle>Info</AlertTitle>
//               Payouts allow you to process pull payments, in the form of refunds, salary payouts, or withdrawals.
//               <br />
//               You can also configure payout processors to automate payouts.
//             </Alert>
//           )}

//           <Box mt={5}>
//             <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//               <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
//                 <Tab label={PAYOUT_STATUS.AwaitingApproval} {...a11yProps(0)} />
//                 <Tab label={PAYOUT_STATUS.AwaitingPayment} {...a11yProps(1)} />
//                 <Tab label={PAYOUT_STATUS.InProgress} {...a11yProps(2)} />
//                 <Tab label={PAYOUT_STATUS.Completed} {...a11yProps(3)} />
//                 <Tab label={PAYOUT_STATUS.Cancelled} {...a11yProps(4)} />ƒ
//               </Tabs>
//             </Box>
//             <CustomTabPanel value={value} index={0}>
//               <PayoutDataGrid status={PAYOUT_STATUS.AwaitingApproval} />
//             </CustomTabPanel>
//             <CustomTabPanel value={value} index={1}>
//               <PayoutDataGrid status={PAYOUT_STATUS.AwaitingPayment} />
//             </CustomTabPanel>
//             <CustomTabPanel value={value} index={2}>
//               <PayoutDataGrid status={PAYOUT_STATUS.InProgress} />
//             </CustomTabPanel>
//             <CustomTabPanel value={value} index={3}>
//               <PayoutDataGrid status={PAYOUT_STATUS.Completed} />
//             </CustomTabPanel>
//             <CustomTabPanel value={value} index={4}>
//               <PayoutDataGrid status={PAYOUT_STATUS.Cancelled} />
//             </CustomTabPanel>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Payouts;

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
import { Info } from 'lucide-react'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import PayoutDataGrid from '../../DataList/PayoutDataGrid'
import { PAYOUT_STATUS } from '@/packages/constants'

const Payouts = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)

  // Tab 列表项定义
  const tabList = [
    {
      key: 'awaitingApproval',
      label: PAYOUT_STATUS.AwaitingApproval,
      status: PAYOUT_STATUS.AwaitingApproval,
    },
    {
      key: 'awaitingPayment',
      label: PAYOUT_STATUS.AwaitingPayment,
      status: PAYOUT_STATUS.AwaitingPayment,
    },
    { key: 'inProgress', label: PAYOUT_STATUS.InProgress, status: PAYOUT_STATUS.InProgress },
    { key: 'completed', label: PAYOUT_STATUS.Completed, status: PAYOUT_STATUS.Completed },
    { key: 'cancelled', label: PAYOUT_STATUS.Cancelled, status: PAYOUT_STATUS.Cancelled },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* 标题栏与信息提示按钮 */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Payouts</h1>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setOpenExplain(!openExplain)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* 说明 Alert 区块 */}
      {openExplain && (
        <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Info</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
            Payouts allow you to process pull payments, in the form of refunds, salary payouts, or
            withdrawals.
            <br />
            You can also configure payout processors to automate payouts.
          </AlertDescription>
        </Alert>
      )}

      {/* Shadcn / Radix UI Tabs 组件 */}
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
          <TabsContent key={tab.key} value={tab.key} className="pt-2 focus-visible:outline-none">
            <PayoutDataGrid status={tab.status} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default Payouts
