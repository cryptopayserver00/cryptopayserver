import { ContentCopy, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Paper,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { COINGECKO_IDS, INVOICE_SOURCE_TYPE, ORDER_STATUS } from 'packages/constants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from 'packages/constants/blockchain';
import Image from 'next/image';
import { BigDiv } from 'utils/number';

type paymentRequestType = {
  userId: number;
  storeId: number;
  paymentRequestId: number;
  network: number;
  title: string;
  amount: number;
  currency: string;
  memo: string;
  expirationDate: number;
  paymentRequestStatus: string;
  requesCustomerData: string;
  showAllowCustomAmount: boolean;
  email: string;
};

type InvoiceType = {
  orderId: number;
  amount: number;
  currency: string;
  orderStatus: string;
};

const PaymentRequestsDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const [page, setPage] = useState<number>(1);

  const [paymentRequestData, setPaymentRequestData] = useState<paymentRequestType>();
  const [paymentRequestRows, setPaymentRequestRows] = useState<InvoiceType[]>([]);
  const [paidAmount, setPaidAmount] = useState<number>(0);

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const getPaymentHistory = async (storeId: number, network: number, paymentRequestId: number) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_source_type, {
        params: {
          store_id: storeId,
          network: network,
          source_type: INVOICE_SOURCE_TYPE.PaymentRequest,
          external_payment_id: paymentRequestId,
        },
      });

      if (response.result && response.data.length > 0) {
        let rt: InvoiceType[] = [];
        let paid = 0;
        response.data.forEach((item: any) => {
          rt.push({
            orderId: item.order_id,
            amount: item.amount,
            currency: item.currency,
            orderStatus: item.order_status,
          });

          if (item.order_status === ORDER_STATUS.Settled) {
            paid += parseFloat(item.amount);
          }
        });
        setPaymentRequestRows(rt);

        setPaidAmount(paid);
      } else {
        setPaymentRequestRows([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const init = async (id: any) => {
    try {
      if (!id) return;

      const response: any = await axios.get(Http.find_payment_request_by_id, {
        params: {
          id: id,
        },
      });

      if (response.result && response.data.length === 1) {
        setPaymentRequestData({
          userId: response.data[0].user_id,
          storeId: response.data[0].store_id,
          paymentRequestId: response.data[0].payment_request_id,
          network: response.data[0].network,
          title: response.data[0].title,
          amount: response.data[0].amount,
          currency: response.data[0].currency,
          memo: response.data[0].memo,
          expirationDate: response.data[0].expiration_date,
          paymentRequestStatus: response.data[0].payment_request_status,
          requesCustomerData: response.data[0].reques_customer_data,
          showAllowCustomAmount: response.data[0].show_allow_customAmount === 1 ? true : false,
          email: response.data[0].email,
        });

        await getPaymentHistory(
          response.data[0].store_id,
          response.data[0].network,
          response.data[0].payment_request_id,
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    id && init(id);
  }, [id]);

  const onClickPayInvoice = () => {
    setPage(2);
  };

  const onClickCoin = async (item: COIN, cryptoAmount: string, rate: number) => {
    try {
      const create_invoice_resp: any = await axios.post(Http.create_invoice_from_external, {
        user_id: paymentRequestData?.userId,
        store_id: paymentRequestData?.storeId,
        chain_id: item.chainId,
        payment_request_id: paymentRequestData?.paymentRequestId,
        network: paymentRequestData?.network,
        amount: paymentRequestData?.amount,
        currency: paymentRequestData?.currency,
        crypto: item.name,
        crypto_amount: cryptoAmount,
        rate: rate,
        email: paymentRequestData?.email,
      });

      if (create_invoice_resp.result && create_invoice_resp.data.order_id) {
        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);

        setTimeout(() => {
          window.location.href = '/invoices/' + create_invoice_resp.data.order_id;
        }, 1000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box mt={4}>
      <Container maxWidth="sm">
        <Typography textAlign={'center'} variant="h4">
          {paymentRequestData?.title}
        </Typography>
        <Typography textAlign={'center'} mt={2}>
          Invoice from store
        </Typography>

        {paymentRequestData && paidAmount >= paymentRequestData?.amount && (
          <Box mt={2}>
            <Alert variant="filled" severity="success">
              The payment request has reached its target, but you can continue to make payments.
            </Alert>
          </Box>
        )}

        {page === 1 && (
          <Box mt={2}>
            <Card>
              <CardContent>
                <Stack direction={'row'} alignItems={'center'}>
                  <Typography variant="h5" fontWeight={'bold'}>
                    {paymentRequestData?.amount} {paymentRequestData?.currency}
                  </Typography>
                </Stack>
                <Box mt={2}>
                  {paymentRequestData?.memo ? (
                    <>
                      <Typography>{paymentRequestData.memo}</Typography>
                    </>
                  ) : (
                    <>
                      <Typography>No due date</Typography>
                    </>
                  )}
                </Box>

                <Box mt={4}>
                  <Button variant={'contained'} size="large" fullWidth onClick={onClickPayInvoice}>
                    Pay Invoice
                  </Button>
                </Box>

                <Stack mt={2} alignItems={'center'} gap={2} direction={'row'}>
                  <Button
                    variant={'outlined'}
                    fullWidth
                    onClick={() => {
                      window.print();
                    }}
                  >
                    Print
                  </Button>

                  <Button
                    variant={'outlined'}
                    fullWidth
                    onClick={async () => {
                      await navigator.clipboard.writeText(window.location.href);

                      setSnackMessage('Successfully copy');
                      setSnackSeverity('success');
                      setSnackOpen(true);
                    }}
                  >
                    Copy Link
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Box mt={4}>
              <Card>
                <CardContent>
                  <Typography variant={'h6'}>Payment History</Typography>

                  <Box mt={2}>
                    <TableContainer component={Paper}>
                      <Table aria-label="simple table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Invoice Id</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paymentRequestRows && paymentRequestRows.length > 0 ? (
                            <>
                              {paymentRequestRows.map((row, index) => (
                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                  <TableCell component="th" scope="row">
                                    <Button
                                      onClick={() => {
                                        window.location.href = '/invoices/' + row.orderId;
                                      }}
                                    >
                                      {row.orderId}
                                    </Button>
                                  </TableCell>
                                  <TableCell>
                                    {row.amount} {row.currency}
                                  </TableCell>
                                  <TableCell>
                                    <Typography fontWeight={'bold'}>{row.orderStatus}</Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          ) : (
                            <TableRow>
                              <TableCell colSpan={100} align="center">
                                No rows
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
        {page === 2 && (
          <Box mt={2}>
            <SelectChainAndCrypto
              network={paymentRequestData?.network as number}
              amount={paymentRequestData?.amount as number}
              currency={paymentRequestData?.currency as string}
              onClickCoin={onClickCoin}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PaymentRequestsDetails;

type SelectType = {
  network: number;
  amount: number;
  currency: string;
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
};

const SelectChainAndCrypto = (props: SelectType) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>([]);
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>();

  const [rate, setRate] = useState<number>(0);
  const [cryptoAmount, setCryptoAmount] = useState<string>('');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) => (props.network === 1 ? item.isMainnet : !item.isMainnet));
    setBlcokchain(value);
  }, [props.network]);

  const updateRate = async () => {
    try {
      if (!selectCoinItem?.name) {
        return;
      }

      const ids = COINGECKO_IDS[selectCoinItem?.name];
      const rate_response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids,
          currency: props.currency,
        },
      });

      const rate = rate_response.data[ids][props.currency.toLowerCase()];
      setRate(rate);
      const totalPrice = parseFloat(BigDiv((props.amount as number).toString(), rate)).toFixed(4);
      setCryptoAmount(totalPrice);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectCoinItem?.name && props.amount && props.currency && props.amount > 0) {
      updateRate();
    }
  }, [selectCoinItem?.name, props.amount, props.currency]);

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant={'h5'} textAlign={'center'} mt={1}>
            Select Chain and Crypto
          </Typography>
        </CardContent>
      </Card>
      <Box mt={2}>
        {blockchain &&
          blockchain.length > 0 &&
          blockchain.map((item, index) => (
            <Accordion expanded={expanded === item.name} onChange={handleChange(item.name)} key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content">
                <Typography sx={{ width: '33%', flexShrink: 0 }}>{item.name}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
              </AccordionSummary>
              {item.coins &&
                item.coins.length > 0 &&
                item.coins.map((coinItem, coinIndex) => (
                  <AccordionDetails key={coinIndex}>
                    <Button
                      fullWidth
                      onClick={async () => {
                        setSelectCoinItem(coinItem);
                      }}
                    >
                      <Image src={coinItem.icon} alt="icon" width={50} height={50} />
                      <Typography ml={2}>{coinItem.name}</Typography>
                    </Button>
                  </AccordionDetails>
                ))}
            </Accordion>
          ))}
      </Box>

      {selectCoinItem && cryptoAmount && parseFloat(cryptoAmount) > 0 && (
        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Crypto Rate: 1 {selectCoinItem.name} = {rate} {props.currency}
              </Typography>
              <Typography variant="h6">
                You will pay: {cryptoAmount} {selectCoinItem.name}
              </Typography>
              <Box mt={2}>
                <Button
                  variant={'contained'}
                  fullWidth
                  onClick={async () => {
                    await props.onClickCoin(selectCoinItem, cryptoAmount, rate);
                  }}
                >
                  Create Invoice
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};
