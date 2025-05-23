import { Button, Dialog, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import Link from 'next/link';
import { CHAINNAMES, CHAINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { OmitMiddleString } from 'utils/strings';
import { FindChainNamesByChains, GetBlockchainAddressUrlByChainIds, GetBlockchainTxUrlByChainIds } from 'utils/web3';

type RowType = {
  id: number;
  chainId: number;
  chainName: CHAINNAMES;
  hash: string;
  address: string;
  fromAddress: string;
  toAddress: string;
  token: string;
  transactionType: string;
  amount: number;
  blockTimestamp: string;
};

type GridType = {
  source: 'dashboard' | 'none';
  chain?: CHAINS;
  storeId?: number;
  network: string;
  address?: string;
};

export default function TransactionDataGrid(props: GridType) {
  const { source } = props;

  const [rows, setRows] = useState<RowType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [rowCount, setRowCount] = useState<number>(0);

  const { getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<RowType>();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: RowType) => {
    setOpen(false);
  };

  const onClickRow = async (e: RowType) => {
    // const txId = e.id;
    setSelectedValue(e);
    setOpen(true);
  };

  const columns: GridColDef<(typeof rows)[number]>[] = [
    // { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'chainName',
      headerName: 'Chain',
      width: 100,
    },
    {
      field: 'hash',
      headerName: 'Hash',
      width: 200,
      valueGetter: (value, row) => OmitMiddleString(value, 10),
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 200,
      valueGetter: (value, row) => OmitMiddleString(value, 10),
    },

    {
      field: 'fromAddress',
      headerName: 'FromAddress',
      width: 200,
      valueGetter: (value, row) => OmitMiddleString(value, 10),
    },
    {
      field: 'toAddress',
      headerName: 'ToAddress',
      width: 200,
      valueGetter: (value, row) => OmitMiddleString(value, 10),
    },
    {
      field: 'token',
      headerName: 'Token',
      width: 100,
    },
    {
      field: 'transactionType',
      headerName: 'Transaction Type',
      width: 100,
    },

    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
    },
    {
      field: 'blockTimestamp',
      headerName: 'Block Timestamp',
      width: 200,
    },
  ];

  const init = async (
    page: number,
    pageSize: number,
    chain: number,
    storeId: number,
    network: string,
    address?: string,
  ) => {
    try {
      const response: any = await axios.get(Http.find_transaction, {
        params: {
          chain_id: chain ? chain : '',
          store_id: storeId ? storeId : getStoreId(),
          network: network ? (network === 'mainnet' ? 1 : 2) : getNetwork() === 'mainnet' ? 1 : 2,
          address: address ? address : '',
          page: page,
          page_size: pageSize,
        },
      });
      if (response.result) {
        if (response.data.transactions.length > 0) {
          let rt: RowType[] = [];
          response.data.transactions.forEach(async (item: any, index: number) => {
            rt.push({
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
            });
          });
          setRows(rt);
          setPage(Number(response.data.page));
          setPageSize(Number(response.data.pageSize));
          setRowCount(Number(response.data.total));
        } else {
          setRows([]);
          setPage(1);
          setPageSize(10);
          setRowCount(0);
        }
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not find the data on site!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickPreviousPage = async () => {
    const newPage = page - 1;
    setPage(newPage);
    await init(newPage, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
  };

  const onClickNextPage = async () => {
    const newPage = page + 1;
    setPage(newPage);
    await init(newPage, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
  };

  const onClickSearch = async () => {
    await init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
  };

  useEffect(() => {
    const activeInit = setInterval(() => {
      init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
    }, 10 * 1000);

    return () => clearInterval(activeInit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chain, props.storeId, props.network, props.address]);

  useEffect(() => {
    init(page, pageSize, Number(props.chain), Number(props.storeId), props.network, props.address);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chain, props.storeId, props.network, props.address]);

  return (
    <Box>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: pageSize,
              page: page,
            },
          },
        }}
        pageSizeOptions={[pageSize]}
        onRowClick={(e: any) => {
          onClickRow(e.row);
        }}
        // checkboxSelection
        // disableRowSelectionOnClick
        // hideFooter={source === 'dashboard' ? true : false}
        hideFooter={true}
        disableColumnMenu
      />

      <Stack direction={'row'} alignItems={'center'} justifyContent={'right'} my={2} gap={2}>
        <Button
          variant={'contained'}
          onClick={() => {
            onClickPreviousPage();
          }}
        >
          Previous page
        </Button>
        <Button
          variant={'contained'}
          onClick={() => {
            onClickNextPage();
          }}
        >
          Next page
        </Button>
      </Stack>

      <TxDialog row={selectedValue as RowType} open={open} onClose={handleClose} network={props.network} />
    </Box>
  );
}

export type TxDialogProps = {
  open: boolean;
  row: RowType;
  onClose: (value: RowType) => void;
  network: string;
};

function TxDialog(props: TxDialogProps) {
  const { onClose, row, open, network } = props;

  if (!row) return;

  const handleClose = () => {
    onClose(row);
  };

  return (
    <Dialog onClose={handleClose} open={open} fullWidth>
      <Box p={4}>
        <Typography variant="h5">Transaction</Typography>
        <Box mt={3}>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography>Chain</Typography>
            <Typography>{row.chainName}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Hash</Typography>
            <Link
              href={GetBlockchainTxUrlByChainIds(network === 'mainnet' ? true : false, row.chainId, row.hash)}
              target="_blank"
            >
              {OmitMiddleString(row.hash, 10)}
            </Link>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Address</Typography>
            <Link
              href={GetBlockchainAddressUrlByChainIds(network === 'mainnet' ? true : false, row.chainId, row.address)}
              target="_blank"
            >
              {row.address}
            </Link>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>From Address</Typography>
            <Link
              href={GetBlockchainAddressUrlByChainIds(
                network === 'mainnet' ? true : false,
                row.chainId,
                row.fromAddress,
              )}
              target="_blank"
            >
              {row.fromAddress}
            </Link>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>To Address</Typography>
            <Link
              href={GetBlockchainAddressUrlByChainIds(network === 'mainnet' ? true : false, row.chainId, row.toAddress)}
              target="_blank"
            >
              {row.toAddress}
            </Link>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Token</Typography>
            <Typography fontWeight={'bold'}>{row.token}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Transaction Type</Typography>
            <Typography>{row.transactionType}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Amount</Typography>
            <Typography fontWeight={'bold'}>{row.amount}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Block Timestamp</Typography>
            <Typography>{row.blockTimestamp}</Typography>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
