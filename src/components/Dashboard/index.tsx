import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import StoreData from './StoreData';
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { PAYOUT_STATUS } from 'packages/constants';
import TransactionDataGrid from 'components/DataList/TransactionDataGrid';
import InvoiceDataGrid from 'components/DataList/InvoiceDataGrid';
import PayoutDataGrid from 'components/DataList/PayoutDataGrid';
import CurrencyDataGrid from 'components/DataList/CurrencyDataGrid';

const Dashboard = () => {
  const [enablePasswordWarn, setEnablePasswordWarn] = useState<boolean>(false);
  const [enableBackupWarn, setEnableBackupWarn] = useState<boolean>(false);

  const { getStoreName } = useStorePresistStore((state) => state);
  const { getNetwork } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);

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
          <Chip size={'medium'} variant={'outlined'} label={getStoreName()} />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <StoreData />
              </CardContent>
            </Card>
          </Grid>

          {/* <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography variant="h5">Wallet Balance</Typography>
                  <Button
                    onClick={() => {
                      // window.location.href = '/currencies';
                    }}
                    variant="contained"
                  >
                    View All
                  </Button>
                </Stack>

                <Box mt={3}>
                  <CurrencyDataGrid source="dashboard" />
                </Box>
              </CardContent>
            </Card>
          </Grid> */}

          {/* <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography variant="h5">Recent Transactions</Typography>
                  <Button
                    onClick={() => {
                      window.location.href = '/payments/transactions';
                    }}
                    variant="contained"
                  >
                    View All
                  </Button>
                </Stack>

                <Box mt={3}>
                  <TransactionDataGrid source="dashboard" network={getNetwork()} />
                </Box>
              </CardContent>
            </Card>
          </Grid> */}

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                  <Typography variant="h5">Recent Invoices</Typography>
                  <Button
                    onClick={() => {
                      window.location.href = '/payments/invoices';
                    }}
                    variant="contained"
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
                    variant="contained"
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
