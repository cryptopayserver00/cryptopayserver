import { Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { COINGECKO_IDS, CURRENCY_SYMBOLS } from 'packages/constants';
import { COINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { BigMul } from 'utils/number';
import { GetImgSrcByCrypto } from 'utils/qrcode';
import Image from 'next/image';

type RowType = {
  id: number;
  coin: string;
  price: string;
  number: string;
  unit: string;
  balance: string;
  marketCap: string;
  twentyFourHVol: string;
  twentyFourHChange: string;
  lastUpdatedAt: number;
};

type GridType = {
  source: 'dashboard' | 'none';
};

export default function CurrencyDataGrid(props: GridType) {
  const { source } = props;

  const [rows, setRows] = useState<RowType[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>('0');

  const { getNetwork } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    {
      field: 'coin',
      headerName: 'Name',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      renderCell: ({ row }) => (
        <Stack direction={'row'} alignItems={'center'} height={'100%'}>
          <Image src={GetImgSrcByCrypto(row.coin as COINS).toString()} alt="logo" width={20} height={20} />
          <Typography pl={2} fontWeight={'bold'}>
            {row.coin}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 150,
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: 'twentyFourHChange',
      headerName: '24h %',
      width: 150,
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: 'twentyFourHVol',
      headerName: 'Volume(24h)',
      width: 200,
      headerAlign: 'right',
      align: 'right',
    },
    {
      field: 'number',
      headerName: 'Your Account Number',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Box height={'100%'} alignContent={'center'}>
          <Typography fontWeight={'bold'}>{row.number}</Typography>
        </Box>
      ),
    },
    {
      field: 'balance',
      headerName: 'Your Account Balance',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Box height={'100%'} alignContent={'center'}>
          <Typography fontWeight={'bold'}>{row.balance}</Typography>
        </Box>
      ),
    },
  ];

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_balance_by_network, {
        params: {
          wallet_id: getWalletId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result && response.data.length > 0) {
        let coinMaps: {
          [key in string]: {
            unit: string;
            number: number;
            price: number;
            balance: number;
            marketCap: number;
            twentyFourHVol: number;
            twentyFourHChange: number;
            lastUpdatedAt: number;
          };
        } = {};
        let ids: string[] = [];
        const unit = 'USD';
        const coinSymbol = CURRENCY_SYMBOLS[unit];

        response.data.forEach((item: any) => {
          if (item.balance) {
            Object.entries(item.balance).forEach(([coin, amount]) => {
              const value = parseFloat(amount as string);

              if (coinMaps[coin]) {
                coinMaps[coin].number += value;
              } else {
                coinMaps[coin] = {
                  unit: unit,
                  number: value,
                  price: 0,
                  balance: 0,
                  marketCap: 0,
                  twentyFourHVol: 0,
                  twentyFourHChange: 0,
                  lastUpdatedAt: 0,
                };

                ids.push(COINGECKO_IDS[coin as COINS]);
              }
            });
          }
        });

        const rate_response: any = await axios.get(Http.find_crypto_price, {
          params: {
            ids: ids.length > 1 ? ids.join(',') : ids[0],
            currency: unit,
          },
        });

        let totalPrice: number = 0;
        if (rate_response && rate_response.result) {
          let rt: RowType[] = [];

          Object.entries(coinMaps).forEach((item, index: number) => {
            const price = rate_response.data[COINGECKO_IDS[item[0] as COINS]]['usd'];
            const balance = parseFloat(BigMul(item[1].number.toString(), price));
            const marketCap = rate_response.data[COINGECKO_IDS[item[0] as COINS]]['usd_market_cap'];
            const twentyFourHVol = rate_response.data[COINGECKO_IDS[item[0] as COINS]]['usd_24h_vol'];
            const twentyFourHChange = rate_response.data[COINGECKO_IDS[item[0] as COINS]]['usd_24h_change'];
            const lastUpdatedAt = rate_response.data[COINGECKO_IDS[item[0] as COINS]]['last_updated_at'];

            item[1].unit = unit;
            item[1].price = price;
            item[1].balance = balance;
            item[1].marketCap = marketCap;
            item[1].twentyFourHVol = twentyFourHVol;
            item[1].twentyFourHChange = twentyFourHChange;
            item[1].lastUpdatedAt = lastUpdatedAt;

            rt.push({
              id: index + 1,
              coin: item[0],
              price: coinSymbol + parseFloat(price).toFixed(2),
              unit: unit,
              number: item[1].number.toFixed(2) + ' ' + item[0],
              balance: coinSymbol + balance.toFixed(2),
              marketCap: coinSymbol + parseInt(marketCap),
              twentyFourHVol: coinSymbol + parseInt(twentyFourHVol),
              twentyFourHChange: parseFloat(twentyFourHChange).toFixed(2) + '%',
              lastUpdatedAt: lastUpdatedAt,
            });

            totalPrice += parseFloat(BigMul(item[1].number.toString(), price));
          });

          setRows(rt);
        }

        setWalletBalance(coinSymbol + totalPrice.toFixed(2));
      } else {
        setSnackSeverity('error');
        setSnackMessage('Something wrong, please try it again');
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

  const onClickRow = async (e: RowType) => {
    // const txId = e.id;
    // setSelectedValue(e);
    // setOpen(true);
  };

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
        // hideFooter={source === 'dashboard' ? true : false}
        disableColumnMenu
      />

      <Stack justifyContent={'right'} direction={'row'} m={2}>
        <Typography>Total Balance:</Typography>
        <Typography pl={1} fontWeight={'bold'}>
          {walletBalance}
        </Typography>
      </Stack>
    </Box>
  );
}
