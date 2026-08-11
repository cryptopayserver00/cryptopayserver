// import { ReportGmailerrorred } from '@mui/icons-material';
// import {
//   Alert,
//   AlertTitle,
//   Box,
//   Container,
//   FormControl,
//   IconButton,
//   MenuItem,
//   OutlinedInput,
//   Select,
//   Stack,
//   Typography,
// } from '@mui/material';
// import { useState } from 'react';
// import TransactionDataGrid from '../../DataList/TransactionDataGrid';
// import { CHAINNAMES } from '@/packages/constants/blockchain';
// import { FindChainIdsByChainNames } from '@/utils/web3';
// import { useUserPresistStore } from '@/lib/store';

// const PaymentTransactions = () => {
//   const ALL_CHAINS = 'All Chains' as const;

//   const [openExplain, setOpenExplain] = useState<boolean>(false);
//   const [address, setAddress] = useState<string>('');
//   const [txChain, setTxChain] = useState<CHAINNAMES | typeof ALL_CHAINS>(ALL_CHAINS);

//   const { getNetwork } = useUserPresistStore((state) => state);

//   return (
//     <Box>
//       <Container>
//         <Box>
//           <Stack direction={'row'} alignItems={'center'} pt={5}>
//             <Typography variant="h6">Transactions</Typography>
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
//               The transaction data here is related to the address used by your store and all comes from a third-party
//               quick-scan platform.
//               <br />
//               You can search for all transactions associated with the address you use, filtering by conditions to find
//               different blockchains, times, and more.
//             </Alert>
//           )}

//           <Stack mt={5} direction={'row'} gap={2}>
//             <FormControl sx={{ width: 500 }} variant="outlined">
//               <OutlinedInput
//                 size={'small'}
//                 aria-describedby="outlined-weight-helper-text"
//                 inputProps={{
//                   'aria-label': 'weight',
//                 }}
//                 placeholder="Search address ..."
//                 value={address}
//                 onChange={(e) => {
//                   setAddress(e.target.value);
//                 }}
//               />
//             </FormControl>
//             <FormControl>
//               <Select
//                 size={'small'}
//                 inputProps={{ 'aria-label': 'Without label' }}
//                 value={txChain}
//                 onChange={(e: any) => {
//                   setTxChain((e.target.value as CHAINNAMES) || ALL_CHAINS);
//                 }}
//               >
//                 <MenuItem value={'All Chains'}>All Chains</MenuItem>
//                 {CHAINNAMES &&
//                   Object.entries(CHAINNAMES).map((item, index) => (
//                     <MenuItem value={item[1]} key={index}>
//                       {item[1]}
//                     </MenuItem>
//                   ))}
//               </Select>
//             </FormControl>
//           </Stack>

//           <Box mt={2}>
//             <TransactionDataGrid
//               source="none"
//               chain={txChain === ALL_CHAINS ? undefined : FindChainIdsByChainNames(txChain)}
//               network={getNetwork()}
//               address={address}
//             />
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default PaymentTransactions;

import { useState } from 'react'
import { Info, Search } from 'lucide-react'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import TransactionDataGrid from '../../DataList/TransactionDataGrid'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import { FindChainIdsByChainNames } from '@/utils/web3'
import { useUserPresistStore } from '@/lib/store'

const PaymentTransactions = () => {
  const ALL_CHAINS = 'All Chains' as const

  const [openExplain, setOpenExplain] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [txChain, setTxChain] = useState<CHAINNAMES | typeof ALL_CHAINS>(ALL_CHAINS)

  const { getNetwork } = useUserPresistStore((state) => state)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* 页头标题栏 */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transactions</h1>
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
            The transaction data here is related to the address used by your store and all comes
            from a third-party quick-scan platform.
            <br />
            You can search for all transactions associated with the address you use, filtering by
            conditions to find different blockchains, times, and more.
          </AlertDescription>
        </Alert>
      )}

      {/* 搜索与筛选工具栏 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 地址搜索框 */}
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search address ..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* 链类型筛选下拉框 */}
        <div className="w-full sm:w-56">
          <Select
            value={txChain}
            onValueChange={(val) => setTxChain((val as CHAINNAMES) || ALL_CHAINS)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CHAINS}>All Chains</SelectItem>
              {CHAINNAMES &&
                Object.entries(CHAINNAMES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 数据表格区域 */}
      <div className="pt-2">
        <TransactionDataGrid
          source="none"
          chain={txChain === ALL_CHAINS ? undefined : FindChainIdsByChainNames(txChain)}
          network={getNetwork()}
          address={address}
        />
      </div>
    </div>
  )
}

export default PaymentTransactions
