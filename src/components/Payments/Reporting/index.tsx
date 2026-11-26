import { useState } from 'react'
import { Download } from 'lucide-react'
import dayjs from 'dayjs'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, PageShell } from '@/components/Layout/PageHeader'

import { REPORT_STATUS } from '@/packages/constants'
import ReportDataGrid from '@/components/DataList/ReportDataGrid'
import { CHAINNAMES } from '@/packages/constants/blockchain'

export interface RowType {
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
    if (link.download) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `report-${dayjs().format('YYYYMMDD-HHmm')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)

      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Reporting"
        description="Review store payment data and export a CSV for the selected range."
        actions={
          <Button onClick={onClickExport} variant="outline" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-end gap-4 rounded-lg border bg-card p-4 sm:grid-cols-3">
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
          <Label>Start date</Label>
          <Input
            type="datetime-local"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>End date</Label>
          <Input
            type="datetime-local"
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
          />
        </div>
      </div>

      <ReportDataGrid
        status={reportStatus}
        startDate={new Date(startDateStr).getTime()}
        endDate={new Date(endDateStr).getTime()}
        rows={rows}
        setRows={setRows}
      />
    </PageShell>
  )
}

export default Reporting
