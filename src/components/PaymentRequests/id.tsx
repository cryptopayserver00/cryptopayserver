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
} from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { QRCodeSVG } from 'qrcode.react';
import { OmitMiddleString } from 'utils/strings';
import { COINGECKO_IDS, ORDER_STATUS } from 'packages/constants';
import { GetImgSrcByCrypto } from 'utils/qrcode';
import Link from 'next/link';
import { FindChainNamesByChains, GetBlockchainAddressUrlByChainIds, GetBlockchainTxUrlByChainIds } from 'utils/web3';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from 'packages/constants/blockchain';
import Image from 'next/image';
import { BigDiv } from 'utils/number';

type paymentRequestType = {
  userId: number;
  storeId: number;
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

const PaymentRequestsDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const [page, setPage] = useState<number>(1);

  const [paymentRequestData, setPaymentRequestData] = useState<paymentRequestType>();

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

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
                  <Typography mt={2}>No payments have been made yet.</Typography>
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
      const totalPrice = parseFloat(BigDiv((props.amount as number).toString(), rate)).toFixed(8);
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
