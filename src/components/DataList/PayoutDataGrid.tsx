// import { Button } from '@mui/material';
// import Box from '@mui/material/Box';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { CURRENCY_SYMBOLS, PAYOUT_STATUS } from '@/packages/constants';
// import { CHAINS } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { OmitMiddleString } from '@/utils/strings';
// import { FindChainNamesByChains } from '@/utils/web3';

// type RowType = {
//   id: number;
//   chainId: number;
//   payoutId: number;
//   address: string;
//   createdDate: string;
//   crypto: string;
//   refunded: string;
//   sourceType: string;
//   externalPaymentId: number;
//   chainName: string;
//   transaction: string;
//   url: string;
// };

// type GridType = {
//   status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];
// };

// export default function PayoutDataGrid(props: GridType) {
//   const { getUserId, getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const [actionWidth, setActionWidth] = useState<number>(600);

//   const [rows, setRows] = useState<RowType[]>([]);

//   const columns: GridColDef<(typeof rows)[number]>[] = [
//     { field: 'id', headerName: 'ID', width: 50 },

//     {
//       field: 'chainName',
//       headerName: 'Chain',
//       width: 150,
//     },
//     {
//       field: 'crypto',
//       headerName: 'Crypto',
//       width: 150,
//     },
//     {
//       field: 'refunded',
//       headerName: 'Refunded',
//       width: 150,
//     },
//     {
//       field: 'address',
//       headerName: 'Address',
//       width: 250,
//       valueGetter: (value, row) => OmitMiddleString(value, 10),
//     },
//     {
//       field: 'sourceType',
//       headerName: 'Source Type',
//       width: 150,
//     },
//     {
//       field: 'externalPaymentId',
//       headerName: 'External Payment Id',
//       width: 200,
//     },
//     {
//       field: 'transaction',
//       headerName: 'Transaction',
//       width: 250,
//       valueGetter: (value, row) => OmitMiddleString(value, 10),
//     },
//     {
//       field: 'createdDate',
//       headerName: 'Start',
//       width: 200,
//     },
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       type: 'actions',
//       width: actionWidth,
//       getActions: ({ row }) => {
//         switch (props.status) {
//           case PAYOUT_STATUS.AwaitingApproval:
//             setActionWidth(200);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     onClickApprove(row);
//                   }}
//                 >
//                   Approve
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onClickCancel(row);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//               </>,
//             ];
//           case PAYOUT_STATUS.AwaitingPayment:
//             setActionWidth(600);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     onClickReject(row);
//                   }}
//                 >
//                   Reject payout transaction
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onClickSend(row);
//                   }}
//                 >
//                   Send
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onClickCancel(row);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onClickMarkPaid(row);
//                   }}
//                 >
//                   Mark as already paid
//                 </Button>
//               </>,
//             ];
//           case PAYOUT_STATUS.InProgress:
//             setActionWidth(300);
//             return [
//               <>
//                 <Button
//                   onClick={() => {
//                     onClickCancel(row);
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     onClickMarkPaid(row);
//                   }}
//                 >
//                   Mark as already paid
//                 </Button>
//               </>,
//             ];
//           default:
//             setActionWidth(200);
//             return [<></>];
//         }
//       },
//     },
//   ];

//   const onClickApprove = async (row: any) => {
//     try {
//       const response: any = await axios.put(Http.update_payout_by_id, {
//         id: row.payoutId,
//         payout_status: PAYOUT_STATUS.AwaitingPayment,
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

//   const onClickReject = async (row: any) => {
//     try {
//       const response: any = await axios.put(Http.update_payout_by_id, {
//         id: row.payoutId,
//         payout_status: PAYOUT_STATUS.AwaitingApproval,
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
//   const onClickSend = async (row: any) => {
//     switch (row.chainId) {
//       case CHAINS.BITCOIN:
//         window.location.href = '/wallets/bitcoin/send?payoutId=' + row.payoutId;
//         return;
//       case CHAINS.LITECOIN:
//         window.location.href = '/wallets/litecoin/send?payoutId=' + row.payoutId;
//         return;
//       case CHAINS.XRP:
//         window.location.href = '/wallets/xrp/send?payoutId=' + row.payoutId;
//         return;
//       case CHAINS.BITCOINCASH:
//         window.location.href = '/wallets/bitcoincash/send?payoutId=' + row.payoutId;
//         return;
//       case CHAINS.ETHEREUM ||
//         CHAINS.BSC ||
//         CHAINS.ARBITRUM ||
//         CHAINS.ARBITRUMNOVA ||
//         CHAINS.AVALANCHE ||
//         CHAINS.POLYGON ||
//         CHAINS.BASE ||
//         CHAINS.OPTIMISM:
//         window.location.href = `/wallets/send?chainId=${row.chainId}&payoutId=${row.payoutId}`;
//         return;
//       case CHAINS.TRON:
//         window.location.href = '/wallets/tron/send?payoutId=' + row.payoutId;
//         return;
//       case CHAINS.SOLANA:
//         window.location.href = '/wallets/solana/send?payoutId=' + row.payoutId;
//         return;
//       case CHAINS.TON:
//         window.location.href = '/wallets/ton/send?payoutId=' + row.payoutId;
//         return;
//       default:
//         console.error('No support right now!');
//     }
//   };

//   const onClickCancel = async (row: any) => {
//     try {
//       const response: any = await axios.put(Http.update_payout_by_id, {
//         id: row.payoutId,
//         payout_status: PAYOUT_STATUS.Cancelled,
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
//   const onClickMarkPaid = async (row: any) => {
//     try {
//       const response: any = await axios.put(Http.update_payout_by_id, {
//         id: row.payoutId,
//         payout_status: PAYOUT_STATUS.Completed,
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

//   const init = async (status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS]) => {
//     try {
//       const response: any = await axios.get(Http.find_payout, {
//         params: {
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           payout_status: status,
//         },
//       });
//       if (response.result) {
//         if (response.data.length > 0) {
//           let rt: RowType[] = [];
//           response.data.forEach(async (item: any, index: number) => {
//             rt.push({
//               id: index + 1,
//               payoutId: item.payout_id,
//               chainId: item.chain_id,
//               address: item.address,
//               createdDate: new Date(item.created_at).toLocaleString(),
//               refunded: CURRENCY_SYMBOLS[item.currency] + item.amount,
//               crypto: item.crypto,
//               sourceType: item.source_type,
//               externalPaymentId: item.external_payment_id,
//               chainName: FindChainNamesByChains(item.chain_id),
//               transaction: item.tx,
//               url: '',
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
//           if (e.row.url) {
//             window.location.href = e.row.url;
//           }
//         }}
//         disableColumnMenu
//       />
//     </Box>
//   );
// }

import { useEffect, useState } from 'react'
import { Check, X, Send, Ban, CircleCheck, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { CURRENCY_SYMBOLS, PAYOUT_STATUS } from '@/packages/constants'
import { CHAINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { OmitMiddleString } from '@/utils/strings'
import { FindChainNamesByChains } from '@/utils/web3'

type RowType = {
  id: number
  chainId: number
  payoutId: number
  address: string
  createdDate: string
  crypto: string
  refunded: string
  sourceType: string
  externalPaymentId: number
  chainName: string
  transaction: string
  url: string
}

type GridType = {
  status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS]
}

const PAGE_SIZE = 10

export default function PayoutDataGrid(props: GridType) {
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

  const currentNetwork = useUserPresistStore((state) => state.network)
  const currentStoreId = useStorePresistStore((state) => state.storeId)

  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(0)
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const updateStatus = async (
    payoutId: number,
    payout_status: string,
    successMsg = 'Update successful!'
  ) => {
    try {
      setLoadingId(payoutId)
      const response: any = await axios.put(Http.update_payout_by_id, {
        id: payoutId,
        payout_status,
      })
      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage(successMsg)
        setSnackOpen(true)
        await init(currentNetwork, currentStoreId, props.status)
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
      setLoadingId(null)
    }
  }

  const onClickApprove = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.AwaitingPayment)

  const onClickReject = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.AwaitingApproval)

  const onClickCancel = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.Cancelled)

  const onClickMarkPaid = (row: RowType) => updateStatus(row.payoutId, PAYOUT_STATUS.Completed)

  const onClickSend = (row: RowType) => {
    switch (row.chainId) {
      case CHAINS.BITCOIN:
        window.location.href = `/wallets/bitcoin/send?payoutId=${row.payoutId}`
        return
      case CHAINS.LITECOIN:
        window.location.href = `/wallets/litecoin/send?payoutId=${row.payoutId}`
        return
      case CHAINS.XRP:
        window.location.href = `/wallets/xrp/send?payoutId=${row.payoutId}`
        return
      case CHAINS.BITCOINCASH:
        window.location.href = `/wallets/bitcoincash/send?payoutId=${row.payoutId}`
        return
      case CHAINS.ETHEREUM:
      case CHAINS.BSC:
      case CHAINS.ARBITRUM:
      case CHAINS.ARBITRUMNOVA:
      case CHAINS.AVALANCHE:
      case CHAINS.POLYGON:
      case CHAINS.BASE:
      case CHAINS.OPTIMISM:
        window.location.href = `/wallets/send?chainId=${row.chainId}&payoutId=${row.payoutId}`
        return
      case CHAINS.TRON:
        window.location.href = `/wallets/tron/send?payoutId=${row.payoutId}`
        return
      case CHAINS.SOLANA:
        window.location.href = `/wallets/solana/send?payoutId=${row.payoutId}`
        return
      case CHAINS.TON:
        window.location.href = `/wallets/ton/send?payoutId=${row.payoutId}`
        return
      default:
        console.error('No support right now!')
    }
  }

  const init = async (
    currentNetwork: string,
    currentStoreId: number,
    status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS]
  ) => {
    try {
      const response: any = await axios.get(Http.find_payout, {
        params: {
          store_id: currentStoreId,
          network: currentNetwork === 'mainnet' ? 1 : 2,
          payout_status: status,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          const rt: RowType[] = response.data.map((item: any, index: number) => ({
            id: index + 1,
            payoutId: item.payout_id,
            chainId: item.chain_id,
            address: item.address,
            createdDate: new Date(item.created_at).toLocaleString(),
            refunded: CURRENCY_SYMBOLS[item.currency] + item.amount,
            crypto: item.crypto,
            sourceType: item.source_type,
            externalPaymentId: item.external_payment_id,
            chainName: FindChainNamesByChains(item.chain_id),
            transaction: item.tx,
            url: '',
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
      init(currentNetwork, currentStoreId, props.status)
      setPage(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNetwork, currentStoreId, props.status])

  const totalPages = Math.ceil(rows.length / PAGE_SIZE)
  const pagedRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const renderActions = (row: RowType) => {
    const busy = loadingId === row.payoutId

    switch (props.status) {
      case PAYOUT_STATUS.AwaitingApproval:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickApprove(row)}
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => onClickCancel(row)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        )

      case PAYOUT_STATUS.AwaitingPayment:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickReject(row)}
            >
              <Ban className="h-3.5 w-3.5" />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickSend(row)}
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => onClickCancel(row)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickMarkPaid(row)}
            >
              <CircleCheck className="h-3.5 w-3.5" />
              Mark paid
            </Button>
          </div>
        )

      case PAYOUT_STATUS.InProgress:
        return (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => onClickCancel(row)}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              disabled={busy}
              onClick={() => onClickMarkPaid(row)}
            >
              <CircleCheck className="h-3.5 w-3.5" />
              Mark paid
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead>Chain</TableHead>
              <TableHead>Crypto</TableHead>
              <TableHead>Refunded</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Source Type</TableHead>
              <TableHead>External Payment Id</TableHead>
              <TableHead>Transaction</TableHead>
              <TableHead>Start</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.url ? 'cursor-pointer' : undefined}
                  onClick={() => {
                    if (row.url) window.location.href = row.url
                  }}
                >
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.chainName}</TableCell>
                  <TableCell>{row.crypto}</TableCell>
                  <TableCell>{row.refunded}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.address, 10)}
                  </TableCell>
                  <TableCell>{row.sourceType}</TableCell>
                  <TableCell>{row.externalPaymentId}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.transaction, 10)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {row.createdDate}
                  </TableCell>
                  <TableCell className="text-right">{renderActions(row)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No payouts found
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
