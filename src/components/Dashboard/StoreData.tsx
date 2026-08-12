// import { axisClasses, BarChart } from '@mui/x-charts';
// import { useEffect, useState } from 'react';
// import { Box, FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material';
// import { STORE_STAT_ITEM_TYPE, STORE_STAT_TIME_TYPE } from '@/packages/constants';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';

// type SeriesType = {
//   data: number[];
// };

// const StoreData = () => {
//   const [series, setSeries] = useState<SeriesType[]>([{ data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }]);
//   const [xAxis, setXAxis] = useState<any[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
//   const [timeAlignment, setTimeAlignment] = useState<string>(STORE_STAT_TIME_TYPE.WEEK);
//   const [itemAlignment, setItemAlignment] = useState<string>(STORE_STAT_ITEM_TYPE.DEAL_AMOUNT);

//   const { getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const init = async (timeAlignment: string, itemAlignment: string) => {
//     try {
//       if (!crypto) {
//         return;
//       }

//       const response: any = await axios.get(Http.fint_store_stat, {
//         params: {
//           id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           time: timeAlignment,
//           item: itemAlignment,
//         },
//       });

//       if (response.result) {
//         switch (timeAlignment) {
//           case STORE_STAT_TIME_TYPE.WEEK:
//             setXAxis(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
//             break;
//           case STORE_STAT_TIME_TYPE.MONTH:
//             setXAxis([
//               1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
//               30,
//             ]);
//             break;
//           case STORE_STAT_TIME_TYPE.YEAR:
//             setXAxis(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']);
//             break;
//         }
//         const newSeries: SeriesType[] = [
//           {
//             data: response.data,
//           },
//         ];
//         setSeries(newSeries);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     init(timeAlignment, itemAlignment);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [timeAlignment, itemAlignment]);

//   return (
//     <>
//       <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
//         <RadioGroup
//           row
//           value={timeAlignment}
//           onChange={(e) => {
//             setTimeAlignment(e.target.value);
//           }}
//         >
//           {STORE_STAT_TIME_TYPE &&
//             Object.entries(STORE_STAT_TIME_TYPE).map((item, index) => (
//               <FormControlLabel control={<Radio />} value={item[1]} label={item[1]} key={index} />
//             ))}
//         </RadioGroup>
//         <RadioGroup
//           row
//           value={itemAlignment}
//           onChange={(e) => {
//             setItemAlignment(e.target.value);
//           }}
//         >
//           {STORE_STAT_ITEM_TYPE &&
//             Object.entries(STORE_STAT_ITEM_TYPE).map((item, index) => (
//               <FormControlLabel control={<Radio />} value={item[1]} label={item[1]} key={index} />
//             ))}
//         </RadioGroup>
//       </Stack>

//       <Box mt={2}>
//         <BarChart xAxis={[{ scaleType: 'band', data: xAxis }]} series={series} height={300} />
//       </Box>
//     </>
//   );
// };

// export default StoreData;

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { STORE_STAT_ITEM_TYPE, STORE_STAT_TIME_TYPE } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'

type ChartPoint = {
  label: string | number
  value: number
}

const StoreData = () => {
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [timeAlignment, setTimeAlignment] = useState<string>(STORE_STAT_TIME_TYPE.WEEK)
  const [itemAlignment, setItemAlignment] = useState<string>(STORE_STAT_ITEM_TYPE.DEAL_AMOUNT)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)

  const currentNetwork = useUserPresistStore((state) => state.network)
  const currentStoreId = useStorePresistStore((state) => state.storeId)

  const init = async (
    currentNetwork: string,
    currentStoreId: number,
    timeAlignment: string,
    itemAlignment: string
  ) => {
    try {
      if (!crypto) return

      const response: any = await axios.get(Http.fint_store_stat, {
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
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(currentNetwork, currentStoreId, timeAlignment, itemAlignment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetwork, currentStoreId, timeAlignment, itemAlignment])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Time */}
        <RadioGroup
          value={timeAlignment}
          onValueChange={setTimeAlignment}
          className="flex flex-wrap gap-4"
        >
          {Object.entries(STORE_STAT_TIME_TYPE).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`time-${key}`} />
              <Label htmlFor={`time-${key}`} className="cursor-pointer text-sm font-normal">
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {/* Item */}
        <RadioGroup
          value={itemAlignment}
          onValueChange={setItemAlignment}
          className="flex flex-wrap gap-4"
        >
          {Object.entries(STORE_STAT_ITEM_TYPE).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`item-${key}`} />
              <Label htmlFor={`item-${key}`} className="cursor-pointer text-sm font-normal">
                {value}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
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

export default StoreData
