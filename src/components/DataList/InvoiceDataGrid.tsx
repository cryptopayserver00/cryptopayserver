import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CURRENCY_SYMBOLS } from 'packages/constants';
import { CHAINNAMES } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { FindChainNamesByChains } from 'utils/web3';

type RowType = {
  id: number;
  chain: CHAINNAMES;
  orderId: number;
  sourceType: string;
  fiatAmount: string;
  cryptoAmount: string;
  createdDate: string;
  expirationDate: string;
  orderStatus: string;
};

type GridType = {
  source: 'dashboard' | 'none';
  orderStatus?: string;
  orderId?: string;
  time?: string;
};

export default function InvoiceDataGrid(props: GridType) {
  const { t, i18n } = useTranslation('');
  const { source } = props;

  const [rows, setRows] = useState<RowType[]>([]);

  const { getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'orderId',
      headerName: t('Order Id'),
      width: 200,
    },
    {
      field: 'fiatAmount',
      headerName: t('Fiat Amount'),
      width: 100,
    },
    {
      field: 'chain',
      headerName: t('Chain'),
      width: 100,
    },
    {
      field: 'cryptoAmount',
      headerName: t('Crypto Amount'),
      width: 150,
    },
    {
      field: 'sourceType',
      headerName: t('Source Type'),
      width: 140,
    },
    {
      field: 'orderStatus',
      headerName: t('Order Status'),
      width: 140,
    },
    {
      field: 'createdDate',
      headerName: t('Created Date'),
      width: 200,
    },
    {
      field: 'expirationDate',
      headerName: t('Expiration Date'),
      width: 200,
    },
  ];

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_store_id, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
          order_status: props.orderStatus,
          order_id: props.orderId,
          time: props.time,
        },
      });
      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = [];
          response.data.forEach(async (item: any, index: number) => {
            rt.push({
              id: index + 1,
              orderId: item.order_id,
              sourceType: item.source_type,
              fiatAmount: CURRENCY_SYMBOLS[item.currency] + item.amount,
              cryptoAmount: `${item.crypto_amount} ${item.crypto}`,
              chain: FindChainNamesByChains(item.chain_id),
              createdDate: new Date(item.created_at).toLocaleString(),
              expirationDate: new Date(item.expiration_at).toLocaleString(),
              orderStatus: item.order_status,
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
  }, []);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.orderStatus, props.orderId, props.time]);

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
          window.location.href = '/payments/invoices/' + e.row.orderId;
        }}
        // checkboxSelection
        // disableRowSelectionOnClick
        hideFooter={source === 'dashboard' ? true : false}
        disableColumnMenu
      />
    </Box>
  );
}
