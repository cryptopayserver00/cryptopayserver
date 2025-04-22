import { Dialog, Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { FindChainNamesByChains } from 'utils/web3';
import { CURRENCY_SYMBOLS, PAID_STATUS, REPORT_STATUS } from 'packages/constants';
import { RowType } from 'components/Payments/Reporting';

type GridType = {
  startDate: number;
  endDate: number;
  status: (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];
  rows: RowType[];
  setRows: ([]) => void;
};

export default function ReportDataGrid(props: GridType) {
  const { startDate, endDate, status, rows, setRows } = props;

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
    setSelectedValue(e);
    setOpen(true);
  };

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'storeName',
      headerName: 'Store Name',
      width: 100,
    },
    {
      field: 'orderId',
      headerName: 'Order Id',
      width: 200,
    },
    {
      field: 'fiatAmount',
      headerName: 'Fiat Amount',
      width: 100,
    },
    {
      field: 'chain',
      headerName: 'Chain',
      width: 100,
    },
    {
      field: 'cryptoAmount',
      headerName: 'Crypto Amount',
      width: 150,
    },
    {
      field: 'rate',
      headerName: 'Rate',
      width: 150,
    },
    {
      field: 'sourceType',
      headerName: 'Source Type',
      width: 140,
    },
    {
      field: 'orderStatus',
      headerName: 'Order Status',
      width: 150,
    },
    {
      field: 'createdDate',
      headerName: 'Created Date',
      width: 200,
    },
    {
      field: 'expirationDate',
      headerName: 'Expiration Date',
      width: 200,
    },
  ];

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_report, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
          start_date: startDate,
          end_date: endDate,
          status: status,
        },
      });
      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = [];
          response.data.forEach(async (item: any, index: number) => {
            rt.push({
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
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, status]);

  return (
    <Box>
      {rows && rows.length > 0 ? (
        <>
          <DataGrid
            slotProps={{}}
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
            // hideFooter={source === 'dashboard' ? true : false}
            disableColumnMenu
          />

          <TxDialog row={selectedValue as RowType} open={open} onClose={handleClose} />
        </>
      ) : (
        <Box>
          <Typography variant="h6">Raw data</Typography>
          <Typography mt={2}>No data</Typography>
        </Box>
      )}
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
        <Typography variant="h5">Report</Typography>
        <Box mt={3}>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography>Store Name</Typography>
            <Typography>{row.storeName}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Order Id</Typography>
            <Typography>{row.orderId}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Source Type</Typography>
            <Typography>{row.sourceType}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Chain</Typography>
            <Typography>{row.chain}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Fait Amount</Typography>
            <Typography fontWeight={'bold'}>{row.fiatAmount}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Crypto Amount</Typography>
            <Typography fontWeight={'bold'}>{row.cryptoAmount}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Description</Typography>
            <Typography fontWeight={'bold'}>{row.description}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Metadata</Typography>
            <Typography fontWeight={'bold'}>{row.metadata}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Buyer Email</Typography>
            <Typography fontWeight={'bold'}>{row.buyerEmail}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Order Status</Typography>
            <Typography fontWeight={'bold'}>{row.orderStatus}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Payment Method</Typography>
            <Typography fontWeight={'bold'}>{row.paymentMethod}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Created Date</Typography>
            <Typography>{row.createdDate}</Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1}>
            <Typography>Expiration Date</Typography>
            <Typography>{row.expirationDate}</Typography>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
