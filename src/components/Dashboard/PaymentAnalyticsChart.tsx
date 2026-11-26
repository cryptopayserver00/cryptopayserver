import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { STORE_STAT_ITEM_TYPE, STORE_STAT_TIME_TYPE } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { getApiErrorMessage } from '@/utils/http/api-error'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

type ChartPoint = {
  label: string | number
  value: number
}

const PaymentAnalyticsChart = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [timeAlignment, setTimeAlignment] = useState<string>(STORE_STAT_TIME_TYPE.WEEK)
  const [itemAlignment, setItemAlignment] = useState<string>(STORE_STAT_ITEM_TYPE.DEAL_AMOUNT)

  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  const { storeId } = useStorePresistStore(
    useShallow((state) => ({
      storeId: state.storeId,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async (
    currentNetwork: string,
    currentStoreId: number,
    timeAlignment: string,
    itemAlignment: string
  ) => {
    try {
      if (!currentStoreId) return

      const response: any = await axios.get(Http.find_store_stat, {
        params: {
          id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
          time: timeAlignment,
          item: itemAlignment,
        },
      })

      if (response.result) {
        let labels: (string | number)[] = []

        switch (timeAlignment) {
          case STORE_STAT_TIME_TYPE.WEEK:
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            break
          case STORE_STAT_TIME_TYPE.MONTH:
            labels = Array.from({ length: 30 }, (_, i) => i + 1)
            break
          case STORE_STAT_TIME_TYPE.YEAR:
            labels = [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'June',
              'July',
              'Aug',
              'Sept',
              'Oct',
              'Nov',
              'Dec',
            ]
            break
        }

        const data: ChartPoint[] = labels.map((label, index) => ({
          label,
          value: response.data[index] ?? 0,
        }))

        setChartData(data)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(getApiErrorMessage(e))
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(network, storeId, timeAlignment, itemAlignment)
  }, [network, storeId, timeAlignment, itemAlignment])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Period
          </p>
          <RadioGroup
            value={timeAlignment}
            onValueChange={setTimeAlignment}
            className="flex flex-wrap gap-2"
          >
            {Object.entries(STORE_STAT_TIME_TYPE).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <RadioGroupItem value={value} id={`time-${key}`} className="peer sr-only" />
                <Label
                  htmlFor={`time-${key}`}
                  className="cursor-pointer rounded-md border px-3 py-1.5 text-sm font-normal text-muted-foreground transition-colors peer-data-[state=checked]:border-foreground peer-data-[state=checked]:bg-foreground peer-data-[state=checked]:text-background"
                >
                  {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Metric
          </p>
          <RadioGroup
            value={itemAlignment}
            onValueChange={setItemAlignment}
            className="flex flex-wrap gap-2"
          >
            {Object.entries(STORE_STAT_ITEM_TYPE).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <RadioGroupItem value={value} id={`item-${key}`} className="peer sr-only" />
                <Label
                  htmlFor={`item-${key}`}
                  className="cursor-pointer rounded-md border px-3 py-1.5 text-sm font-normal text-muted-foreground transition-colors peer-data-[state=checked]:border-foreground peer-data-[state=checked]:bg-foreground peer-data-[state=checked]:text-background"
                >
                  {value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground"
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
              }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PaymentAnalyticsChart
