// import { Button, Dialog, Stack, Typography } from '@mui/material';
// import Box from '@mui/material/Box';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import Link from 'next/link';
// import { CHAINNAMES, CHAINS } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { OmitMiddleString } from '@/utils/strings';
// import { FindChainNamesByChains, GetBlockchainAddressUrlByChainIds, GetBlockchainTxUrlByChainIds } from '@/utils/web3';

// type RowType = {
//   id: number;
//   chainId: number;
//   chainName: CHAINNAMES;
//   hash: string;
//   address: string;
//   fromAddress: string;
//   toAddress: string;
//   token: string;
//   transactionType: string;
//   amount: number;
//   blockTimestamp: string;
// };

// type GridType = {
//   source: 'dashboard' | 'none';
//   chain?: CHAINS;
//   storeId?: number;
//   network: string;
//   address?: string;
// };

// export default function TransactionDataGrid(props: GridType) {
//   const { source } = props;

//   const [rows, setRows] = useState<RowType[]>([]);
//   const [page, setPage] = useState<number>(1);
//   const [pageSize, setPageSize] = useState<number>(10);
//   const [rowCount, setRowCount] = useState<number>(0);

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
//     // const txId = e.id;
//     setSelectedValue(e);
//     setOpen(true);
//   };

//   const columns: GridColDef<(typeof rows)[number]>[] = [
//     // { field: 'id', headerName: 'ID', width: 50 },
//     {
//       field: 'chainName',
//       headerName: 'Chain',
//       width: 100,
//     },
//     {
//       field: 'hash',
//       headerName: 'Hash',
//       width: 200,
//       valueGetter: (value, row) => OmitMiddleString(value, 10),
//     },
//     {
//       field: 'address',
//       headerName: 'Address',
//       width: 200,
//       valueGetter: (value, row) => OmitMiddleString(value, 10),
//     },

//     {
//       field: 'fromAddress',
//       headerName: 'FromAddress',
//       width: 200,
//       valueGetter: (value, row) => OmitMiddleString(value, 10),
//     },
//     {
//       field: 'toAddress',
//       headerName: 'ToAddress',
//       width: 200,
//       valueGetter: (value, row) => OmitMiddleString(value, 10),
//     },
//     {
//       field: 'token',
//       headerName: 'Token',
//       width: 100,
//     },
//     {
//       field: 'transactionType',
//       headerName: 'Transaction Type',
//       width: 100,
//     },

//     {
//       field: 'amount',
//       headerName: 'Amount',
//       width: 100,
//     },
//     {
//       field: 'blockTimestamp',
//       headerName: 'Block Timestamp',
//       width: 200,
//     },
//   ];

//   const init = async (
//     page: number,
//     pageSize: number,
//     chain: number,
//     storeId: number,
//     network: string,
//     address?: string,
//   ) => {
//     try {
//       const response: any = await axios.get(Http.find_transaction, {
//         params: {
//           chain_id: chain ? chain : '',
//           store_id: storeId ? storeId : getStoreId(),
//           network: network ? (network === 'mainnet' ? 1 : 2) : getNetwork() === 'mainnet' ? 1 : 2,
//           address: address ? address : '',
//           page: page,
//           page_size: pageSize,
//         },
//       });
//       if (response.result) {
//         if (response.data.transactions.length > 0) {
//           let rt: RowType[] = [];
//           response.data.transactions.forEach(async (item: any, index: number) => {
//             rt.push({
//               id: index + 1,
//               chainId: item.chain_id,
//               chainName: FindChainNamesByChains(item.chain_id),
//               hash: item.hash,
//               address: item.address,
//               fromAddress: item.from_address,
//               toAddress: item.to_address,
//               token: item.token,
//               transactionType: item.transact_type,
//               amount: item.amount,
//               blockTimestamp: new Date(item.block_timestamp).toLocaleString(),
//             });
//           });
//           setRows(rt);
//           setPage(Number(response.data.page));
//           setPageSize(Number(response.data.pageSize));
//           setRowCount(Number(response.data.total));
//         } else {
//           setRows([]);
//           setPage(1);
//           setPageSize(10);
//           setRowCount(0);
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

//   const onClickPreviousPage = async () => {
//     const newPage = page - 1;
//     setPage(newPage);
//     await init(newPage, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
//   };

//   const onClickNextPage = async () => {
//     const newPage = page + 1;
//     setPage(newPage);
//     await init(newPage, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
//   };

//   const onClickSearch = async () => {
//     await init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
//   };

//   useEffect(() => {
//     const activeInit = setInterval(() => {
//       init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
//     }, 10 * 1000);

//     return () => clearInterval(activeInit);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [props.chain, props.storeId, props.network, props.address]);

//   useEffect(() => {
//     init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [props.chain, props.storeId, props.network, props.address]);

//   return (
//     <Box>
//       <DataGrid
//         autoHeight
//         rows={rows}
//         columns={columns}
//         initialState={{
//           pagination: {
//             paginationModel: {
//               pageSize: pageSize,
//               page: page,
//             },
//           },
//         }}
//         pageSizeOptions={[pageSize]}
//         onRowClick={(e: any) => {
//           onClickRow(e.row);
//         }}
//         // checkboxSelection
//         // disableRowSelectionOnClick
//         // hideFooter={source === 'dashboard' ? true : false}
//         hideFooter={true}
//         disableColumnMenu
//       />

//       <Stack direction={'row'} alignItems={'center'} justifyContent={'right'} my={2} gap={2}>
//         <Button
//           variant={'contained'}
//           onClick={() => {
//             onClickPreviousPage();
//           }}
//         >
//           Previous page
//         </Button>
//         <Button
//           variant={'contained'}
//           onClick={() => {
//             onClickNextPage();
//           }}
//         >
//           Next page
//         </Button>
//       </Stack>

//       <TxDialog row={selectedValue as RowType} open={open} onClose={handleClose} network={props.network} />
//     </Box>
//   );
// }

// export type TxDialogProps = {
//   open: boolean;
//   row: RowType;
//   onClose: (value: RowType) => void;
//   network: string;
// };

// function TxDialog(props: TxDialogProps) {
//   const { onClose, row, open, network } = props;

//   if (!row) return;

//   const handleClose = () => {
//     onClose(row);
//   };

//   return (
//     <Dialog onClose={handleClose} open={open} fullWidth>
//       <Box p={4}>
//         <Typography variant="h5">Transaction</Typography>
//         <Box mt={3}>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//             <Typography>Chain</Typography>
//             <Typography>{row.chainName}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Hash</Typography>
//             <Link
//               href={GetBlockchainTxUrlByChainIds(network === 'mainnet' ? true : false, row.chainId, row.hash)}
//               target="_blank"
//             >
//               {OmitMiddleString(row.hash, 10)}
//             </Link>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Address</Typography>
//             <Link
//               href={GetBlockchainAddressUrlByChainIds(network === 'mainnet' ? true : false, row.chainId, row.address)}
//               target="_blank"
//             >
//               {row.address}
//             </Link>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>From Address</Typography>
//             <Link
//               href={GetBlockchainAddressUrlByChainIds(
//                 network === 'mainnet' ? true : false,
//                 row.chainId,
//                 row.fromAddress,
//               )}
//               target="_blank"
//             >
//               {row.fromAddress}
//             </Link>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>To Address</Typography>
//             <Link
//               href={GetBlockchainAddressUrlByChainIds(network === 'mainnet' ? true : false, row.chainId, row.toAddress)}
//               target="_blank"
//             >
//               {row.toAddress}
//             </Link>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Token</Typography>
//             <Typography fontWeight={'bold'}>{row.token}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Transaction Type</Typography>
//             <Typography>{row.transactionType}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Amount</Typography>
//             <Typography fontWeight={'bold'}>{row.amount}</Typography>
//           </Stack>
//           <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
//             <Typography>Block Timestamp</Typography>
//             <Typography>{row.blockTimestamp}</Typography>
//           </Stack>
//         </Box>
//       </Box>
//     </Dialog>
//   );
// }

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CHAINNAMES, CHAINS } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { OmitMiddleString } from '@/utils/strings'
import {
  FindChainNamesByChains,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
} from '@/utils/web3'

type RowType = {
  id: number
  chainId: number
  chainName: CHAINNAMES
  hash: string
  address: string
  fromAddress: string
  toAddress: string
  token: string
  transactionType: string
  amount: number
  blockTimestamp: string
}

type GridType = {
  source: 'dashboard' | 'none'
  chain?: CHAINS
  storeId?: number
  network: string
  address?: string
}

export default function TransactionDataGrid(props: GridType) {
  const [rows, setRows] = useState<RowType[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [rowCount, setRowCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState<RowType>()

  const { getNetwork } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

  const onClickRow = (row: RowType) => {
    setSelectedValue(row)
    setOpen(true)
  }

  const init = async (
    pageNum: number,
    size: number,
    chain: number,
    storeId: number,
    network: string,
    address?: string
  ) => {
    try {
      const response: any = await axios.get(Http.find_transaction, {
        params: {
          chain_id: chain ? chain : '',
          store_id: storeId ? storeId : getStoreId(),
          network: network ? (network === 'mainnet' ? 1 : 2) : getNetwork() === 'mainnet' ? 1 : 2,
          address: address ? address : '',
          page: pageNum,
          page_size: size,
        },
      })

      if (response.result) {
        if (response.data.transactions.length > 0) {
          const rt: RowType[] = response.data.transactions.map((item: any, index: number) => ({
            id: index + 1,
            chainId: item.chain_id,
            chainName: FindChainNamesByChains(item.chain_id),
            hash: item.hash,
            address: item.address,
            fromAddress: item.from_address,
            toAddress: item.to_address,
            token: item.token,
            transactionType: item.transact_type,
            amount: item.amount,
            blockTimestamp: new Date(item.block_timestamp).toLocaleString(),
          }))
          setRows(rt)
          setPage(Number(response.data.page))
          setRowCount(Number(response.data.total))
        } else {
          setRows([])
          setPage(1)
          setRowCount(0)
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

  const fetchPage = async (newPage: number) => {
    setPage(newPage)
    await init(
      newPage,
      pageSize,
      Number(props.chain),
      Number(props.storeId),
      props.network,
      props.address
    )
  }

  useEffect(() => {
    const timer = setInterval(() => {
      init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address)
    }, 10 * 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chain, props.storeId, props.network, props.address, page])

  useEffect(() => {
    init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chain, props.storeId, props.network, props.address])

  const totalPages = Math.max(1, Math.ceil(rowCount / pageSize))

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chain</TableHead>
              <TableHead>Hash</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Block Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer" onClick={() => onClickRow(row)}>
                  <TableCell>{row.chainName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.hash, 10)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.address, 10)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.fromAddress, 10)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {OmitMiddleString(row.toAddress, 10)}
                  </TableCell>
                  <TableCell>{row.token}</TableCell>
                  <TableCell>{row.transactionType}</TableCell>
                  <TableCell className="font-medium">{row.amount}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {row.blockTimestamp}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Server-side pagination */}
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={page <= 1}
          onClick={() => fetchPage(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={page >= totalPages}
          onClick={() => fetchPage(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <TxDialog
        row={selectedValue as RowType}
        open={open}
        onClose={() => setOpen(false)}
        network={props.network}
      />
    </div>
  )
}

export type TxDialogProps = {
  open: boolean
  row: RowType
  onClose: () => void
  network: string
}

function DetailRow({
  label,
  children,
  bold,
}: {
  label: string
  children: React.ReactNode
  bold?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className={`text-sm text-right break-all ${bold ? 'font-semibold' : ''}`}>
        {children}
      </span>
    </div>
  )
}

function ExplorerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline font-mono text-xs"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </Link>
  )
}

function TxDialog(props: TxDialogProps) {
  const { onClose, row, open, network } = props

  if (!row) return null

  const isMainnet = network === 'mainnet'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-0.5 pt-2">
          <DetailRow label="Chain">{row.chainName}</DetailRow>
          <DetailRow label="Hash">
            <ExplorerLink href={GetBlockchainTxUrlByChainIds(isMainnet, row.chainId, row.hash)}>
              {OmitMiddleString(row.hash, 10)}
            </ExplorerLink>
          </DetailRow>
          <DetailRow label="Address">
            <ExplorerLink
              href={GetBlockchainAddressUrlByChainIds(isMainnet, row.chainId, row.address)}
            >
              {OmitMiddleString(row.address, 10)}
            </ExplorerLink>
          </DetailRow>
          <DetailRow label="From Address">
            <ExplorerLink
              href={GetBlockchainAddressUrlByChainIds(isMainnet, row.chainId, row.fromAddress)}
            >
              {OmitMiddleString(row.fromAddress, 10)}
            </ExplorerLink>
          </DetailRow>
          <DetailRow label="To Address">
            <ExplorerLink
              href={GetBlockchainAddressUrlByChainIds(isMainnet, row.chainId, row.toAddress)}
            >
              {OmitMiddleString(row.toAddress, 10)}
            </ExplorerLink>
          </DetailRow>
          <Separator className="my-2" />
          <DetailRow label="Token" bold>
            {row.token}
          </DetailRow>
          <DetailRow label="Transaction Type">{row.transactionType}</DetailRow>
          <DetailRow label="Amount" bold>
            {row.amount}
          </DetailRow>
          <Separator className="my-2" />
          <DetailRow label="Block Timestamp">{row.blockTimestamp}</DetailRow>
        </div>
      </DialogContent>
    </Dialog>
  )
}
