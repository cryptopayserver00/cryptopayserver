// import { ReportGmailerrorred } from '@mui/icons-material';
// import {
//   Alert,
//   AlertTitle,
//   Box,
//   Button,
//   Container,
//   FormControl,
//   IconButton,
//   MenuItem,
//   Select,
//   Stack,
//   Typography,
// } from '@mui/material';
// import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
// import { useState } from 'react';
// import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { REPORT_STATUS } from '@/packages/constants';
// import dayjs, { Dayjs } from 'dayjs';
// import ReportDataGrid from '@/components/DataList/ReportDataGrid';
// import Papa from 'papaparse';
// import { CHAINNAMES } from '@/packages/constants/blockchain';

// export type RowType = {
//   id: number;
//   storeName: string;
//   orderId: number;
//   chainId: number;
//   chain: CHAINNAMES;
//   sourceType: string;
//   fiatAmount: string;
//   cryptoAmount: string;
//   rate: number;
//   description: string;
//   metadata: string;
//   buyerEmail: string;
//   orderStatus: string;
//   paymentMethod: string;
//   createdDate: string;
//   expirationDate: string;
// };

// const Reporting = () => {
//   const [openExplain, setOpenExplain] = useState<boolean>(false);
//   const [reportStatus, setReportStatus] = useState<string>(REPORT_STATUS.All);
//   const [startDate, setStartDate] = useState<Dayjs>(dayjs().add(-30, 'day'));
//   const [endDate, setEndDate] = useState<Dayjs>(dayjs());

//   const [rows, setRows] = useState<RowType[]>([]);

//   const onClickExport = () => {
//     const filterRows = rows.map(({ chainId, ...rest }) => rest);
//     const csv = Papa.unparse(filterRows);

//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

//     const link = document.createElement('a');
//     if (link.download !== undefined) {
//       const url = URL.createObjectURL(blob);
//       link.setAttribute('href', url);
//       link.setAttribute('download', 'data.csv');
//       link.style.visibility = 'hidden';
//       document.body.appendChild(link);

//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   return (
//     <Box>
//       <Container>
//         <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
//           <Stack direction={'row'} alignItems={'center'}>
//             <Typography variant="h6">Reporting</Typography>
//             <IconButton
//               onClick={() => {
//                 setOpenExplain(!openExplain);
//               }}
//             >
//               <ReportGmailerrorred />
//             </IconButton>
//           </Stack>
//           <Button variant={'contained'} onClick={onClickExport} color="success">
//             Export
//           </Button>
//         </Stack>

//         {openExplain && (
//           <Alert severity="info">
//             <AlertTitle>Info</AlertTitle>
//             Reporting will allow you to visualize and export CSV data of your store.
//             <br />A report consist of table of tabular data along with some useful aggregates.
//           </Alert>
//         )}

//         <Stack mt={5} direction={'row'} gap={3} alignItems={'baseline'}>
//           <FormControl sx={{ minWidth: 120 }}>
//             <Select
//               inputProps={{ 'aria-label': 'Without label' }}
//               value={reportStatus}
//               onChange={(e) => {
//                 setReportStatus(e.target.value);
//               }}
//             >
//               {REPORT_STATUS &&
//                 Object.entries(REPORT_STATUS).map((item, index) => (
//                   <MenuItem value={item[1]} key={index}>
//                     {item[1]}
//                   </MenuItem>
//                 ))}
//             </Select>
//           </FormControl>

//           <Box flex={1}>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DemoContainer components={['DateRangePicker']}>
//                 <DemoItem>
//                   <DateTimePicker
//                     value={startDate}
//                     onAccept={(value: any) => {
//                       setStartDate(value);
//                     }}
//                   />
//                 </DemoItem>
//               </DemoContainer>
//             </LocalizationProvider>
//           </Box>

//           <Box flex={1}>
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <DemoContainer components={['DateRangePicker']}>
//                 <DemoItem>
//                   <DateTimePicker
//                     value={endDate}
//                     onAccept={(value: any) => {
//                       setEndDate(value);
//                     }}
//                   />
//                 </DemoItem>
//               </DemoContainer>
//             </LocalizationProvider>
//           </Box>
//         </Stack>

//         <Box mt={5}>
//           <ReportDataGrid
//             status={reportStatus}
//             startDate={new Date(startDate.toString()).getTime()}
//             endDate={new Date(endDate.toString()).getTime()}
//             rows={rows}
//             setRows={setRows}
//           />
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Reporting;

import { useState } from 'react'
import { Info, Download } from 'lucide-react'
import dayjs from 'dayjs'
import Papa from 'papaparse'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { REPORT_STATUS } from '@/packages/constants'
import ReportDataGrid from '@/components/DataList/ReportDataGrid'
import { CHAINNAMES } from '@/packages/constants/blockchain'

export type RowType = {
  id: number
  storeName: string
  orderId: number
  chainId: number
  chain: CHAINNAMES
  sourceType: string
  fiatAmount: string
  cryptoAmount: string
  rate: number
  description: string
  metadata: string
  buyerEmail: string
  orderStatus: string
  paymentMethod: string
  createdDate: string
  expirationDate: string
}

// 辅助函数：将 Date / Dayjs 转为 datetime-local input 所需格式 "YYYY-MM-DDTHH:mm"
const formatForDateTimeInput = (date: Date | dayjs.Dayjs) => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm')
}

const Reporting = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)
  const [reportStatus, setReportStatus] = useState<string>(REPORT_STATUS.All)

  // 使用 string (YYYY-MM-DDTHH:mm) 存取，方便与 <Input type="datetime-local" /> 绑定
  const [startDateStr, setStartDateStr] = useState<string>(
    formatForDateTimeInput(dayjs().add(-30, 'day'))
  )
  const [endDateStr, setEndDateStr] = useState<string>(formatForDateTimeInput(dayjs()))

  const [rows, setRows] = useState<RowType[]>([])

  const onClickExport = () => {
    const filterRows = rows.map(({ chainId, ...rest }) => rest)
    const csv = Papa.unparse(filterRows)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'data.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)

      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* 标题栏与导出按钮 */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reporting</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setOpenExplain(!openExplain)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={onClickExport}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* 说明 Alert 区块 */}
      {openExplain && (
        <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Info</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 text-sm mt-1 leading-relaxed">
            Reporting will allow you to visualize and export CSV data of your store.
            <br />A report consist of table of tabular data along with some useful aggregates.
          </AlertDescription>
        </Alert>
      )}

      {/* 筛选条件工具栏 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        {/* Report Status 选择框 */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={reportStatus} onValueChange={(val) => setReportStatus(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_STATUS &&
                Object.entries(REPORT_STATUS).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* 开始时间 */}
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="datetime-local"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
          />
        </div>

        {/* 结束时间 */}
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="datetime-local"
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
          />
        </div>
      </div>

      {/* 数据表格区域 */}
      <div className="pt-2">
        <ReportDataGrid
          status={reportStatus}
          startDate={new Date(startDateStr).getTime()}
          endDate={new Date(endDateStr).getTime()}
          rows={rows}
          setRows={setRows}
        />
      </div>
    </div>
  )
}

export default Reporting
