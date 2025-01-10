import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import BalanceBars from './Balance';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { COINGECKO_IDS, PAYOUT_STATUS } from 'packages/constants';
import { COINS } from 'packages/constants/blockchain';
import { BigMul } from 'utils/number';
import TransactionDataGrid from 'components/DataList/TransactionDataGrid';
import InvoiceDataGrid from 'components/DataList/InvoiceDataGrid';
import PayoutDataGrid from 'components/DataList/PayoutDataGrid';
import CurrencyDataGrid from 'components/DataList/CurrencyDataGrid';

const Dashboard = () => {
  const [walletBalanceAlignment, setWalletBalanceAlignment] = useState<'USD' | 'USDT' | 'USDC'>('USD');
  const [walletBalanceDayAlignment, setWalletBalanceDayAlignment] = useState<'WEEK' | 'MONTH' | 'YEAR'>('WEEK');
  const [walletBalance, setWalletBalance] = useState<number>(0.0);
  const [walletCoinMaps, setWalletCoinMaps] = useState<{ [key in string]: { number: number; price: number } }>({});

  const onChangeCurrency = (e: any) => {
    setWalletBalanceAlignment(e.target.value);
  };

  const onChangeDay = (e: any) => {
    setWalletBalanceDayAlignment(e.target.value);
  };

  const { getStoreName } = useStorePresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const init = async () => {};

  useEffect(() => {
    init();
  }, []);

  return (
    <Box>
      <Container>
        <Typography variant="h5" pt={5}>
          {getStoreName()}
        </Typography>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
                  <Box>
                  </Box>
                  <RadioGroup row value={walletBalanceDayAlignment} onChange={onChangeDay}>
                    <FormControlLabel value="WEEK" control={<Radio />} label="1W" />
                    <FormControlLabel value="MONTH" control={<Radio />} label="1M" />
                    <FormControlLabel value="YEAR" control={<Radio />} label="1Y" />
                  </RadioGroup>
                </Stack>

                <Box mt={2}>
                  <BalanceBars />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography variant="h5">Wallet Balance</Typography>
                  <Button
                    onClick={() => {
                      // window.location.href = '/currencies';
                    }}
                  >
                    View All
                  </Button>
                </Stack>

                <Box mt={3}>
                  <CurrencyDataGrid source="dashboard" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography variant="h5">Recent Transactions</Typography>
                  <Button
                    onClick={() => {
                      window.location.href = '/payments/transactions';
                    }}
                  >
                    View All
                  </Button>
                </Stack>

                <Box mt={3}>
                  <TransactionDataGrid source="dashboard" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography variant="h5">Recent Invoices</Typography>
                  <Button
                    onClick={() => {
                      window.location.href = '/payments/invoices';
                    }}
                  >
                    View All
                  </Button>
                </Stack>

                <Box mt={3}>
                  <InvoiceDataGrid source="dashboard" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography variant="h5">Recent Payouts</Typography>
                  <Button
                    onClick={() => {
                      window.location.href = '/payments/payouts';
                    }}
                  >
                    View All
                  </Button>
                </Stack>

                <Box mt={3}>
                  <PayoutDataGrid status={PAYOUT_STATUS.AwaitingPayment} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
