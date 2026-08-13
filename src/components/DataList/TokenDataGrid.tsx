// import { Stack, Typography } from '@mui/material';
// import Box from '@mui/material/Box';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { useSnackPresistStore } from '@/lib/store';
// import { COINGECKO_IDS, CURRENCY, CURRENCY_SYMBOLS } from '@/packages/constants';
// import { COINS } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { GetImgSrcByCrypto } from '@/utils/qrcode';
// import Image from 'next/image';
// import { FormatNumberToEnglish } from '@/utils/strings';
// import { useTranslation } from 'react-i18next';

// type RowType = {
//   id: number;
//   coin: string;
//   price: string;
//   unit: string;
//   marketCap: number;
//   marketCapStr: string;
//   twentyFourHVol: string;
//   twentyFourHChange: number;
//   lastUpdatedAt: number;
// };

// type GridType = {
//   source: 'dashboard' | 'none';
// };

// export default function TokenDataGrid(props: GridType) {
//   const { t, i18n } = useTranslation('');
//   const { source } = props;
//   const [rows, setRows] = useState<RowType[]>([]);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const columns: GridColDef<(typeof rows)[number]>[] = [
//     { field: 'id', headerName: 'ID', width: 100 },
//     {
//       field: 'coin',
//       headerName: t('Name'),
//       width: 200,
//       renderCell: ({ row }) => (
//         <Stack direction={'row'} alignItems={'center'} height={'100%'}>
//           {GetImgSrcByCrypto(row.coin as COINS) && (
//             <Image src={GetImgSrcByCrypto(row.coin as COINS).toString()} alt="logo" width={20} height={20} />
//           )}
//           <Typography pl={2} fontWeight={'bold'}>
//             {row.coin}
//           </Typography>
//         </Stack>
//       ),
//     },
//     {
//       field: 'price',
//       headerName: t('Price'),
//       width: 200,
//     },
//     {
//       field: 'twentyFourHChange',
//       headerName: '24h %',
//       width: 200,
//       renderCell: ({ row }) => (
//         <Typography fontWeight={'bold'} mt={1} color={Number(row.twentyFourHChange) >= 0 ? 'green' : 'red'}>
//           {`${parseFloat(row.twentyFourHChange.toString()).toFixed(2)} %`}
//         </Typography>
//       ),
//     },
//     {
//       field: 'marketCapStr',
//       headerName: t('Market Cap'),
//       width: 200,
//     },
//     {
//       field: 'twentyFourHVol',
//       headerName: t('Volume') + '(24h)',
//       width: 200,
//     },
//   ];

//   const init = async () => {
//     try {
//       let ids: string[] = [];
//       Object.values(COINS).forEach((item) => {
//         ids.push(COINGECKO_IDS[item]);
//       });
//       const unit = CURRENCY[0];

//       const response: any = await axios.get(Http.find_crypto_price, {
//         params: {
//           ids: ids.length > 1 ? ids.join(',') : ids[0],
//           currency: unit,
//         },
//       });

//       if (response && response.result) {
//         let rt: RowType[] = [];

//         Object.values(COINS).forEach((item, index: number) => {
//           const price = response.data[COINGECKO_IDS[item]]['usd'];
//           const marketCap = response.data[COINGECKO_IDS[item]]['usd_market_cap'];
//           const twentyFourHVol = response.data[COINGECKO_IDS[item]]['usd_24h_vol'];
//           const twentyFourHChange = response.data[COINGECKO_IDS[item]]['usd_24h_change'];
//           const lastUpdatedAt = response.data[COINGECKO_IDS[item]]['last_updated_at'];

//           rt.push({
//             id: index + 1,
//             coin: item,
//             price: `${CURRENCY_SYMBOLS[unit]}${price}`,
//             unit: unit,
//             marketCap: marketCap,
//             marketCapStr: FormatNumberToEnglish(marketCap),
//             twentyFourHVol: FormatNumberToEnglish(twentyFourHVol),
//             twentyFourHChange: twentyFourHChange,
//             lastUpdatedAt: lastUpdatedAt,
//           });
//         });

//         rt.sort((a, b) => b.marketCap - a.marketCap);

//         setRows(rt);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage(t('The network error occurred. Please try again later.'));
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onClickRow = async (e: RowType) => {
//     // const txId = e.id;
//     // setSelectedValue(e);
//     // setOpen(true);
//   };

//   return (
//     <Box>
//       <DataGrid
//         autoHeight
//         rows={rows}
//         columns={columns}
//         initialState={{
//           pagination: {
//             paginationModel: {
//               pageSize: 10,
//             },
//           },
//         }}
//         pageSizeOptions={[10]}
//         onRowClick={(e: any) => {
//           onClickRow(e.row);
//         }}
//         // hideFooter={source === 'dashboard' ? true : false}
//         disableColumnMenu
//       />
//     </Box>
//   );
// }

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useSnackPresistStore } from '@/lib/store'
import { COINGECKO_IDS, CURRENCY, CURRENCY_SYMBOLS } from '@/packages/constants'
import { COINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { GetImgSrcByCrypto } from '@/utils/qrcode'
import { FormatNumberToEnglish } from '@/utils/strings'
import { cn } from '@/lib/utils'
import { useShallow } from 'zustand/react/shallow'

type RowType = {
  id: number
  coin: string
  price: string
  unit: string
  marketCap: number
  marketCapStr: string
  twentyFourHVol: string
  twentyFourHChange: number
  lastUpdatedAt: number
}

type GridType = {
  source: 'dashboard' | 'none'
}

const PAGE_SIZE = 10

export default function TokenDataGrid(props: GridType) {
  const { t } = useTranslation('')
  const { source } = props
  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(0)

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const init = async () => {
    try {
      const ids: string[] = []
      Object.values(COINS).forEach((item) => {
        ids.push(COINGECKO_IDS[item])
      })
      const unit = CURRENCY[0]

      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids.length > 1 ? ids.join(',') : ids[0],
          currency: unit,
        },
      })

      if (response && response.result) {
        const rt: RowType[] = []

        Object.values(COINS).forEach((item, index: number) => {
          const data = response.data[COINGECKO_IDS[item]]
          if (!data) return

          const price = data['usd']
          const marketCap = data['usd_market_cap']
          const twentyFourHVol = data['usd_24h_vol']
          const twentyFourHChange = data['usd_24h_change']
          const lastUpdatedAt = data['last_updated_at']

          rt.push({
            id: index + 1,
            coin: item,
            price: `${CURRENCY_SYMBOLS[unit]}${price}`,
            unit: unit,
            marketCap: marketCap,
            marketCapStr: FormatNumberToEnglish(marketCap),
            twentyFourHVol: FormatNumberToEnglish(twentyFourHVol),
            twentyFourHChange: twentyFourHChange,
            lastUpdatedAt: lastUpdatedAt,
          })
        })

        rt.sort((a, b) => b.marketCap - a.marketCap)
        setRows(rt)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage(t('The network error occurred. Please try again later.'))
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init()
  }, [])

  const displayRows = source === 'dashboard' ? rows.slice(0, PAGE_SIZE) : rows

  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE)
  const pagedRows =
    source === 'dashboard'
      ? displayRows
      : displayRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>{t('Name')}</TableHead>
              <TableHead>{t('Price')}</TableHead>
              <TableHead>24h %</TableHead>
              <TableHead>{t('Market Cap')}</TableHead>
              <TableHead>{t('Volume') + '(24h)'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => {
                const isPositive = Number(row.twentyFourHChange) >= 0
                const iconSrc = GetImgSrcByCrypto(row.coin as COINS)

                return (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {iconSrc && (
                          <Image
                            src={iconSrc.toString()}
                            alt={row.coin}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        <span className="font-semibold">{row.coin}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.price}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-semibold',
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {`${parseFloat(row.twentyFourHChange.toString()).toFixed(2)} %`}
                      </span>
                    </TableCell>
                    <TableCell>{row.marketCapStr}</TableCell>
                    <TableCell>{row.twentyFourHVol}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No tokens found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {source !== 'dashboard' && totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
