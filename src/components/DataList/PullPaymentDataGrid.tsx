import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { PULL_PAYMENT_STATUS } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

type RowType = {
  id: number;
  pullPaymentId: number;
  name: string;
  createdDate: string;
  expirationDate: string;
  showAutoApproveClaim: string;
  refunded: number;
};

type GridType = {
  status: (typeof PULL_PAYMENT_STATUS)[keyof typeof PULL_PAYMENT_STATUS];
};

export default function PullPaymentDataGrid(props: GridType) {
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const [actionWidth, setActionWidth] = useState<number>(300);

  const [rows, setRows] = useState<RowType[]>([]);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'createdDate',
      headerName: 'Start',
      width: 200,
    },
    {
      field: 'expirationDate',
      headerName: 'End',
      width: 200,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 100,
    },
    {
      field: 'showAutoApproveClaim',
      headerName: 'Automatically Approved',
      type: 'number',
      width: 200,
    },
    {
      field: 'refunded',
      headerName: 'Refunded',
      type: 'number',
      width: 200,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: actionWidth,
      align: 'right',
      headerAlign: 'right',
      getActions: ({ row }) => {
        switch (props.status) {
          case PULL_PAYMENT_STATUS.Active:
            setActionWidth(300);
            return [
              <Box key={row.id}>
                <Button
                  onClick={() => {
                    window.location.href = '/pull-payments/' + row.pullPaymentId;
                  }}
                >
                  View
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/payments/payouts';
                  }}
                >
                  Payouts
                </Button>
                <Button
                  onClick={() => {
                    onClickArchive(row.pullPaymentId);
                  }}
                >
                  Archive
                </Button>
              </Box>,
            ];
          case PULL_PAYMENT_STATUS.Expired:
            setActionWidth(200);
            return [
              <Box key={row.id}>
                <Button
                  onClick={() => {
                    window.location.href = '/pull-payments/' + row.pullPaymentId;
                  }}
                >
                  View
                </Button>
                <Button
                  onClick={() => {
                    onClickArchive(row.pullPaymentId);
                  }}
                >
                  Archive
                </Button>
              </Box>,
            ];
          case PULL_PAYMENT_STATUS.Archived:
            setActionWidth(200);
            return [
              <Box key={row.id}>
                <Button
                  onClick={() => {
                    window.location.href = '/pull-payments/' + row.pullPaymentId;
                  }}
                >
                  View
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/payments/payouts';
                  }}
                >
                  Payouts
                </Button>
              </Box>,
            ];
          case PULL_PAYMENT_STATUS.Future:
            setActionWidth(200);
            return [];
          default:
            return [];
        }
      },
    },
  ];

  const onClickArchive = async (id: number) => {
    try {
      const response: any = await axios.put(Http.update_pull_payment_by_id, {
        id: id,
        user_id: getUserId(),
        store_id: getStoreId(),
        pull_payment_status: PULL_PAYMENT_STATUS.Archived,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Update successful!');
        setSnackOpen(true);

        await init(props.status);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Update failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const init = async (status: (typeof PULL_PAYMENT_STATUS)[keyof typeof PULL_PAYMENT_STATUS]) => {
    try {
      const response: any = await axios.get(Http.find_pull_payment, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
          pull_payment_status: status,
        },
      });
      if (response.result && response.data.length > 0) {
        let rt: RowType[] = [];
        response.data.forEach(async (item: any, index: number) => {
          rt.push({
            id: item.id,
            pullPaymentId: item.pull_payment_id,
            name: item.name,
            createdDate: new Date(item.created_date).toLocaleString(),
            expirationDate: new Date(item.expiration_date).toLocaleString(),
            showAutoApproveClaim: item.show_auto_approve_claim === 1 ? 'True' : 'False',
            refunded: item.refunded,
          });
        });
        setRows(rt);
      } else {
        setRows([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    props.status && init(props.status);
  }, [props.status]);

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
          window.location.href = '/pull-payments/' + e.row.pullPaymentId;
        }}
        disableColumnMenu
      />
    </Box>
  );
}
