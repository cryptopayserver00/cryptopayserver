import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

type RowType = {
  id: number;
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

  const onClickArchive = (row: any) => {
    console.log('row', row);
  };

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'title',
      headerName: 'title',
      width: 200,
    },
    {
      field: 'expirationDate',
      headerName: 'Expiry',
      width: 200,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 200,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      cellClassName: 'actions',
      getActions: ({ row }) => {
        return [
          <Button
            onClick={() => {
              onClickView(row);
            }}
          >
            View
          </Button>,
          <Button
            onClick={() => {
              onClickArchive(row);
            }}
          >
            Archive
          </Button>,
        ];
      },

      // return [
      //   <GridActionsCellItem
      //     icon={<EditIcon />}
      //     label="Edit"
      //     className="textPrimary"
      //     onClick={handleEditClick(id)}
      //     color="inherit"
      //   />,
      //   <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} color="inherit" />,
      // ];
      //   },
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
            if (item.expiration_date) {
              expiry = new Date(item.expiration_date).toLocaleString();
            }
            rt.push({
              id: index + 1,
              paymentRequestId: item.payment_request_id,
              amount: item.amount + ' ' + item.currency,
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
