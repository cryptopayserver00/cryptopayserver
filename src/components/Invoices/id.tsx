import { ContentCopy, HelpOutline, Lock, Store, WarningAmber } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Paper,
  Alert,
  IconButton,
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
import { CURRENCY_SYMBOLS, ORDER_STATUS, WALLET } from 'packages/constants';
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
import HelpDrawer from 'components/Drawer/HelpDrawer';
import ReportPaymentDialog from 'components/Dialog/ReportPaymentDialog';

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
  storeName: string;
  storeBrandColor: string;
  storeLogoUrl: string;
  storeWebsite: string;
};

const InvoiceDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const [countdownVal, setCountdownVal] = useState<string>('0');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const [order, setOrder] = useState<OrderType>();

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
          storeName: response.data.store_name,
          storeBrandColor: response.data.store_brand_color,
          storeLogoUrl: response.data.store_logo_url,
          storeWebsite: response.data.store_website,
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
    if (!order?.expirationDate || order?.expirationDate <= 0) {
      return;
    }

    const currentTime = Date.now();
    const remainingTime = order?.expirationDate - currentTime;

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
  }, [order?.expirationDate]);

  return (
    <Box mt={4}>
      <Container>
        {order?.network === 2 && (
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

        <Box mb={2}>
          {order?.orderStatus === ORDER_STATUS.Settled && (
            <Alert variant="filled" severity="success">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>The order has been paid successfully</Typography>
              </Stack>
            </Alert>
          )}

          {order?.orderStatus === ORDER_STATUS.Expired && (
            <Alert variant="filled" severity="warning">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>The order has expired, please do not continue to pay</Typography>
              </Stack>
            </Alert>
          )}
          {order?.orderStatus === ORDER_STATUS.Invalid && (
            <Alert variant="filled" severity="error">
              <Stack direction={'row'} alignItems={'center'}>
                <Typography>The order has invalid, please do not continue to pay</Typography>
              </Stack>
            </Alert>
          )}
        </Box>

        <Grid container spacing={20}>
          <Grid item xs={6} md={6} sm={6}>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <Stack direction={'row'} alignItems={'center'}>
                {order?.storeLogoUrl ? (
                  <Image alt="logo" src={order?.storeLogoUrl} width={100} height={40} />
                ) : (
                  <Icon component={Store} />
                )}
                <Box mx={1}>
                  <Link href={String(order?.storeWebsite)}>{order?.storeName}</Link>
                </Box>
                {order?.network === 2 && <Chip label="TestMode" color={'warning'} variant={'filled'} />}
              </Stack>

              <Stack direction={'row'} alignItems={'center'}>
                {countdownVal !== '0' && <Typography mx={1}>{countdownVal}</Typography>}
                <IconButton
                  aria-label="icon"
                  onClick={() => {
                    setOpenDrawer(true);
                  }}
                >
                  <HelpOutline />
                </IconButton>
              </Stack>
            </Stack>

            <Stack direction={'row'} alignItems={'center'} mt={6}>
              <Typography variant="h4" fontWeight={'bold'}>
                {order?.totalPrice}
              </Typography>
              <Typography ml={1} variant="h4" fontWeight={'bold'}>
                {order?.crypto}
              </Typography>
            </Stack>

            <Box py={4}>
              <Divider />
            </Box>

            <Box>
              <Typography>Invoice Information</Typography>

              <Stack direction={'row'} mt={4}>
                <Box>
                  <Typography mt={1}>Invoice</Typography>
                  <Typography mt={1}>Due Date</Typography>
                  <Typography mt={1}>Description</Typography>
                  <Typography mt={1}>Buyer Email</Typography>
                  <Typography mt={1}>Metadata</Typography>
                </Box>
                <Box ml={6}>
                  <Typography mt={1}>{order?.orderId ? order?.orderId : 'None'}</Typography>
                  <Typography mt={1}>
                    {order?.expirationDate ? new Date(Number(order?.expirationDate)).toLocaleString() : 'No due date'}
                  </Typography>
                  <Typography mt={1}>{order?.description ? order?.description : 'None'}</Typography>
                  <Typography mt={1}>{order?.buyerEmail ? order?.buyerEmail : 'None'}</Typography>
                  <Typography mt={1}>{order?.metadata ? order?.metadata : 'None'}</Typography>
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
                  {order?.totalPrice} {order?.crypto}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Total Fiat</Typography>
                <Typography fontWeight={'bold'}>
                  {CURRENCY_SYMBOLS[String(order?.currency)]}
                  {order?.amount}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Exchange Rate</Typography>
                <Typography fontWeight={'bold'}>
                  1 {order?.crypto} = {CURRENCY_SYMBOLS[String(order?.currency)]}
                  {order?.rate}
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                <Typography>Amount Due</Typography>
                <Typography fontWeight={'bold'}>
                  {order?.amountDue} {order?.crypto}
                </Typography>
              </Stack>
            </Box>

            {order?.orderStatus === ORDER_STATUS.Settled && (
              <>
                <Box py={4}>
                  <Divider />
                </Box>
                <Box mt={2}>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                    <Typography>Order Status</Typography>
                    <Chip label={order?.orderStatus} color={'success'} variant={'filled'} />
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                    <Typography>Hash</Typography>
                    <Link
                      target="_blank"
                      href={GetBlockchainTxUrlByChainIds(
                        order?.network === 1 ? true : false,
                        order?.chainId,
                        order?.hash,
                      )}
                    >
                      {OmitMiddleString(order?.hash)}
                    </Link>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                    <Typography>From Address</Typography>
                    <Link
                      target="_blank"
                      href={GetBlockchainAddressUrlByChainIds(
                        order?.network === 1 ? true : false,
                        order?.chainId,
                        order?.fromAddress,
                      )}
                    >
                      {OmitMiddleString(order?.fromAddress)}
                    </Link>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mb={1}>
                    <Typography>To Address</Typography>
                    <Link
                      target="_blank"
                      href={GetBlockchainAddressUrlByChainIds(
                        order?.network === 1 ? true : false,
                        order?.chainId,
                        order?.toAddress,
                      )}
                    >
                      {OmitMiddleString(order?.toAddress)}
                    </Link>
                  </Stack>
                </Box>
              </>
            )}

            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={10}>
              <Stack direction={'row'} alignItems={'center'}>
                <Icon component={Lock} />
                <Typography ml={1}>Secured by</Typography>
                <Typography fontWeight={'bold'} ml={1}>
                  CryptoPayServer
                </Typography>
              </Stack>

              <Stack direction={'row'} alignItems={'center'} gap={0.5}>
                <Link href={'#'}>Terms</Link>
                <Typography>·</Typography>
                <Link href={'#'}>Privacy</Link>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={6} md={6} sm={6}>
            <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography>Payment Method</Typography>
              <Button
                variant="outlined"
                startIcon={<WarningAmber />}
                onClick={() => {
                  setOpenDialog(true);
                }}
                color={'warning'}
              >
                Report
              </Button>
            </Stack>

            <Box mt={2}>
              <Typography mb={2}>Deposit currency</Typography>
              {order?.crypto && (
                <Button
                  variant={'contained'}
                  color={'success'}
                  startIcon={
                    <Image alt="crypto" width={20} height={20} src={GetImgSrcByCrypto(order?.crypto as COINS)} />
                  }
                  fullWidth
                >
                  {order?.crypto}
                </Button>
              )}

              <Typography my={2}>Select network</Typography>
              {order?.chainId && (
                <Button
                  variant={'contained'}
                  color={'success'}
                  startIcon={
                    <Image alt="chain" width={20} height={20} src={GetImgSrcByChain(order?.chainId as CHAINS)} />
                  }
                  fullWidth
                >
                  {FindChainNamesByChains(order?.chainId)?.toUpperCase()}
                </Button>
              )}
            </Box>

            <Box mt={2} textAlign={'center'}>
              <Paper style={{ padding: 20 }}>
                <QRCodeSVG
                  value={String(order?.qrCodeText)}
                  width={'100%'}
                  height={'100%'}
                  imageSettings={{
                    src: GetImgSrcByCrypto(order?.crypto as COINS),
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
                      await navigator.clipboard.writeText(String(order?.destinationAddress));

                      setSnackMessage('Successfully copy');
                      setSnackSeverity('success');
                      setSnackOpen(true);
                    }}
                  >
                    {OmitMiddleString(String(order?.destinationAddress))}
                  </Button>
                </Box>

                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={1} gap={2}>
                  <Button
                    variant={'contained'}
                    startIcon={<ContentCopy />}
                    fullWidth
                    onClick={async () => {
                      await navigator.clipboard.writeText(String(order?.destinationAddress));

                      setSnackMessage('Successfully copy');
                      setSnackSeverity('success');
                      setSnackOpen(true);
                    }}
                  >
                    Copy Address
                  </Button>

                  {order?.orderStatus !== 'Settled' && (
                    <WalletConnectButton
                      color={'success'}
                      network={Number(order?.network)}
                      chainId={Number(order?.chainId)}
                      address={String(order?.destinationAddress)}
                      contractAddress={
                        FindTokenByChainIdsAndSymbol(
                          GetChainIds(order?.network === 1 ? true : false, Number(order?.chainId)),
                          order?.crypto as COINS,
                        )?.contractAddress
                      }
                      decimals={
                        FindTokenByChainIdsAndSymbol(
                          GetChainIds(order?.network === 1 ? true : false, Number(order?.chainId)),
                          order?.crypto as COINS,
                        )?.decimals
                      }
                      value={String(order?.totalPrice)}
                      buttonSize={'medium'}
                      buttonVariant={'contained'}
                      fullWidth={true}
                    />
                  )}
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        <HelpDrawer openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
        <ReportPaymentDialog openDialog={openDialog} setOpenDialog={setOpenDialog} />
      </Container>
    </Box>
  );
};

export default InvoiceDetails;
