// import { Dialog, Stack, Typography } from '@mui/material';
// import Box from '@mui/material/Box';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { FindChainNamesByChains } from '@/utils/web3';
// import { CURRENCY_SYMBOLS, PAID_STATUS, REPORT_STATUS } from '@/packages/constants';
// import { RowType } from '@/components/Payments/Reporting';

// type GridType = {
//   startDate: number;
//   endDate: number;
//   status: (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
//   rows: RowType[];
//   setRows: ([]) => void;
// };

// export default function ReportDataGrid(props: GridType) {
//   const { startDate, endDate, status, rows, setRows } = props;

//   const { getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const [open, setOpen] = useState(false);
//   const [selectedValue, setSelectedValue] = useState<RowType>();

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = (value: RowType) => {
//     setOpen(false);
//   };

//   const onClickRow = async (e: RowType) => {
//     setSelectedValue(e);
//     setOpen(true);
//   };

//   const columns: GridColDef<(typeof rows)[number]>[] = [
//     { field: 'id', headerName: 'ID', width: 50 },
//     {
//       field: 'storeName',
//       headerName: 'Store Name',
//       width: 100,
//     },
//     {
//       field: 'orderId',
//       headerName: 'Order Id',
//       width: 200,
//     },
//     {
//       field: 'fiatAmount',
//       headerName: 'Fiat Amount',
//       width: 100,
//     },
//     {
//       field: 'chain',
//       headerName: 'Chain',
//       width: 100,
//     },
//     {
//       field: 'cryptoAmount',
//       headerName: 'Crypto Amount',
//       width: 150,
//     },
//     {
//       field: 'rate',
//       headerName: 'Rate',
//       width: 150,
//     },
//     {
//       field: 'sourceType',
//       headerName: 'Source Type',
//       width: 140,
//     },
//     {
//       field: 'orderStatus',
//       headerName: 'Order Status',
//       width: 150,
//     },
//     {
//       field: 'createdDate',
//       headerName: 'Created Date',
//       width: 200,
//     },
//     {
//       field: 'expirationDate',
//       headerName: 'Expiration Date',
//       width: 200,
//     },
//   ];

//   const init = async () => {
//     try {
//       const response: any = await axios.get(Http.find_report, {
//         params: {
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           start_date: startDate,
//           end_date: endDate,
//           status: status,
//         },
//       });
//       if (response.result) {
//         if (response.data.length > 0) {
//           let rt: RowType[] = [];
//           response.data.forEach(async (item: any, index: number) => {
//             rt.push({
//               id: index + 1,
//               storeName: item.store_name,
//               sourceType: item.source_type,
//               orderId: item.order_id,
//               chainId: item.chain_id,
//               chain: FindChainNamesByChains(item.chain_id),
//               cryptoAmount: item.crypto_amount + ' ' + item.crypto,
//               fiatAmount: CURRENCY_SYMBOLS[item.currency] + item.amount,
//               rate: item.rate,
//               description: item.description,
//               metadata: item.metadata,
//               buyerEmail: item.buyer_email,
//               orderStatus: item.order_status,
//               paymentMethod: item.payment_method,
//               createdDate: new Date(item.created_at).toLocaleString(),
//               expirationDate: new Date(item.expiration_at).toLocaleString(),
//             });
//           });
//           setRows(rt);
//         } else {
//           setRows([]);
//         }
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Can not find the data on site!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [startDate, endDate, status]);

//   return (
//     <Box>
//       {rows && rows.length > 0 ? (
//         <>
//           <DataGrid
//             slotProps={{}}
//             autoHeight
//             rows={rows}
//             columns={columns}
//             initialState={{
//               pagination: {
//                 paginationModel: {
//                   pageSize: 10,
//                 },
//               },
//             }}
//             pageSizeOptions={[10]}
//             onRowClick={(e: any) => {
//               onClickRow(e.row);
//             }}
//             // checkboxSelection
//             // disableRowSelectionOnClick
//             // hideFooter={source === 'dashboard' ? true : false}
//             disableColumnMenu
//           />

//           <TxDialog row={selectedValue as RowType} open={open} onClose={handleClose} />
//         </>
//       ) : (
//         <Box>
//           <Typography variant="h6">Raw data</Typography>
//           <Typography mt={2}>No data</Typography>
//         </Box>
//       )}
//     </Box>
//   );
// }

// export type TxDialogProps = {
//   open: boolean;
//   row: RowType;
//   onClose: (value: RowType) => void;
// };

// function TxDialog(props: TxDialogProps) {
//   const { onClose, row, open } = props;

//   const { getNetwork } = useUserPresistStore((state) => state);

//   if (!row) return;

//   const handleClose = () => {
//     onClose(row);
//   };

//   return (
//     <Dialog onClose={handleClose} open={open} fullWidth>
//       <Box p={4}>
//         <Typography variant="h5">Report</Typography>
//         <Box mt={3}>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//             <Typography>Store Name</Typography>
//             <Typography>{row.storeName}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Order Id</Typography>
//             <Typography>{row.orderId}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Source Type</Typography>
//             <Typography>{row.sourceType}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Chain</Typography>
//             <Typography>{row.chain}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Fait Amount</Typography>
//             <Typography fontWeight={'bold'}>{row.fiatAmount}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Crypto Amount</Typography>
//             <Typography fontWeight={'bold'}>{row.cryptoAmount}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Description</Typography>
//             <Typography fontWeight={'bold'}>{row.description}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Metadata</Typography>
//             <Typography fontWeight={'bold'}>{row.metadata}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Buyer Email</Typography>
//             <Typography fontWeight={'bold'}>{row.buyerEmail}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Order Status</Typography>
//             <Typography fontWeight={'bold'}>{row.orderStatus}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Payment Method</Typography>
//             <Typography fontWeight={'bold'}>{row.paymentMethod}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Created Date</Typography>
//             <Typography>{row.createdDate}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Expiration Date</Typography>
//             <Typography>{row.expirationDate}</Typography>
//           </Stack>
//         </Box>
//       </Box>
//     </Dialog>
//   );
// }

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS, REPORT_STATUS } from '@/packages/constants'
import { FindChainNamesByChains } from '@/utils/web3'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { RowType } from '@/components/Payments/Reporting'
import { useShallow } from 'zustand/react/shallow'

type GridType = {
  startDate: number
  endDate: number
  status: (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS]
  rows: RowType[]
  setRows: (rows: RowType[]) => void
}

const PAGE_SIZE = 10

export default function ReportDataGrid(props: GridType) {
  const { startDate, endDate, status, rows, setRows } = props
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<RowType>()
  const [page, setPage] = useState(0)

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

  const onClickRow = (row: RowType) => {
    setSelectedValue(row)
    setOpen(true)
  }

  const init = async (
    storeId: number,
    network: string,
    startDate: number,
    endDate: number,
    status: string
  ) => {
    try {
      const response: any = await axios.get(Http.find_report, {
        params: {
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
          start_date: startDate,
          end_date: endDate,
          status: status,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = response.data.map((item: any, index: number) => ({
            id: index + 1,
            storeName: item.store_name,
            sourceType: item.source_type,
            orderId: item.order_id,
            chainId: item.chain_id,
            chain: FindChainNamesByChains(item.chain_id),
            cryptoAmount: item.crypto_amount + ' ' + item.crypto,
            fiatAmount: CURRENCY_SYMBOLS[item.currency] + item.amount,
            rate: item.rate,
            description: item.description,
            metadata: item.metadata,
            buyerEmail: item.buyer_email,
            orderStatus: item.order_status,
            paymentMethod: item.payment_method,
            createdDate: new Date(item.created_at).toLocaleString(),
            expirationDate: new Date(item.expiration_at).toLocaleString(),
          }))
          setRows(rt)
        } else {
          setRows([])
        }
      } else {
        setSnackSeverity('error')
        setSnackMessage('Can not find the data on site!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init(storeId, network, startDate, endDate, status)
    setPage(0)
  }, [storeId, network, startDate, endDate, status])

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pagedRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const statusVariant = (s: string) => {
    const v = s?.toLowerCase() ?? ''
    if (v.includes('paid') || v.includes('complete') || v.includes('success')) return 'default'
    if (v.includes('pending') || v.includes('await')) return 'secondary'
    if (v.includes('expire') || v.includes('fail') || v.includes('cancel')) return 'destructive'
    return 'outline'
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-medium">Raw data</p>
        <p className="mt-1 text-sm text-muted-foreground">No data</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Order Id</TableHead>
              <TableHead>Fiat Amount</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Crypto Amount</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Source Type</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Expiration Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onClickRow(row)}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.storeName}</TableCell>
                <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                <TableCell>{row.fiatAmount}</TableCell>
                <TableCell>{row.chain}</TableCell>
                <TableCell>{row.cryptoAmount}</TableCell>
                <TableCell>{row.rate}</TableCell>
                <TableCell>{row.sourceType}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.orderStatus)}>{row.orderStatus}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {row.createdDate}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {row.expirationDate}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
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

      <TxDialog row={selectedValue as RowType} open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export type TxDialogProps = {
  open: boolean
  row: RowType
  onClose: () => void
}

function DetailRow({
  label,
  value,
  bold,
}: {
  label: string
  value?: string | number
  bold?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-right break-all ${bold ? 'font-semibold' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}

function TxDialog(props: TxDialogProps) {
  const { onClose, row, open } = props

  if (!row) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-0.5 pt-2">
          <DetailRow label="Store Name" value={row.storeName} />
          <DetailRow label="Order Id" value={row.orderId} />
          <DetailRow label="Source Type" value={row.sourceType} />
          <DetailRow label="Chain" value={row.chain} />
          <Separator className="my-2" />
          <DetailRow label="Fiat Amount" value={row.fiatAmount} bold />
          <DetailRow label="Crypto Amount" value={row.cryptoAmount} bold />
          <DetailRow label="Rate" value={row.rate} />
          <Separator className="my-2" />
          <DetailRow label="Description" value={row.description} bold />
          <DetailRow label="Metadata" value={row.metadata} bold />
          <DetailRow label="Buyer Email" value={row.buyerEmail} bold />
          <DetailRow label="Order Status" value={row.orderStatus} bold />
          <DetailRow label="Payment Method" value={row.paymentMethod} bold />
          <Separator className="my-2" />
          <DetailRow label="Created Date" value={row.createdDate} />
          <DetailRow label="Expiration Date" value={row.expirationDate} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
