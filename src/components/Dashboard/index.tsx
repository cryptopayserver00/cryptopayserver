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

  const getWalletBalance = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_balance_by_network, {
        params: {
          user_id: getUserId(),
          wallet_id: getWalletId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result && response.data.length > 0) {
        let coinMaps: {
          [key in string]: {
            number: number;
            price: number;
          };
        } = {};
        let ids: string[] = [];

        response.data.forEach((item: any) => {
          if (item.balance) {
            Object.entries(item.balance).forEach(([coin, amount]) => {
              const value = parseFloat(amount as string);

              if (value !== 0) {
                if (coinMaps[coin]) {
                  coinMaps[coin].number += value;
                } else {
                  coinMaps[coin] = { number: value, price: 0 };

                  ids.push(COINGECKO_IDS[coin as COINS]);
                }
              }
            });
          }
        });

        const rate_response: any = await axios.get(Http.find_crypto_price, {
          params: {
            ids: ids.length > 1 ? ids.join(',') : ids[0],
            currency: 'USD',
          },
        });

        let totalPrice: number = 0;
        if (rate_response && rate_response.result) {
          Object.entries(coinMaps).map((item) => {
            const price = rate_response.data[COINGECKO_IDS[item[0] as COINS]]['usd'];
            item[1].price = price;

            totalPrice += parseFloat(BigMul(item[1].number.toString(), price));
          });
        }

        setWalletCoinMaps(coinMaps);
        setWalletBalance(totalPrice);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Something wrong, please try it again');
        setSnackOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const init = async () => {
    await getWalletBalance();
  };

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
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography>Wallet Balance</Typography>
                  <ToggleButtonGroup value={walletBalanceAlignment} exclusive onChange={onChangeCurrency}>
                    <ToggleButton value="USD" aria-label="left aligned">
                      USD
                    </ToggleButton>
                    <ToggleButton value="USDT" aria-label="centered">
                      USDT
                    </ToggleButton>
                    <ToggleButton value="USDC" aria-label="right aligned">
                      USDC
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
                  <Box>
                    <Stack direction={'row'} alignItems={'baseline'}>
                      <Typography variant="h4">{walletBalance.toFixed(2)}</Typography>
                      <Typography ml={1}>{walletBalanceAlignment}</Typography>
                    </Stack>
                  </Box>
                  <RadioGroup row value={walletBalanceDayAlignment} onChange={onChangeDay}>
                    <FormControlLabel value="WEEK" control={<Radio />} label="1W" />
                    <FormControlLabel value="MONTH" control={<Radio />} label="1M" />
                    <FormControlLabel value="YEAR" control={<Radio />} label="1Y" />
                  </RadioGroup>
                </Stack>

                <Box mt={2}>
                  {walletCoinMaps &&
                    Object.entries(walletCoinMaps).map((item, index) => (
                      <Stack direction={'row'} alignItems={'baseline'} key={index}>
                        <Typography variant="h6">{item[1].number}</Typography>
                        <Typography ml={1}>{item[0]}</Typography>
                      </Stack>
                    ))}
                </Box>

                <Box mt={2}>
                  <BalanceBars />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* <Grid item xs={4}>
            <Card variant="outlined">
              <CardContent>
                <Box>
                  <Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'}>
                    <Box>
                      <Typography>
                        Paid invoices in the last&nbsp;
                        {walletBalanceDayAlignment === 'WEEK' && '7 days'}
                        {walletBalanceDayAlignment === 'MONTH' && '1 months'}
                        {walletBalanceDayAlignment === 'YEAR' && '1 years'}
                      </Typography>
                      <Typography mt={2} variant="h6">
                        0
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => {
                        window.location.href = '/payments/invoices';
                      }}
                    >
                      Manage
                    </Button>
                  </Stack>
                  <Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'} mt={4}>
                    <Box>
                      <Typography>Payouts Pending</Typography>
                      <Typography mt={2} variant="h6">
                        0
                      </Typography>
                    </Box>
                    <Button
                      onClick={() => {
                        window.location.href = '/payments/payouts';
                      }}
                    >
                      Manage
                    </Button>
                  </Stack>
                  <Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'} mt={4}>
                    <Box>
                      <Typography>Refunds Issued</Typography>
                      <Typography mt={2} variant="h6">
                        0
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid> */}

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
