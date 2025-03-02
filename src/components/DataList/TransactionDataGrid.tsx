import { Dialog, DialogTitle, Stack, Typography } from '@mui/material';
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
};

export default function TransactionDataGrid(props: GridType) {
  const { source } = props;

  const [rows, setRows] = useState<RowType[]>([]);

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
    { field: 'id', headerName: 'ID', width: 50 },
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

  const init = async (chain?: CHAINS) => {
    try {
      const response: any = await axios.get(Http.find_transaction, {
        params: {
          store_id: getStoreId(),
          chain_id: chain,
          network: getNetwork() === 'mainnet' ? 1 : 2,
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
        } else {
          setRows([]);
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

  useEffect(() => {
    init(props.chain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.chain]);

  return (
    <Box>
      <DataGrid
        autoHeight
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        onRowClick={(e: any) => {
          onClickRow(e.row);
        }}
        // checkboxSelection
        // disableRowSelectionOnClick
        hideFooter={source === 'dashboard' ? true : false}
        disableColumnMenu
      />

      <TxDialog row={selectedValue as RowType} open={open} onClose={handleClose} />
    </Box>
  );
}

export type TxDialogProps = {
  open: boolean;
  row: RowType;
  onClose: (value: RowType) => void;
};

function TxDialog(props: TxDialogProps) {
  const { onClose, row, open } = props;

  const { getNetwork } = useUserPresistStore((state) => state);

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
              href={GetBlockchainTxUrlByChainIds(getNetwork() === 'mainnet' ? true : false, row.chainId, row.hash)}
              target="_blank"
            >
              {OmitMiddleString(row.hash, 10)}
            </Link>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Address</Typography>
            <Link
              href={GetBlockchainAddressUrlByChainIds(
                getNetwork() === 'mainnet' ? true : false,
                row.chainId,
                row.address,
              )}
              target="_blank"
            >
              {row.address}
            </Link>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>From Address</Typography>
            <Link
              href={GetBlockchainAddressUrlByChainIds(
                getNetwork() === 'mainnet' ? true : false,
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
              href={GetBlockchainAddressUrlByChainIds(
                getNetwork() === 'mainnet' ? true : false,
                row.chainId,
                row.toAddress,
              )}
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
