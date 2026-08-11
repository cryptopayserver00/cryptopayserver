// import { Button } from '@mui/material';
// import Box from '@mui/material/Box';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { CURRENCY_SYMBOLS, PAYMENT_REQUEST_STATUS } from '@/packages/constants';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';

// type RowType = {
//   id: number;
//   itemId: number;
//   paymentRequestId: number;
//   title: string;
//   amount: string;
//   expirationDate: string;
//   status: string;
// };

// type GridType = {
//   source: 'dashboard' | 'none';
//   paymentRequestStatus?: string;
//   paymentRequestId?: string;
// };

// export default function PaymentRequestDataGrid(props: GridType) {
//   const { source } = props;

//   const [rows, setRows] = useState<RowType[]>([]);

//   const { getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const onClickView = (row: any) => {
//     window.location.href = '/payment-requests/' + row.paymentRequestId;
//   };

//   const onClickArchive = async (row: RowType) => {
//     try {
//       const response: any = await axios.put(Http.update_payment_request_by_id, {
//         id: row.itemId,
//         payment_request_status: PAYMENT_REQUEST_STATUS.Archived,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Update successful!');
//         setSnackOpen(true);

//         await init();
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Update failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const columns: GridColDef<(typeof rows)[number]>[] = [
//     { field: 'id', headerName: 'ID', width: 50 },
//     {
//       field: 'paymentRequestId',
//       headerName: 'Payment Request Id',
//       width: 200,
//     },
//     {
//       field: 'title',
//       headerName: 'Title',
//       width: 200,
//     },
//     {
//       field: 'amount',
//       headerName: 'Amount',
//       width: 200,
//     },
//     {
//       field: 'status',
//       headerName: 'Status',
//       width: 200,
//     },
//     {
//       field: 'expirationDate',
//       headerName: 'Expiry',
//       width: 200,
//     },
//     {
//       field: 'actions',
//       type: 'actions',
//       headerName: 'Actions',
//       width: 200,
//       cellClassName: 'actions',
//       getActions: ({ row }) => {
//         return [
//           <Box key={row.id}>
//             <Button
//               onClick={() => {
//                 onClickView(row);
//               }}
//             >
//               View
//             </Button>
//             {row.status !== PAYMENT_REQUEST_STATUS.Archived && (
//               <Button
//                 onClick={async () => {
//                   await onClickArchive(row);
//                 }}
//               >
//                 Archive
//               </Button>
//             )}
//           </Box>,
//         ];
//       },
//     },
//   ];

//   const init = async () => {
//     try {
//       const response: any = await axios.get(Http.find_payment_request, {
//         params: {
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           payment_request_status: props.paymentRequestStatus,
//           payment_request_id: props.paymentRequestId,
//         },
//       });
//       if (response.result) {
//         if (response.data.length > 0) {
//           let rt: RowType[] = [];
//           response.data.forEach(async (item: any, index: number) => {
//             let expiry = 'No Expiry';
//             if (item.expiration_at) {
//               expiry = new Date(item.expiration_at).toLocaleString();
//             }
//             rt.push({
//               id: index + 1,
//               itemId: item.id,
//               paymentRequestId: item.payment_request_id,
//               amount: CURRENCY_SYMBOLS[item.currency] + item.amount,
//               title: item.title,
//               expirationDate: expiry,
//               status: item.payment_request_status,
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
//   }, [props.paymentRequestStatus, props.paymentRequestId]);

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
//           window.location.href = '/payment-requests/' + e.row.paymentRequestId;
//         }}
//         hideFooter={source === 'dashboard' ? true : false}
//         disableColumnMenu
//       />
//     </Box>
//   );
// }

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Archive, ExternalLink } from 'lucide-react'
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
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CURRENCY_SYMBOLS, PAYMENT_REQUEST_STATUS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'

type RowType = {
  id: number
  itemId: number
  paymentRequestId: number
  title: string
  amount: string
  expirationDate: string
  status: string
}

type GridType = {
  source: 'dashboard' | 'none'
  paymentRequestStatus?: string
  paymentRequestId?: string
}

const PAGE_SIZE = 10

export default function PaymentRequestDataGrid(props: GridType) {
  const { source } = props

  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(0)
  const [archivingId, setArchivingId] = useState<number | null>(null)

  const { getNetwork } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

  const onClickView = (row: RowType) => {
    window.location.href = `/payment-requests/${row.paymentRequestId}`
  }

  const onClickArchive = async (row: RowType) => {
    try {
      setArchivingId(row.itemId)
      const response: any = await axios.put(Http.update_payment_request_by_id, {
        id: row.itemId,
        payment_request_status: PAYMENT_REQUEST_STATUS.Archived,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Update successful!')
        setSnackOpen(true)
        await init()
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setArchivingId(null)
    }
  }

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_payment_request, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
          payment_request_status: props.paymentRequestStatus,
          payment_request_id: props.paymentRequestId,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = response.data.map((item: any, index: number) => {
            let expiry = 'No Expiry'
            if (item.expiration_at) {
              expiry = new Date(item.expiration_at).toLocaleString()
            }
            return {
              id: index + 1,
              itemId: item.id,
              paymentRequestId: item.payment_request_id,
              amount: CURRENCY_SYMBOLS[item.currency] + item.amount,
              title: item.title,
              expirationDate: expiry,
              status: item.payment_request_status,
            }
          })
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
    init()
    setPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.paymentRequestStatus, props.paymentRequestId])

  const displayRows = source === 'dashboard' ? rows.slice(0, PAGE_SIZE) : rows

  const totalPages = Math.ceil(displayRows.length / PAGE_SIZE)
  const pagedRows =
    source === 'dashboard'
      ? displayRows
      : displayRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const statusVariant = (status: string) => {
    const s = status?.toLowerCase() ?? ''
    if (s.includes('archive')) return 'secondary'
    if (s.includes('pending') || s.includes('active')) return 'default'
    if (s.includes('expire') || s.includes('cancel')) return 'destructive'
    return 'outline'
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>Payment Request Id</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell className="font-mono text-xs">{row.paymentRequestId}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.expirationDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-8"
                        onClick={(e: any) => {
                          e.stopPropagation()
                          onClickView(row)
                        }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Button>
                      {row.status !== PAYMENT_REQUEST_STATUS.Archived && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 h-8 text-muted-foreground"
                          disabled={archivingId === row.itemId}
                          onClick={(e: any) => {
                            e.stopPropagation()
                            onClickArchive(row)
                          }}
                        >
                          <Archive className="h-3.5 w-3.5" />
                          {archivingId === row.itemId ? 'Archiving...' : 'Archive'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No payment requests found
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
