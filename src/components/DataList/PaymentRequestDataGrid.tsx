import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CURRENCY_SYMBOLS, PAYMENT_REQUEST_STATUS } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

type RowType = {
  id: number;
  itemId: number;
  paymentRequestId: number;
  title: string;
  amount: string;
  expirationDate: string;
  status: string;
};

type GridType = {
  source: 'dashboard' | 'none';
};

export default function PaymentRequestDataGrid(props: GridType) {
  const { source } = props;

  const [rows, setRows] = useState<RowType[]>([]);

  const { getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const onClickView = (row: any) => {
    window.location.href = '/payment-requests/' + row.paymentRequestId;
  };

  const onClickArchive = async (row: RowType) => {
    try {
      const response: any = await axios.put(Http.update_payment_request_by_id, {
        id: row.itemId,
        payment_request_status: PAYMENT_REQUEST_STATUS.Archived,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Update successful!');
        setSnackOpen(true);

        await init();
      } else {
        setSnackSeverity('error');
        setSnackMessage('Update failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'title',
      headerName: 'title',
      width: 200,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
    },
    {
      field: 'expirationDate',
      headerName: 'Expiry',
      width: 200,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      cellClassName: 'actions',
      align: 'center',
      getActions: ({ row }) => {
        return [
          <Box key={row.id}>
            <Button
              onClick={() => {
                onClickView(row);
              }}
            >
              View
            </Button>
            {row.status !== PAYMENT_REQUEST_STATUS.Archived && (
              <Button
                onClick={async () => {
                  await onClickArchive(row);
                }}
              >
                Archive
              </Button>
            )}
          </Box>,
        ];
      },
    },
  ];

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_payment_request, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = [];
          response.data.forEach(async (item: any, index: number) => {
            let expiry = 'No Expiry';
            if (item.expiration_at) {
              expiry = new Date(item.expiration_at).toLocaleString();
            }
            rt.push({
              id: index + 1,
              itemId: item.id,
              paymentRequestId: item.payment_request_id,
              amount: CURRENCY_SYMBOLS[item.currency] + item.amount,
              title: item.title,
              expirationDate: expiry,
              status: item.payment_request_status,
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
          window.location.href = '/payment-requests/' + e.row.paymentRequestId;
        }}
        hideFooter={source === 'dashboard' ? true : false}
        disableColumnMenu
      />
    </Box>
  );
}
