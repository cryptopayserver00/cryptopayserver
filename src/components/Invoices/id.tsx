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
import { ORDER_STATUS } from 'packages/constants';
import { GetImgSrcByCrypto } from 'utils/qrcode';
import Link from 'next/link';
import { FindChainNamesByChains, GetBlockchainAddressUrlByChainIds, GetBlockchainTxUrlByChainIds } from 'utils/web3';
import { COINS } from 'packages/constants/blockchain';

type OrderType = {
  orderId: number;
  amount: number;
  buyerEmail: string;
  crypto: string;
  currency: string;
  description: string;
  destinationAddress: string;
  metadata: string;
  notificationEmail: string;
  notificationUrl: string;
  orderStatus: string;
  paid: number;
  paymentMethod: string;
  createdDate: number;
  expirationDate: number;
  rate: number;
  totalPrice: string;
  amountDue: string;
  fromAddress: string;
  toAddress: string;
  hash: string;
  blockTimestamp: number;
  network: number;
  chainId: number;
};

const InvoiceDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const [qrCodeVal, setQrCodeVal] = useState<string>('');
  const [countdownVal, setCountdownVal] = useState<string>('0');

  const [order, setOrder] = useState<OrderType>({
    orderId: 0,
    amount: 0,
    buyerEmail: '',
    crypto: '',
    currency: '',
    description: '',
    destinationAddress: '',
    metadata: '',
    notificationEmail: '',
    notificationUrl: '',
    orderStatus: '',
    paid: 0,
    paymentMethod: '',
    createdDate: 0,
    expirationDate: 0,
    rate: 0,
    totalPrice: '0',
    amountDue: '0',
    fromAddress: '',
    toAddress: '',
    hash: '',
    blockTimestamp: 0,
    network: 0,
    chainId: 0,
  });

  const init = async (id: any) => {
    try {
      const response: any = await axios.get(Http.find_invoice_by_id, {
        params: {
          id: id,
        },
      });

      if (response.result) {
        setOrder({
          orderId: response.data.order_id,
          amount: response.data.amount,
          buyerEmail: response.data.buyer_email,
          crypto: response.data.crypto,
          currency: response.data.currency,
          description: response.data.description,
          destinationAddress: response.data.destination_address,
          metadata: response.data.metadata,
          notificationEmail: response.data.notification_email,
          notificationUrl: response.data.notification_url,
          orderStatus: response.data.order_status,
          paid: response.data.paid,
          paymentMethod: response.data.payment_method,
          createdDate: response.data.created_date,
          expirationDate: response.data.expiration_date,
          rate: response.data.rate,
          totalPrice: response.data.crypto_amount,
          amountDue: response.data.crypto_amount,
          fromAddress: response.data.from_address,
          toAddress: response.data.to_address,
          hash: response.data.hash,
          blockTimestamp: response.data.block_timestamp,
          network: response.data.network,
          chainId: response.data.chain_id,
        });

        const qrVal =
          FindChainNamesByChains(response.data.chain_id) +
          ':' +
          response.data.destination_address +
          '?amount=' +
          response.data.crypto_amount +
          '&pj=' +
          location.href;
        setQrCodeVal(qrVal);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not find the invoice!');
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
    id && init(id);

    const activeInit = setInterval(() => {
      id && init(id);
    }, 10 * 1000);

    return () => clearInterval(activeInit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const countDownTime = () => {
    if (!order.expirationDate || order.expirationDate <= 0) {
      return;
    }

    const currentTime = Date.now();
    const remainingTime = order.expirationDate - currentTime;

    if (remainingTime <= 0) {
      return;
    }

    const seconds = Math.floor((remainingTime / 1000) % 60);
    const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    setCountdownVal(formattedTime);
  };

  useEffect(() => {
    const activeCountDownTime = setInterval(() => {
      countDownTime();
    }, 1000);

    return () => clearInterval(activeCountDownTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.expirationDate]);

  return (
    <Box mt={4}>
      <Container maxWidth="sm">
        <Typography textAlign={'center'}>{order.description}</Typography>
        <Stack direction={'row'} alignItems={'center'} mt={2} justifyContent={'center'}>
          <Typography fontSize={24} fontWeight={'bold'}>
            {order.totalPrice}
          </Typography>
          <Typography ml={1} fontSize={24} fontWeight={'bold'}>
            {order.crypto}
          </Typography>
        </Stack>

        <Box mt={2}>
          {order.orderStatus === ORDER_STATUS.Processing && (
            <Alert variant="filled" severity="info">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>This invoice will expire in</Typography>
                <Typography ml={1}>{countdownVal}</Typography>
              </Stack>
            </Alert>
          )}

          {order.orderStatus === ORDER_STATUS.Settled && (
            <Alert variant="filled" severity="success">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>The order has been paid successfully</Typography>
              </Stack>
            </Alert>
          )}

          {order.orderStatus === ORDER_STATUS.Expired && (
            <Alert variant="filled" severity="warning">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>The order has expired, please do not continue to pay</Typography>
              </Stack>
            </Alert>
          )}
          {order.orderStatus === ORDER_STATUS.Invalid && (
            <Alert variant="filled" severity="error">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>The order has invalid, please do not continue to pay</Typography>
              </Stack>
            </Alert>
          )}
        </Box>

        <Box mt={2}>
          <Card>
            <CardContent>
              <Typography textAlign={'center'} pt={1}>
                Send only <b>{FindChainNamesByChains(order.chainId)?.toUpperCase()}</b> assets to this address
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box mt={2}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
              View Details
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Total Price</Typography>
                <Typography fontWeight={'bold'}>
                  {order.totalPrice} {order.crypto}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Total Fiat</Typography>
                <Typography fontWeight={'bold'}>
                  {order.amount} {order.currency}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Exchange Rate</Typography>
                <Typography fontWeight={'bold'}>
                  1 {order.crypto} = {order.rate} {order.currency}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Amount Due</Typography>
                <Typography fontWeight={'bold'}>
                  {order.amountDue} {order.crypto}
                </Typography>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>

        {order.orderStatus === ORDER_STATUS.Settled && (
          <Box mt={2}>
            <Card>
              <CardContent>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                  <Typography>From Address</Typography>
                  <Link
                    target="_blank"
                    href={GetBlockchainAddressUrlByChainIds(
                      order.network === 1 ? true : false,
                      order.chainId,
                      order.fromAddress,
                    )}
                  >
                    {order.fromAddress}
                  </Link>
                </Stack>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                  <Typography>To Address</Typography>
                  <Link
                    target="_blank"
                    href={GetBlockchainAddressUrlByChainIds(
                      order.network === 1 ? true : false,
                      order.chainId,
                      order.toAddress,
                    )}
                  >
                    {order.toAddress}
                  </Link>
                </Stack>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                  <Typography>Hash</Typography>
                  <Link
                    target="_blank"
                    href={GetBlockchainTxUrlByChainIds(order.network === 1 ? true : false, order.chainId, order.hash)}
                  >
                    {OmitMiddleString(order.hash, 10)}
                  </Link>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {order.orderStatus === ORDER_STATUS.Processing && (
          <Box mt={2} textAlign={'center'}>
            <Paper style={{ padding: 20 }}>
              <QRCodeSVG
                value={qrCodeVal}
                width={250}
                height={250}
                imageSettings={{
                  src: GetImgSrcByCrypto(order.crypto as COINS),
                  width: 35,
                  height: 35,
                  excavate: false,
                }}
              />
            </Paper>
          </Box>
        )}

        <Box mt={4}>
          <Typography>ADDRESS</Typography>
          <Stack direction={'row'} alignItems={'center'}>
            <Typography mr={1}>{OmitMiddleString(order.destinationAddress, 10)}</Typography>
            <IconButton
              onClick={async () => {
                await navigator.clipboard.writeText(order.destinationAddress);

                setSnackMessage('Successfully copy');
                setSnackSeverity('success');
                setSnackOpen(true);
              }}
            >
              <ContentCopy fontSize={'small'} />
            </IconButton>
          </Stack>
        </Box>

        {order.orderStatus === ORDER_STATUS.Processing && (
          <Box mt={2}>
            <Button variant={'contained'} size={'large'} fullWidth onClick={() => {}}>
              Pay in wallet
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default InvoiceDetails;
