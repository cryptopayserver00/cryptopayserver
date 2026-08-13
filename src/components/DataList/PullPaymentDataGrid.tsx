// import { Button } from '@mui/material';
// import Box from '@mui/material/Box';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { PULL_PAYMENT_STATUS } from '@/packages/constants';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';

// type RowType = {
//   id: number;
//   pullPaymentId: number;
//   name: string;
//   createdDate: string;
//   expirationDate: string;
//   showAutoApproveClaim: string;
//   refunded: number;
// };

// type GridType = {
//   status: (typeof PULL_PAYMENT_STATUS)[keyof typeof PULL_PAYMENT_STATUS];
// };

// export default function PullPaymentDataGrid(props: GridType) {
//   const { getUserId, getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const [actionWidth, setActionWidth] = useState<number>(300);

//   const [rows, setRows] = useState<RowType[]>([]);

//   const columns: GridColDef<(typeof rows)[number]>[] = [
//     { field: 'id', headerName: 'ID', width: 50 },
//     {
//       field: 'createdDate',
//       headerName: 'Start',
//       width: 200,
//     },
//     {
//       field: 'expirationDate',
//       headerName: 'End',
//       width: 200,
//     },
//     {
//       field: 'name',
//       headerName: 'Name',
//       width: 100,
//     },
//     {
//       field: 'showAutoApproveClaim',
//       headerName: 'Automatically Approved',
//       type: 'number',
//       width: 200,
//     },
//     {
//       field: 'refunded',
//       headerName: 'Refunded',
//       type: 'number',
//       width: 200,
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       type: 'actions',
//       width: actionWidth,
//       getActions: ({ row }) => {
//         switch (props.status) {
//           case PULL_PAYMENT_STATUS.Active:
//             setActionWidth(300);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     window.location.href = '/pull-payments/' + row.pullPaymentId;
//                   }}
//                 >
//                   View
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     window.location.href = '/payments/payouts';
//                   }}
//                 >
//                   Payouts
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onClickArchive(row.pullPaymentId);
//                   }}
//                 >
//                   Archive
//                 </Button>
//               </>,
//             ];
//           case PULL_PAYMENT_STATUS.Expired:
//             setActionWidth(200);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     window.location.href = '/pull-payments/' + row.pullPaymentId;
//                   }}
//                 >
//                   View
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onClickArchive(row.pullPaymentId);
//                   }}
//                 >
//                   Archive
//                 </Button>
//               </>,
//             ];
//           case PULL_PAYMENT_STATUS.Archived:
//             setActionWidth(200);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     window.location.href = '/pull-payments/' + row.pullPaymentId;
//                   }}
//                 >
//                   View
//                 </Button>
//               </>,
//             ];
//           case PULL_PAYMENT_STATUS.Settled:
//             setActionWidth(200);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     window.location.href = '/pull-payments/' + row.pullPaymentId;
//                   }}
//                 >
//                   View
//                 </Button>
//               </>,
//             ];
//           case PULL_PAYMENT_STATUS.Future:
//             setActionWidth(200);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     window.location.href = '/pull-payments/' + row.pullPaymentId;
//                   }}
//                 >
//                   View
//                 </Button>
//               </>,
//             ];
//           default:
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     window.location.href = '/pull-payments/' + row.pullPaymentId;
//                   }}
//                 >
//                   View
//                 </Button>
//               </>,
//             ];
//         }
//       },
//     },
//   ];

//   const onClickArchive = async (id: number) => {
//     try {
//       const response: any = await axios.put(Http.update_pull_payment_by_id, {
//         id: id,
//         pull_payment_status: PULL_PAYMENT_STATUS.Archived,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Update successful!');
//         setSnackOpen(true);

//         await init(props.status);
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

//   const init = async (status: (typeof PULL_PAYMENT_STATUS)[keyof typeof PULL_PAYMENT_STATUS]) => {
//     try {
//       const response: any = await axios.get(Http.find_pull_payment, {
//         params: {
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           pull_payment_status: status,
//         },
//       });
//       if (response.result) {
//         if (response.data.length > 0) {
//           let rt: RowType[] = [];
//           response.data.forEach(async (item: any, index: number) => {
//             rt.push({
//               id: index + 1,
//               pullPaymentId: item.pull_payment_id,
//               name: item.name,
//               createdDate: new Date(item.created_at).toLocaleString(),
//               expirationDate: new Date(item.expiration_at).toLocaleString(),
//               showAutoApproveClaim: item.show_auto_approve_claim === 1 ? 'True' : 'False',
//               refunded: item.refunded,
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
//     props.status && init(props.status);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [props.status]);

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
//           window.location.href = '/pull-payments/' + e.row.pullPaymentId;
//         }}
//         disableColumnMenu
//       />
//     </Box>
//   );
// }

import { useEffect, useState } from 'react'
import { ExternalLink, Archive, Wallet, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { PULL_PAYMENT_STATUS } from '@/packages/constants'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

type RowType = {
  id: number
  pullPaymentId: number
  name: string
  createdDate: string
  expirationDate: string
  showAutoApproveClaim: string
  refunded: number
}

type GridType = {
  status: (typeof PULL_PAYMENT_STATUS)[keyof typeof PULL_PAYMENT_STATUS]
}

const PAGE_SIZE = 10

export default function PullPaymentDataGrid(props: GridType) {
  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(0)
  const [archivingId, setArchivingId] = useState<number | null>(null)

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

  const onClickArchive = async (id: number) => {
    try {
      setArchivingId(id)
      const response: any = await axios.put(Http.update_pull_payment_by_id, {
        id,
        pull_payment_status: PULL_PAYMENT_STATUS.Archived,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Update successful!')
        setSnackOpen(true)
        await init(network, storeId, props.status)
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

  const init = async (
    network: string,
    storeId: number,
    status: (typeof PULL_PAYMENT_STATUS)[keyof typeof PULL_PAYMENT_STATUS]
  ) => {
    try {
      const response: any = await axios.get(Http.find_pull_payment, {
        params: {
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
          pull_payment_status: status,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = response.data.map((item: any, index: number) => ({
            id: index + 1,
            pullPaymentId: item.pull_payment_id,
            name: item.name,
            createdDate: new Date(item.created_at).toLocaleString(),
            expirationDate: new Date(item.expiration_at).toLocaleString(),
            showAutoApproveClaim: item.show_auto_approve_claim === 1 ? 'True' : 'False',
            refunded: item.refunded,
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
    if (props.status) {
      init(network, storeId, props.status)
      setPage(0)
    }
  }, [network, storeId, props.status])

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pagedRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const renderActions = (row: RowType) => {
    const viewBtn = (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5"
        onClick={(e: any) => {
          e.stopPropagation()
          window.location.href = `/pull-payments/${row.pullPaymentId}`
        }}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View
      </Button>
    )

    const archiveBtn = (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-muted-foreground"
        disabled={archivingId === row.pullPaymentId}
        onClick={(e: any) => {
          e.stopPropagation()
          onClickArchive(row.pullPaymentId)
        }}
      >
        <Archive className="h-3.5 w-3.5" />
        {archivingId === row.pullPaymentId ? 'Archiving...' : 'Archive'}
      </Button>
    )

    switch (props.status) {
      case PULL_PAYMENT_STATUS.Active:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            {viewBtn}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={(e: any) => {
                e.stopPropagation()
                window.location.href = '/payments/payouts'
              }}
            >
              <Wallet className="h-3.5 w-3.5" />
              Payouts
            </Button>
            {archiveBtn}
          </div>
        )

      case PULL_PAYMENT_STATUS.Expired:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            {viewBtn}
            {archiveBtn}
          </div>
        )

      case PULL_PAYMENT_STATUS.Archived:
      case PULL_PAYMENT_STATUS.Settled:
      case PULL_PAYMENT_STATUS.Future:
      default:
        return <div className="flex items-center justify-end gap-1">{viewBtn}</div>
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Automatically Approved</TableHead>
              <TableHead>Refunded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/pull-payments/${row.pullPaymentId}`
                  }}
                >
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {row.createdDate}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {row.expirationDate}
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.showAutoApproveClaim}</TableCell>
                  <TableCell>{row.refunded}</TableCell>
                  <TableCell className="text-right">{renderActions(row)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No pull payments found
                </TableCell>
              </TableRow>
            )}
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
    </div>
  )
}
