import { Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useSnackPresistStore } from 'lib/store';
import { COINGECKO_IDS, CURRENCY, CURRENCY_SYMBOLS } from 'packages/constants';
import { COINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { GetImgSrcByCrypto } from 'utils/qrcode';
import Image from 'next/image';
import { FormatNumberToEnglish } from 'utils/strings';
import { useTranslation } from 'react-i18next';

type RowType = {
  id: number;
  coin: string;
  price: string;
  unit: string;
  marketCap: number;
  marketCapStr: string;
  twentyFourHVol: string;
  twentyFourHChange: number;
  lastUpdatedAt: number;
};

type GridType = {
  source: 'dashboard' | 'none';
};

export default function TokenDataGrid(props: GridType) {
  const { t, i18n } = useTranslation('');
  const { source } = props;
  const [rows, setRows] = useState<RowType[]>([]);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'coin',
      headerName: t('Name'),
      width: 200,
      renderCell: ({ row }) => (
        <Stack direction={'row'} alignItems={'center'} height={'100%'}>
          {GetImgSrcByCrypto(row.coin as COINS) && (
            <Image src={GetImgSrcByCrypto(row.coin as COINS).toString()} alt="logo" width={20} height={20} />
          )}
          <Typography pl={2} fontWeight={'bold'}>
            {row.coin}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'price',
      headerName: t('Price'),
      width: 200,
    },
    {
      field: 'twentyFourHChange',
      headerName: '24h %',
      width: 200,
      renderCell: ({ row }) => (
        <Typography fontWeight={'bold'} mt={1} color={Number(row.twentyFourHChange) >= 0 ? 'green' : 'red'}>
          {`${parseFloat(row.twentyFourHChange.toString()).toFixed(2)} %`}
        </Typography>
      ),
    },
    {
      field: 'marketCapStr',
      headerName: t('Market Cap'),
      width: 200,
    },
    {
      field: 'twentyFourHVol',
      headerName: t('Volume') + '(24h)',
      width: 200,
    },
  ];

  const init = async () => {
    try {
      let ids: string[] = [];
      Object.values(COINS).forEach((item) => {
        ids.push(COINGECKO_IDS[item]);
      });
      const unit = CURRENCY[0];

      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids.length > 1 ? ids.join(',') : ids[0],
          currency: unit,
        },
      });

      if (response && response.result) {
        let rt: RowType[] = [];

        Object.values(COINS).forEach((item, index: number) => {
          const price = response.data[COINGECKO_IDS[item]]['usd'];
          const marketCap = response.data[COINGECKO_IDS[item]]['usd_market_cap'];
          const twentyFourHVol = response.data[COINGECKO_IDS[item]]['usd_24h_vol'];
          const twentyFourHChange = response.data[COINGECKO_IDS[item]]['usd_24h_change'];
          const lastUpdatedAt = response.data[COINGECKO_IDS[item]]['last_updated_at'];

          rt.push({
            id: index + 1,
            coin: item,
            price: `${CURRENCY_SYMBOLS[unit]}${price}`,
            unit: unit,
            marketCap: marketCap,
            marketCapStr: FormatNumberToEnglish(marketCap),
            twentyFourHVol: FormatNumberToEnglish(twentyFourHVol),
            twentyFourHChange: twentyFourHChange,
            lastUpdatedAt: lastUpdatedAt,
          });
        });

        rt.sort((a, b) => b.marketCap - a.marketCap);

        setRows(rt);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage(t('The network error occurred. Please try again later.'));
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
    </Box>
  );
}
