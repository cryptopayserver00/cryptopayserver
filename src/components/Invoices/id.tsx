import { ContentCopy, ExpandMore, HelpOutline, Lock, Store, WarningAmber } from '@mui/icons-material';
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
  AlertTitle,
  Icon,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { QRCodeSVG } from 'qrcode.react';
import { OmitMiddleString } from 'utils/strings';
import { CURRENCY_SYMBOLS, ORDER_STATUS } from 'packages/constants';
import { GetImgSrcByChain, GetImgSrcByCrypto } from 'utils/qrcode';
import Link from 'next/link';
import {
  FindChainNamesByChains,
  FindTokenByChainIdsAndSymbol,
  GetBlockchainAddressUrlByChainIds,
  GetBlockchainTxUrlByChainIds,
  GetChainIds,
} from 'utils/web3';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import WalletConnectButton from 'components/Button/WalletConnectButton';
import Image from 'next/image';

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
  qrCodeText: string;
};

const InvoiceDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

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
    qrCodeText: '',
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
          createdDate: new Date(response.data.created_at).getTime(),
          expirationDate: new Date(response.data.expiration_at).getTime(),
          rate: response.data.rate,
          totalPrice: response.data.crypto_amount,
          amountDue: response.data.crypto_amount,
          fromAddress: response.data.from_address,
          toAddress: response.data.to_address,
          hash: response.data.hash,
          blockTimestamp: Number(response.data.block_timestamp),
          network: response.data.network,
          chainId: response.data.chain_id,
          qrCodeText: response.data.qr_code_text,
        });
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
      <Container>
        {order.network === 2 && (
          <Box mb={2}>
            <Alert severity="warning">
              <AlertTitle>Warning</AlertTitle>
              <Typography>
                This is a test network, and the currency has no real value. If you need free coins, you can get
                them&nbsp;
                <Link href={'/freecoin'} target="_blank">
                  here.
                </Link>
              </Typography>
            </Alert>
          </Box>
        )}

        <Grid container spacing={20}>
          <Grid item xs={6} md={6} sm={6}>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <Stack direction={'row'} alignItems={'center'}>
                <Icon component={Store} />
                <Typography mx={1}>Merchant account</Typography>
                <Chip label="TestMode" color={'warning'} variant={'filled'} />
              </Stack>

              <Stack direction={'row'} alignItems={'center'}>
                <Typography mx={1}>{countdownVal}</Typography>
                <IconButton aria-label="icon">
                  <HelpOutline />
                </IconButton>
              </Stack>
            </Stack>

            <Stack direction={'row'} alignItems={'center'} mt={6}>
              <Typography variant="h4" fontWeight={'bold'}>
                {order.totalPrice}
              </Typography>
              <Typography ml={1} variant="h4" fontWeight={'bold'}>
                {order.crypto}
              </Typography>
            </Stack>

            <Box py={4}>
              <Divider />
            </Box>

            <Box>
              <Typography>Invoice Information</Typography>

              <Stack direction={'row'} mt={4}>
                <Box>
                  <Typography>To</Typography>
                  <Typography mt={1}>Invoice</Typography>
                  <Typography mt={1}>Due Date</Typography>
                  <Typography mt={1}>Memo</Typography>
                </Box>
                <Box ml={6}>
                  <Typography>test</Typography>
                  <Typography mt={1}>{order.orderId}</Typography>
                  <Typography mt={1}>04/15/2025</Typography>
                  <Typography mt={1}>{order.description}</Typography>
                </Box>
              </Stack>
            </Box>

            <Box py={4}>
              <Divider />
            </Box>

            <Box>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Total Price</Typography>
                <Typography fontWeight={'bold'}>
                  {order.totalPrice} {order.crypto}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Total Fiat</Typography>
                <Typography fontWeight={'bold'}>
                  {CURRENCY_SYMBOLS[order.currency]}
                  {order.amount}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Exchange Rate</Typography>
                <Typography fontWeight={'bold'}>
                  1 {order.crypto} = {CURRENCY_SYMBOLS[order.currency]}
                  {order.rate}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Amount Due</Typography>
                <Typography fontWeight={'bold'}>
                  {order.amountDue} {order.crypto}
                </Typography>
              </Stack>
            </Box>

            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={33}>
              <Stack direction={'row'} alignItems={'center'}>
                <Icon component={Lock} />
                <Typography ml={1} fontWeight={'bold'}>
                  Secured by CryptoPayServer
                </Typography>
              </Stack>

              <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                <Typography>Terms</Typography>
                <Typography>·</Typography>
                <Typography>Privacy</Typography>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={6} md={6} sm={6}>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography>Payment Method</Typography>
              <Button variant="outlined" startIcon={<WarningAmber />}>
                Report
              </Button>
            </Stack>

            <Box mt={2}>
              <Typography mb={2}>Deposit currency</Typography>
              <Button
                variant="outlined"
                startIcon={<Image alt="crypto" width={20} height={20} src={GetImgSrcByCrypto(order.crypto as COINS)} />}
                fullWidth
              >
                {order.crypto}
              </Button>
              <Typography my={2}>Select network</Typography>
              <Button
                variant="outlined"
                startIcon={<Image alt="chain" width={20} height={20} src={GetImgSrcByChain(order.chainId as CHAINS)} />}
                fullWidth
              >
                {FindChainNamesByChains(order.chainId)?.toUpperCase()}
              </Button>
            </Box>

            {order.orderStatus === ORDER_STATUS.Processing && (
              <Box mt={2} textAlign={'center'}>
                <Paper style={{ padding: 20 }}>
                  <QRCodeSVG
                    value={order.qrCodeText}
                    width={'100%'}
                    height={'100%'}
                    imageSettings={{
                      src: GetImgSrcByCrypto(order.crypto as COINS),
                      width: 20,
                      height: 20,
                      excavate: true,
                    }}
                  />

                  <Box mt={2}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={async () => {
                        await navigator.clipboard.writeText(order.destinationAddress);

                        setSnackMessage('Successfully copy');
                        setSnackSeverity('success');
                        setSnackOpen(true);
                      }}
                    >
                      {order.destinationAddress}
                    </Button>
                  </Box>

                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1} gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={<ContentCopy />}
                      fullWidth
                      onClick={async () => {
                        await navigator.clipboard.writeText(order.destinationAddress);

                        setSnackMessage('Successfully copy');
                        setSnackSeverity('success');
                        setSnackOpen(true);
                      }}
                    >
                      Copy Address
                    </Button>

                    {order.orderStatus === ORDER_STATUS.Processing && (
                      <WalletConnectButton
                        network={order.network}
                        chainId={order.chainId}
                        address={order.destinationAddress}
                        contractAddress={
                          FindTokenByChainIdsAndSymbol(
                            GetChainIds(order.network === 1 ? true : false, order.chainId),
                            order.crypto as COINS,
                          ).contractAddress
                        }
                        decimals={
                          FindTokenByChainIdsAndSymbol(
                            GetChainIds(order.network === 1 ? true : false, order.chainId),
                            order.crypto as COINS,
                          ).decimals
                        }
                        value={order.totalPrice}
                        buttonSize={'medium'}
                        buttonVariant={'contained'}
                        fullWidth={true}
                      />
                    )}
                  </Stack>
                </Paper>
              </Box>
            )}
          </Grid>
        </Grid>

        <Typography textAlign={'center'}>{order.description}</Typography>
        <Stack direction={'row'} alignItems={'center'} mt={2} justifyContent={'center'}>
          <Typography variant="h4" fontWeight={'bold'}>
            {order.totalPrice}
          </Typography>
          <Typography ml={1} variant="h4" fontWeight={'bold'}>
            {order.crypto}
          </Typography>
        </Stack>

        <Box mt={2}>
          {order.orderStatus === ORDER_STATUS.Processing && (
            <Alert variant="filled" severity="info">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>This invoice will expire in</Typography>
                <Typography ml={1}>{countdownVal}</Typography>
                <Typography ml={1}>minutes</Typography>
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
                  {CURRENCY_SYMBOLS[order.currency]}
                  {order.amount}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Exchange Rate</Typography>
                <Typography fontWeight={'bold'}>
                  1 {order.crypto} = {CURRENCY_SYMBOLS[order.currency]}
                  {order.rate}
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
                    {order.hash}
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
                value={order.qrCodeText}
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
            <Typography mr={1} fontWeight={'bold'}>
              {OmitMiddleString(order.destinationAddress, 10)}
            </Typography>
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
            <WalletConnectButton
              network={order.network}
              chainId={order.chainId}
              address={order.destinationAddress}
              contractAddress={
                FindTokenByChainIdsAndSymbol(
                  GetChainIds(order.network === 1 ? true : false, order.chainId),
                  order.crypto as COINS,
                ).contractAddress
              }
              decimals={
                FindTokenByChainIdsAndSymbol(
                  GetChainIds(order.network === 1 ? true : false, order.chainId),
                  order.crypto as COINS,
                ).decimals
              }
              value={order.totalPrice}
              buttonSize={'large'}
              buttonVariant={'contained'}
              fullWidth={true}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default InvoiceDetails;
