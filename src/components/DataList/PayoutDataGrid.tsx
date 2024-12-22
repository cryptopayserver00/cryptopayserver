import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { PAYOUT_STATUS } from 'packages/constants';
import { CHAINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { OmitMiddleString } from 'utils/strings';
import { FindChainNamesByChains } from 'utils/web3';

type RowType = {
  id: number;
  chainId: number;
  payoutId: number;
  address: string;
  createdDate: string;
  crypto: string;
  refunded: string;
  sourceType: string;
  externalPaymentId: number;
  chainName: string;
  transaction: string;
  url: string;
};

type GridType = {
  status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];
};

export default function PayoutDataGrid(props: GridType) {
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const [actionWidth, setActionWidth] = useState<number>(600);

  const [rows, setRows] = useState<RowType[]>([]);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    {
      field: 'createdDate',
      headerName: 'Start',
      width: 200,
    },
    {
      field: 'chainName',
      headerName: 'Chain',
      width: 150,
    },
    {
      field: 'crypto',
      headerName: 'Crypto',
      width: 150,
    },
    {
      field: 'refunded',
      headerName: 'Refunded',
      width: 150,
    },
    {
      field: 'address',
      headerName: 'Address',
      width: 250,
      valueGetter: (value, row) => OmitMiddleString(value, 10),
    },
    {
      field: 'sourceType',
      headerName: 'Source Type',
      width: 150,
    },
    {
      field: 'externalPaymentId',
      headerName: 'External Payment Id',
      width: 200,
    },
    {
      field: 'transaction',
      headerName: 'Transaction',
      width: 250,
      valueGetter: (value, row) => OmitMiddleString(value, 10),
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
          case PAYOUT_STATUS.AwaitingApproval:
            setActionWidth(200);
            return [
              <Box key={row.id}>
                <Button
                  onClick={() => {
                    onClickApprove(row);
                  }}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    onClickCancel(row);
                  }}
                >
                  Cancel
                </Button>
              </Box>,
            ];
          case PAYOUT_STATUS.AwaitingPayment:
            setActionWidth(600);
            return [
              <Box key={row.id}>
                <Button
                  onClick={() => {
                    onClickReject(row);
                  }}
                >
                  Reject payout transaction
                </Button>
                <Button
                  onClick={() => {
                    onClickSend(row);
                  }}
                >
                  Send
                </Button>
                <Button
                  onClick={() => {
                    onClickCancel(row);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onClickMarkPaid(row);
                  }}
                >
                  Mark as already paid
                </Button>
              </Box>,
            ];
          case PAYOUT_STATUS.InProgress:
            setActionWidth(300);
            return [
              <Box key={row.id}>
                <Button
                  onClick={() => {
                    onClickCancel(row);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    onClickMarkPaid(row);
                  }}
                >
                  Mark as already paid
                </Button>
              </Box>,
            ];
          default:
            setActionWidth(200);
            return [];
        }
      },
    },
  ];

  const onClickApprove = async (row: any) => {
    try {
      const response: any = await axios.put(Http.update_payout_by_id, {
        id: row.payoutId,
        user_id: getUserId(),
        store_id: getStoreId(),
        payout_status: PAYOUT_STATUS.AwaitingPayment,
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

  const onClickReject = async (row: any) => {
    try {
      const response: any = await axios.put(Http.update_payout_by_id, {
        id: row.payoutId,
        user_id: getUserId(),
        store_id: getStoreId(),
        payout_status: PAYOUT_STATUS.AwaitingApproval,
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
  const onClickSend = async (row: any) => {
    switch (row.chainId) {
      case CHAINS.BITCOIN:
        window.location.href = '/wallets/bitcoin/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.LITECOIN:
        window.location.href = '/wallets/litecoin/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.XRP:
        window.location.href = '/wallets/xrp/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.BITCOINCASH:
        window.location.href = '/wallets/bitcoincash/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.ETHEREUM:
        window.location.href = '/wallets/ethereum/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.TRON:
        window.location.href = '/wallets/tron/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.SOLANA:
        window.location.href = '/wallets/solana/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.BSC:
        window.location.href = '/wallets/bsc/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.ARBITRUM:
        window.location.href = '/wallets/arbitrum/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.AVALANCHE:
        window.location.href = '/wallets/avalanche/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.POLYGON:
        window.location.href = '/wallets/polygon/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.BASE:
        window.location.href = '/wallets/base/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.OPTIMISM:
        window.location.href = '/wallets/optimism/send?payoutId=' + row.payoutId;
        return;
      case CHAINS.TON:
        window.location.href = '/wallets/ton/send?payoutId=' + row.payoutId;
        return;
      default:
        console.error('No support right now!');
    }
  };

  const onClickCancel = async (row: any) => {
    try {
      const response: any = await axios.put(Http.update_payout_by_id, {
        id: row.payoutId,
        user_id: getUserId(),
        store_id: getStoreId(),
        payout_status: PAYOUT_STATUS.Cancelled,
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
  const onClickMarkPaid = async (row: any) => {
    try {
      const response: any = await axios.put(Http.update_payout_by_id, {
        id: row.payoutId,
        user_id: getUserId(),
        store_id: getStoreId(),
        payout_status: PAYOUT_STATUS.Completed,
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

  const init = async (status: (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS]) => {
    // switch (status) {
    //   case PAYOUT_STATUS.AwaitingApproval:
    //     setActionWidth(200);
    //   case PAYOUT_STATUS.AwaitingPayment:
    //     setActionWidth(600);
    //   case (PAYOUT_STATUS.InProgress, PAYOUT_STATUS.Completed, PAYOUT_STATUS.Cancelled):
    //     setActionWidth(100);
    // }

    try {
      const response: any = await axios.get(Http.find_payout, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
          payout_status: status,
        },
      });
      if (response.result && response.data.length > 0) {
        let rt: RowType[] = [];
        response.data.forEach(async (item: any, index: number) => {
          rt.push({
            id: item.id,
            payoutId: item.payout_id,
            chainId: item.chain_id,
            address: item.address,
            createdDate: new Date(item.created_date).toLocaleString(),
            refunded: item.amount + ' ' + item.currency,
            crypto: item.crypto,
            sourceType: item.source_type,
            externalPaymentId: item.external_payment_id,
            chainName: FindChainNamesByChains(item.chain_id),
            transaction: item.tx,
            url: '',
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
          window.location.href = e.row.url;
        }}
        disableColumnMenu
      />
    </Box>
  );
}
