import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Radio,
  RadioGroup,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Balance from './Balance';
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
  const [enablePasswordWarn, setEnablePasswordWarn] = useState<boolean>(false);
  const [enableBackupWarn, setEnableBackupWarn] = useState<boolean>(false);

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

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: getWalletId(),
        },
      });

      if (response.result && !response.data.password) {
        setEnablePasswordWarn(true);
      } else {
        setEnablePasswordWarn(false);
      }

      if (response.result && response.data.is_backup === 2) {
        setEnableBackupWarn(true);
      } else {
        setEnableBackupWarn(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      {enablePasswordWarn && (
        <Box mb={1}>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            <Typography>
              You don&apos;t have to setup the wallet password. Please click&nbsp;
              <Link href={'/wallet/setPassword'}>here</Link>
              &nbsp;to setup.
            </Typography>
          </Alert>
        </Box>
      )}

      {enableBackupWarn && (
        <Box mb={1}>
          <Alert severity="warning">
            <AlertTitle>Warning</AlertTitle>
            <Typography>
              You don&apos;t have to backup your wallet mnemonic phrase. Please click&nbsp;
              <Link href={'/wallet/phrase/intro'}>here</Link>
              &nbsp;to recording.
            </Typography>
          </Alert>
        </Box>
      )}

      <Container>
        <Box my={2}>
          <Chip label={getStoreName()} />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
                  <Box></Box>
                  <RadioGroup row value={walletBalanceDayAlignment} onChange={onChangeDay}>
                    <FormControlLabel value="WEEK" control={<Radio />} label="1W" />
                    <FormControlLabel value="MONTH" control={<Radio />} label="1M" />
                    <FormControlLabel value="YEAR" control={<Radio />} label="1Y" />
                  </RadioGroup>
                </Stack>

                <Box mt={2}>
                  <Balance />
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
                  <TransactionDataGrid source="dashboard" network={getNetwork()} />
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
