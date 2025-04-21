import { ReportGmailerrorred, WarningAmber } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  Icon,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CURRENCY, PAYMENT_REQUEST_STATUS, REQUEST_CUSTOMER_DATA } from 'packages/constants';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import PaymentRequestDataGrid from 'components/DataList/PaymentRequestDataGrid';
import Link from 'next/link';
import { IsValidEmail } from 'utils/verify';

const Requests = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false);
  const [openCreateRequest, setOpenCreateRequest] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>(CURRENCY[0]);
  const [showAllowCustomAmount, setShowAllowCustomAmount] = useState<boolean>(false);
  const [expirationDate, setExpirationDate] = useState<Dayjs>();
  const [email, setEmail] = useState<string>('');
  const [requestCustomerData, setRequestCustomerData] = useState<string>(REQUEST_CUSTOMER_DATA[0]);
  const [memo, setMemo] = useState<string>('');
  const [paymentRequestStatus, setPaymentRequestStatus] = useState<string>(PAYMENT_REQUEST_STATUS.AllStatus);
  const [search, setSearch] = useState<string>('');

  const [showTitleAlert, setShowTitleAlert] = useState<boolean>(false);
  const [showAmountAlert, setShowAmountAlert] = useState<boolean>(false);
  const [showExpiredAlert, setShowExpiredAlert] = useState<boolean>(false);

  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const clearData = () => {
    setTitle('');
    setAmount(0);
    setCurrency(CURRENCY[0]);
    setShowAllowCustomAmount(false);
    setExpirationDate(dayjs());
    setEmail('');
    setRequestCustomerData(REQUEST_CUSTOMER_DATA[0]);
    setMemo('');
  };

  const checkTitle = (): boolean => {
    if (title && title != '') {
      setShowTitleAlert(false);
      return true;
    }

    setShowTitleAlert(true);
    return false;
  };

  const checkAmount = (): boolean => {
    if (amount && amount > 0) {
      setShowAmountAlert(false);
      return true;
    }

    setShowAmountAlert(true);
    return false;
  };

  const checkExpirationDate = (): boolean => {
    if (expirationDate) {
      let exipre = new Date(expirationDate.toString()).getTime();
      if (exipre <= new Date().getTime()) {
        setShowExpiredAlert(true);
        return false;
      }
    }

    setShowExpiredAlert(false);
    return true;
  };

  const onClickCreate = async () => {
    try {
      if (!CURRENCY.includes(currency)) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect currency');
        setSnackOpen(true);
        return;
      }

      if (!checkTitle()) {
        return;
      }

      if (!checkAmount()) {
        return;
      }

      if (!checkExpirationDate()) {
        return;
      }

      let exipre = 0;

      if (expirationDate) {
        exipre = new Date(expirationDate.toString()).getTime();
      }

      if (!IsValidEmail(email)) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect email input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.post(Http.create_payment_request, {
        user_id: getUserId(),
        store_id: getStoreId(),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        title: title,
        amount: amount,
        currency: currency,
        show_allow_custom_amount: showAllowCustomAmount ? 1 : 2,
        expiration_date: exipre,
        email: email,
        request_customer_data: requestCustomerData,
        memo: memo,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful create!');
        setSnackOpen(true);

        clearData();
        setOpenCreateRequest(false);
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

  return (
    <Box>
      <Container>
        {openCreateRequest ? (
          <Box>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
              <Typography variant="h6">Create Payment Requests</Typography>
              <Stack direction={'row'} alignItems={'center'} gap={1}>
                <Button
                  variant={'contained'}
                  onClick={() => {
                    setOpenCreateRequest(false);
                  }}
                >
                  Back
                </Button>
                <Button variant={'contained'} onClick={onClickCreate} color="success">
                  Create
                </Button>
              </Stack>
            </Stack>

            <Box mt={3}>
              <Typography>Title</Typography>
              <Box mt={1}>
                <FormControl variant="outlined" fullWidth>
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={title}
                    onChange={(e: any) => {
                      setTitle(e.target.value);
                    }}
                  />
                </FormControl>
              </Box>
              {showTitleAlert && (
                <Typography mt={1} color={'red'}>
                  The Title field is required.
                </Typography>
              )}

              <Grid container justifyContent={'space-between'} mt={4}>
                <Grid item xs={8}>
                  <Typography>Amount</Typography>
                  <Box mt={1}>
                    <FormControl variant="outlined" fullWidth>
                      <OutlinedInput
                        size={'small'}
                        type="number"
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          'aria-label': 'weight',
                        }}
                        value={amount}
                        onChange={(e: any) => {
                          setAmount(e.target.value);
                        }}
                      />
                    </FormControl>
                  </Box>
                  {showAmountAlert && (
                    <Typography mt={1} color={'red'}>
                      Please provide an amount greater than 0
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={3}>
                  <Typography>Currency</Typography>
                  <Box mt={1}>
                    <FormControl variant="outlined" fullWidth>
                      <Select
                        size={'small'}
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={currency}
                        onChange={(e: any) => {
                          setCurrency(e.target.value);
                        }}
                      >
                        {CURRENCY &&
                          CURRENCY.length > 0 &&
                          CURRENCY.map((item, index) => (
                            <MenuItem value={item} key={index}>
                              {item}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>

              <Stack mt={4} direction={'row'} alignItems={'center'}>
                <Switch
                  checked={showAllowCustomAmount}
                  onChange={() => {
                    setShowAllowCustomAmount(!showAllowCustomAmount);
                  }}
                />
                <Typography>Allow payee to create invoices with custom amounts</Typography>
              </Stack>

              <Box mt={4}>
                <Typography>Expiration Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DemoContainer components={['DateRangePicker']}>
                    <DemoItem>
                      <DateTimePicker
                        value={expirationDate}
                        onAccept={(value: any) => {
                          setExpirationDate(value);
                        }}
                      />
                    </DemoItem>
                  </DemoContainer>
                </LocalizationProvider>
              </Box>

              {showExpiredAlert && (
                <Typography mt={1} color={'red'}>
                  Expired time is incorrect
                </Typography>
              )}

              <Box mt={4}>
                <Typography>Email</Typography>
                <Box mt={1}>
                  <FormControl variant="outlined" fullWidth>
                    <OutlinedInput
                      size={'small'}
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                      value={email}
                      onChange={(e: any) => {
                        setEmail(e.target.value);
                      }}
                    />
                  </FormControl>
                </Box>
                <Typography mt={1}>
                  This will send notification mails to the recipient, as configured by the{' '}
                  <Link href={'/settings?tab=emails'}>email rules.</Link>
                </Typography>
              </Box>

              <Box mt={4}>
                <Typography>Request customer data on checkout</Typography>
                <Box mt={1}>
                  <FormControl sx={{ width: 300 }}>
                    <Select
                      size={'small'}
                      inputProps={{ 'aria-label': 'Without label' }}
                      value={requestCustomerData}
                      onChange={(e: any) => {
                        setRequestCustomerData(e.target.value);
                      }}
                    >
                      {REQUEST_CUSTOMER_DATA &&
                        REQUEST_CUSTOMER_DATA.length > 0 &&
                        REQUEST_CUSTOMER_DATA.map((item, index) => (
                          <MenuItem value={item} key={index}>
                            {item}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box mt={4}>
                <Typography>Memo</Typography>
                <Box mt={1}>
                  <TextField
                    multiline
                    rows={8}
                    fullWidth
                    value={memo}
                    onChange={(e: any) => {
                      setMemo(e.target.value);
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
              <Stack direction={'row'} alignItems={'center'}>
                <Typography variant="h6">Payment Requests</Typography>
                <IconButton
                  onClick={() => {
                    setOpenExplain(!openExplain);
                  }}
                >
                  <ReportGmailerrorred />
                </IconButton>
              </Stack>
              <Button
                variant={'contained'}
                onClick={() => {
                  setOpenCreateRequest(true);
                }}
              >
                Create Request
              </Button>
            </Stack>

            {openExplain && (
              <Alert severity="info">
                <AlertTitle>Info</AlertTitle>
                Payment requests are persistent shareable pages that enable the receiver to pay at their convenience.
                <br />
                Funds are paid to a payment request at the current exchange rate.
                <br />
                Requests may be paid in partial. They will remain valid until time expires or when paid what is due.
              </Alert>
            )}

            <Stack direction={'row'} mt={5} gap={3}>
              <Box>
                <FormControl sx={{ width: 700 }} variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    placeholder="Search payment request id ..."
                    value={search}
                    onChange={(e: any) => {
                      setSearch(e.target.value);
                    }}
                  />
                </FormControl>
              </Box>

              <Box>
                <FormControl sx={{ minWidth: 120 }}>
                  <Select
                    size={'small'}
                    inputProps={{ 'aria-label': 'Without label' }}
                    value={paymentRequestStatus}
                    onChange={(e) => {
                      setPaymentRequestStatus(e.target.value);
                    }}
                  >
                    {PAYMENT_REQUEST_STATUS &&
                      Object.entries(PAYMENT_REQUEST_STATUS).map((item, index) => (
                        <MenuItem value={item[1]} key={index}>
                          {item[1]}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            <Box mt={2}>
              <PaymentRequestDataGrid
                source="none"
                paymentRequestId={search}
                paymentRequestStatus={paymentRequestStatus}
              />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Requests;
