import { ExpandMore, ReportGmailerrorred } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import InvoiceDataGrid from '../../DataList/InvoiceDataGrid';
import { COINGECKO_IDS, CURRENCY, ORDER_TIME } from 'packages/constants';
import { IsValidEmail, IsValidHTTPUrl, IsValidJSON } from 'utils/verify';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { CHAINNAMES, COIN, COINS } from 'packages/constants/blockchain';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { ORDER_STATUS } from 'packages/constants';
import { BigDiv } from 'utils/number';
import { FindChainIdsByChainNames, FindTokensByMainnetAndName } from 'utils/web3';

const PaymentInvoices = () => {
  const [openExplain, setOpenExplain] = useState<boolean>(false);
  const [openCreateInvoice, setOpenCreateInvoice] = useState<boolean>(false);

  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>(CURRENCY[0]);
  const [network, setNetwork] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN);
  const [cryptoList, setCryptoList] = useState<COIN[]>([]);
  const [crypto, setCrypto] = useState<COINS>(COINS.BTC);
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [rate, setRate] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [metadata, setMetadata] = useState<string>('');
  const [notificationUrl, setNotificationUrl] = useState<string>('');
  const [notificationEmail, setNotificationEmail] = useState<string>('');

  const [search, setSearch] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<string>(ORDER_STATUS.AllStatus);
  const [orderTime, setOrderTime] = useState<string>(ORDER_TIME.AllTime);

  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const updateRate = async () => {
    try {
      if (!crypto) {
        return;
      }

      const ids = COINGECKO_IDS[crypto];
      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids,
          currency: currency,
        },
      });
      if (response.result) {
        const rate = response.data[ids][currency.toLowerCase()];
        setRate(rate);
        const totalPrice = parseFloat(BigDiv((amount as number).toString(), rate)).toFixed(4);
        setCryptoAmount(totalPrice);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    if (!network) return;

    const coins = FindTokensByMainnetAndName(getNetwork() === 'mainnet', network as CHAINNAMES);
    setCryptoList(coins);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  useEffect(() => {
    if (crypto && amount && currency && amount > 0) {
      updateRate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crypto, amount, currency]);

  const checkAmount = (amount: number): boolean => {
    if (amount > 0) {
      return true;
    }
    return false;
  };

  const onClickCreateInvoice = async () => {
    if (!checkAmount(amount as number)) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect amount');
      setSnackOpen(true);
      return;
    }

    if (!CURRENCY.includes(currency)) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect currency');
      setSnackOpen(true);
      return;
    }

    if (!network) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect network');
      setSnackOpen(true);
      return;
    }

    if (!crypto) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect crypto');
      setSnackOpen(true);
      return;
    }

    if (!IsValidEmail(buyerEmail)) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect email');
      setSnackOpen(true);
      return;
    }

    if (metadata !== '' && !IsValidJSON(metadata)) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect metadata');
      setSnackOpen(true);
      return;
    }

    if (notificationEmail !== '' && !IsValidEmail(notificationEmail)) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect email');
      setSnackOpen(true);
      return;
    }

    if (notificationUrl !== '' && !IsValidHTTPUrl(notificationUrl)) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect notificationUrl');
      setSnackOpen(true);
      return;
    }

    const ln_amount = amount;
    const ln_currency = currency;
    const ln_crypto = crypto;
    const ln_crypto_amount = cryptoAmount;
    const ln_rate = rate;
    const ln_desc = description;
    const ln_buyer_email = buyerEmail;
    const ln_metadata = metadata;
    const ln_notification_url = notificationUrl;
    const ln_notification_email = notificationEmail;

    try {
      const response: any = await axios.post(Http.create_invoice, {
        user_id: getUserId(),
        store_id: getStoreId(),
        chain_id: FindChainIdsByChainNames(network),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        amount: ln_amount,
        currency: ln_currency,
        crypto: ln_crypto,
        crypto_amount: ln_crypto_amount,
        rate: ln_rate,
        description: ln_desc,
        buyer_email: ln_buyer_email,
        metadata: ln_metadata,
        notification_url: ln_notification_url,
        notification_email: ln_notification_email,
      });

      if (response.result && response.data.order_id) {
        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);
        setTimeout(() => {
          window.location.href = '/payments/invoices/' + response.data.order_id;
        }, 2000);
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
        {openCreateInvoice ? (
          <Box>
            <Box>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
                <Typography variant="h6">Create Invoice</Typography>
                <Box>
                  <Button
                    variant={'contained'}
                    onClick={() => {
                      setOpenCreateInvoice(false);
                    }}
                    style={{ marginRight: 20 }}
                  >
                    Back
                  </Button>
                  <Button variant={'contained'} onClick={onClickCreateInvoice} color="success">
                    Create
                  </Button>
                </Box>
              </Stack>

              <Stack direction={'row'} alignItems={'baseline'} gap={4} mt={5}>
                <Box>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography>Amount</Typography>
                    <Typography color={'red'}>*</Typography>
                  </Stack>
                  <Box mt={1}>
                    <TextField
                      fullWidth
                      hiddenLabel
                      size="small"
                      type="number"
                      onChange={(e: any) => {
                        setAmount(e.target.value);
                      }}
                      value={amount}
                    />
                  </Box>
                </Box>
                <Box>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography>Currency</Typography>
                    <Typography color={'red'}>*</Typography>
                  </Stack>
                  <Box mt={1}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        size={'small'}
                        inputProps={{ 'aria-label': 'Without label' }}
                        defaultValue={CURRENCY[0]}
                        onChange={(e) => {
                          setCurrency(e.target.value);
                        }}
                        value={currency}
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
                </Box>
                <Box>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography>Network</Typography>
                    <Typography color={'red'}>*</Typography>
                  </Stack>
                  <Box mt={1}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        size={'small'}
                        inputProps={{ 'aria-label': 'Without label' }}
                        onChange={(e) => {
                          setNetwork(e.target.value as CHAINNAMES);
                        }}
                        value={network}
                      >
                        {CHAINNAMES &&
                          Object.entries(CHAINNAMES).length > 0 &&
                          Object.entries(CHAINNAMES).map((item, index) => (
                            <MenuItem value={item[1]} key={index}>
                              {item[1]}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography>Crypto</Typography>
                    <Typography color={'red'}>*</Typography>
                  </Stack>
                  <Box mt={1}>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        size={'small'}
                        inputProps={{ 'aria-label': 'Without label' }}
                        onChange={(e) => {
                          setCrypto(e.target.value as COINS);
                        }}
                        value={crypto}
                      >
                        {cryptoList &&
                          cryptoList.length > 0 &&
                          cryptoList.map((item, index) => (
                            <MenuItem value={item.name} key={index}>
                              {item.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography>Rate</Typography>
                    <Typography color={'red'}>*</Typography>
                  </Stack>
                  <Box mt={1}>
                    <TextField fullWidth hiddenLabel size="small" value={rate} disabled />
                  </Box>
                </Box>
                <Box>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography>Crypto Amount</Typography>
                    <Typography color={'red'}>*</Typography>
                  </Stack>
                  <Box mt={1}>
                    <TextField fullWidth hiddenLabel size="small" value={cryptoAmount} disabled />
                  </Box>
                </Box>
              </Stack>

              <Box mt={4}>
                <Stack direction={'row'} alignItems={'center'}>
                  <Typography>Item Description</Typography>
                  <Typography color={'red'}>*</Typography>
                </Stack>
                <Box mt={1}>
                  <TextField
                    fullWidth
                    hiddenLabel
                    size="small"
                    value={description}
                    onChange={(e: any) => {
                      setDescription(e.target.value);
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box mt={5}>
              <Typography variant="h6">Customer Information</Typography>
              <Box mt={4}>
                <Stack direction={'row'} alignItems={'center'}>
                  <Typography>Buyer Email</Typography>
                  <Typography color={'red'}>*</Typography>
                </Stack>
                <Box mt={1}>
                  <TextField
                    fullWidth
                    hiddenLabel
                    value={buyerEmail}
                    onChange={(e: any) => {
                      setBuyerEmail(e.target.value);
                    }}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            <Box mt={5}>
              <Typography variant="h6">Additional Options</Typography>
              <Box mt={4}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
                    Metadata
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>Custom data to expand the invoice. This data is a JSON object.</Typography>

                    <Box mt={4}>
                      <Typography>Metadata</Typography>
                      <TextField
                        hiddenLabel
                        multiline
                        rows={6}
                        style={{ width: 600, marginTop: 10 }}
                        value={metadata}
                        onChange={(e: any) => {
                          setMetadata(e.target.value);
                        }}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Box mt={4}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel2-content">
                      Invoice Notifications
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        <Typography>Notification URL</Typography>
                        <Box mt={1}>
                          <TextField
                            fullWidth
                            hiddenLabel
                            size="small"
                            value={notificationUrl}
                            onChange={(e: any) => {
                              setNotificationUrl(e.target.value);
                            }}
                            placeholder="https://example.com"
                          />
                        </Box>
                      </Box>
                      <Box mt={4}>
                        <Typography>Notification Email</Typography>
                        <Box mt={1}>
                          <TextField
                            fullWidth
                            hiddenLabel
                            size="small"
                            value={notificationEmail}
                            onChange={(e: any) => {
                              setNotificationEmail(e.target.value);
                            }}
                          />
                        </Box>
                        <Typography mt={1} fontSize={14} color={'gray'}>
                          Receive updates for this invoice.
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
              <Stack direction={'row'} alignItems={'center'}>
                <Typography variant="h6">Invoices</Typography>
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
                  setOpenCreateInvoice(true);
                }}
              >
                Create Invoice
              </Button>
            </Stack>

            {openExplain && (
              <Alert severity="info">
                <AlertTitle>Info</AlertTitle>
                Invoices are documents issued by the seller to a buyer to collect payment.
                <br />
                An invoice must be paid within a defined time interval at a fixed exchange rate to protect the issuer
                from price fluctuations.
              </Alert>
            )}

            <Stack mt={5} direction={'row'} gap={2}>
              <FormControl sx={{ width: 500 }} variant="outlined">
                <OutlinedInput
                  size={'small'}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  placeholder="Search order id ..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                />
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  size={'small'}
                  inputProps={{ 'aria-label': 'Without label' }}
                  value={orderStatus}
                  onChange={(e) => {
                    setOrderStatus(e.target.value);
                  }}
                >
                  {ORDER_STATUS &&
                    Object.entries(ORDER_STATUS).map((item, index) => (
                      <MenuItem value={item[1]} key={index}>
                        {item[1]}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  size={'small'}
                  inputProps={{ 'aria-label': 'Without label' }}
                  value={orderTime}
                  defaultValue={orderTime}
                  onChange={(e) => {
                    setOrderTime(e.target.value);
                  }}
                >
                  {ORDER_TIME &&
                    Object.entries(ORDER_TIME).map((item, index) => (
                      <MenuItem value={item[1]} key={index}>
                        {item[1]}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Stack>

            <Box mt={2}>
              <InvoiceDataGrid source="none" orderStatus={orderStatus} orderId={search} time={orderTime} />
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PaymentInvoices;
