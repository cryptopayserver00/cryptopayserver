import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CHAINNAMES } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { FindChainNamesByChains } from 'utils/web3';

type RowType = {
  id: number;
  chain: CHAINNAMES;
  orderId: number;
  sourceType: string;
  amount: number;
  currency: string;
  cryptoAmount: number;
  crypto: string;
  createdDate: string;
  expirationDate: string;
  orderStatus: string;
};

type GridType = {
  source: 'dashboard' | 'none';
};

export default function InvoiceDataGrid(props: GridType) {
  const { source } = props;

  const [rows, setRows] = useState<RowType[]>([]);

  const { getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'orderId',
      headerName: 'Order Id',
      // editable: true,
      width: 200,
    },
    {
      field: 'sourceType',
      headerName: 'Source Type',
      width: 200,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 100,
    },
    {
      field: 'cryptoAmount',
      headerName: 'Crypto Amount',
      width: 150,
    },
    {
      field: 'crypto',
      headerName: 'Crypto',
      width: 100,
    },
    {
      field: 'chain',
      headerName: 'Chain',
      width: 100,
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
    {
      field: 'orderStatus',
      headerName: 'Order Status',
      width: 200,
    },
  ];

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_store_id, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
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
              amount: item.amount,
              currency: item.currency,
              cryptoAmount: item.crypto_amount,
              crypto: item.crypto,
              chain: FindChainNamesByChains(item.chain_id),
              createdDate: new Date(item.created_date).toLocaleString(),
              expirationDate: new Date(item.expiration_date).toLocaleString(),
              orderStatus: item.order_status,
            });
          });
          setRows(rt);
        }
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not find the data on site!');
        setSnackOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

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
