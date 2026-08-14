import { useState } from 'react'
import { Info, Download } from 'lucide-react'
import dayjs from 'dayjs'
import Papa from 'papaparse'
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

const formatForDateTimeInput = (date: Date | dayjs.Dayjs) => {
  return dayjs(date).format('YYYY-MM-DDTHH:mm')
}

const Reporting = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false)
  const [reportStatus, setReportStatus] = useState<string>(REPORT_STATUS.All)

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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

        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="datetime-local"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="datetime-local"
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
          />
        </div>
      </div>

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
