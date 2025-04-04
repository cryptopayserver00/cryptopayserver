import { ContentCopy, CopyAll, QrCode } from '@mui/icons-material';
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
  Grid,
  FormControl,
  OutlinedInput,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
  DialogActions,
  Chip,
} from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { CURRENCY_SYMBOLS, PAYOUT_SOURCE_TYPE, PAYOUT_STATUS, PULL_PAYMENT_STATUS } from 'packages/constants';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS, COIN } from 'packages/constants/blockchain';
import Image from 'next/image';
import { FindChainNamesByChains, GetBlockchainTxUrlByChainIds } from 'utils/web3';
import { QRCodeSVG } from 'qrcode.react';
import { OmitMiddleString } from 'utils/strings';

type pullPaymentType = {
  userId: number;
  storeId: number;
  pullPaymentId: number;
  network: number;
  name: string;
  storeName: string;
  storeLogoUrl: string;
  storeWebsite: string;
  amount: number;
  currency: string;
  showAutoApproveClaim: boolean;
  description: string;
  pullPaymentStatus: string;
  createdDate: string;
  updateDate: string;
  expirationDate: string;
};

type PayoutType = {
  address: string;
  chain: number;
  chainName: string;
  crypto: string;
  cryptoAmount: string;
  amount: number;
  currency: string;
  tx: string;
  status: string;
};

const PullPaymentsDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const [page, setPage] = useState<number>(1);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');

  const [pullPaymentData, setPullPaymentData] = useState<pullPaymentType>();
  const [payoutRows, setPayoutRows] = useState<PayoutType[]>([]);
  const [alreadyClaim, setAlreadyClaim] = useState<number>(0);
  const [showQR, setShowQR] = useState<boolean>(false);

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const getClaimsHistory = async (storeId: number, network: number, pullPaymentId: number) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_source_type, {
        params: {
          store_id: storeId,
          network: network,
          source_type: PAYOUT_SOURCE_TYPE.PullPayment,
          external_payment_id: pullPaymentId,
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let rt: PayoutType[] = [];
          let paid = 0;
          response.data.forEach((item: any) => {
            rt.push({
              chain: item.chain_id,
              chainName: FindChainNamesByChains(item.chain_id as CHAINS),
              address: item.address,
              amount: item.amount,
              cryptoAmount: item.crypto_amount,
              crypto: item.crypto,
              currency: item.currency,
              tx: item.tx,
              status: item.payout_status,
            });

            if (item.payout_status === PAYOUT_STATUS.Completed) {
              paid += parseFloat(item.amount);
            }
          });
          setPayoutRows(rt);
          setAlreadyClaim(paid);
        } else {
          setPayoutRows([]);
          setAlreadyClaim(0);
        }
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not find the data on site!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async (id: any) => {
    setWebsiteUrl(window.location.href);

    try {
      if (!id) return;

      const response: any = await axios.get(Http.find_pull_payment_by_id, {
        params: {
          id: id,
        },
      });

      if (response.result) {
        setPullPaymentData({
          userId: response.data.user_id,
          storeId: response.data.store_id,
          network: response.data.network,
          pullPaymentId: response.data.pull_payment_id,
          name: response.data.name,
          storeName: response.data.store_name,
          storeLogoUrl: response.data.store_logo_url,
          storeWebsite: response.data.store_website,
          amount: response.data.amount,
          currency: response.data.currency,
          description: response.data.description,
          showAutoApproveClaim: response.data.show_auto_approve_claim === 1 ? true : false,
          createdDate: new Date(response.data.created_at).toLocaleString(),
          updateDate: new Date(response.data.updated_at).toLocaleString(),
          expirationDate: new Date(response.data.expiration_at).toLocaleString(),
          pullPaymentStatus: response.data.pull_payment_status,
        });

        await getClaimsHistory(response.data.store_id, response.data.network, response.data.pull_payment_id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onClickShowQR = async () => {
    setShowQR(true);
  };

  const onClickCoin = async (item: COIN, address: string, amount: number) => {
    if (!item || !address || !amount) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect parameters');
      setSnackOpen(true);
      return;
    }

    const availableClaim = Number(pullPaymentData?.amount) + alreadyClaim;
    if (amount > availableClaim) {
      setSnackSeverity('error');
      setSnackMessage('Available claim is ' + CURRENCY_SYMBOLS[String(pullPaymentData?.currency)] + availableClaim);
      setSnackOpen(true);
      return;
    }

    try {
      const response: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: item.chainId,
          address: address,
          network: pullPaymentData?.network,
        },
      });

      if (!response.result) {
        setSnackSeverity('error');
        setSnackMessage('The input address is invalid, please try it again!');
        setSnackOpen(true);
        return;
      }

      const create_payout_resp: any = await axios.post(Http.create_payout, {
        user_id: pullPaymentData?.userId,
        store_id: pullPaymentData?.storeId,
        network: pullPaymentData?.network,
        chain_id: item.chainId,
        address: address,
        source_type: PAYOUT_SOURCE_TYPE.PullPayment,
        amount: amount,
        currency: pullPaymentData?.currency,
        crypto: item.name,
        external_payment_id: pullPaymentData?.pullPaymentId,
      });

      if (create_payout_resp.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);

        await init(id);

        setPage(1);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  return (
    <Box mt={4}>
      <Container>
        <Typography textAlign={'center'} variant="h6">
          {pullPaymentData?.name}
        </Typography>
        <Typography textAlign={'center'} mt={1} fontWeight={'bold'}>
          Pull payments from{' '}
          <Link href={pullPaymentData?.storeWebsite} target="_blank">
            {pullPaymentData?.storeName}
          </Link>
        </Typography>

        {pullPaymentData?.storeLogoUrl && (
          <Box textAlign={'center'} mt={2}>
            <Image alt="logo" src={pullPaymentData?.storeLogoUrl} width={200} height={200} />
          </Box>
        )}
        {/* {pullPaymentData && alreadyClaim >= pullPaymentData?.amount && (
          <Box mt={2}>
            <Alert variant="filled" severity="success">
              The pull payment has reached its limit, and you can read the detail of the payout.
            </Alert>
          </Box>
        )} */}

        {pullPaymentData && pullPaymentData?.pullPaymentStatus !== PULL_PAYMENT_STATUS.Active && (
          <Box mt={2}>
            <Alert
              variant="filled"
              severity={
                (pullPaymentData?.pullPaymentStatus === PULL_PAYMENT_STATUS.Archived && 'info') ||
                (pullPaymentData?.pullPaymentStatus === PULL_PAYMENT_STATUS.Expired && 'warning') ||
                (pullPaymentData?.pullPaymentStatus === PULL_PAYMENT_STATUS.Future && 'warning') ||
                (pullPaymentData?.pullPaymentStatus === PULL_PAYMENT_STATUS.Settled && 'success') ||
                'info'
              }
            >
              The pull payment has been {pullPaymentData?.pullPaymentStatus}, and you can read the detail of the payout.
            </Alert>
          </Box>
        )}

        {page === 1 && (
          <Box>
            <Grid container spacing={2} mt={2}>
              <Grid item xs={6}>
                <Card style={{ height: 260 }}>
                  <CardContent>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Typography>Start Date</Typography>
                      <Typography ml={1}>{pullPaymentData?.createdDate}</Typography>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'} mt={1}>
                      <Typography>Last Updated</Typography>
                      <Typography ml={1}>{pullPaymentData?.updateDate}</Typography>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'} mt={1}>
                      <Typography>Expiration Date</Typography>
                      <Typography ml={1}>{pullPaymentData?.expirationDate}</Typography>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'} mt={4}>
                      <Button
                        variant={'outlined'}
                        onClick={async () => {
                          await navigator.clipboard.writeText(websiteUrl);

                          setSnackMessage('Successfully copy');
                          setSnackSeverity('success');
                          setSnackOpen(true);
                        }}
                      >
                        Copy Link
                      </Button>
                      <Box ml={1}>
                        <Button
                          component="label"
                          role={undefined}
                          variant={'outlined'}
                          tabIndex={-1}
                          startIcon={<QrCode />}
                          onClick={onClickShowQR}
                        >
                          Show QR
                        </Button>
                      </Box>
                    </Stack>

                    <Typography mt={4}>{pullPaymentData?.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card style={{ height: 260 }}>
                  <CardContent>
                    <Typography variant="h5">Payment Details</Typography>
                    <Stack mt={4} direction={'row'} color={'green'}>
                      <Typography fontWeight={'bold'}>
                        {CURRENCY_SYMBOLS[String(pullPaymentData?.currency)]}
                        {(Number(pullPaymentData?.amount) - alreadyClaim).toFixed(2)}
                      </Typography>
                    </Stack>
                    <Typography mt={1}>Available claim</Typography>

                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={4}>
                      <Box>
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'left'}>
                          <Typography fontWeight={'bold'}>
                            {CURRENCY_SYMBOLS[String(pullPaymentData?.currency)]}
                            {alreadyClaim}
                          </Typography>
                        </Stack>
                        <Typography>Already claimed</Typography>
                      </Box>
                      <Box>
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'right'}>
                          <Typography mr={1} fontWeight={'bold'} color={'red'}>
                            {CURRENCY_SYMBOLS[String(pullPaymentData?.currency)]}
                            {pullPaymentData?.amount}
                          </Typography>
                        </Stack>
                        <Typography>Claim limit</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box mt={4}>
              <Card>
                <CardContent>
                  <Typography variant="h5">Claims</Typography>
                  <Box mt={4}>
                    {payoutRows && payoutRows.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table aria-label="simple table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Destination</TableCell>
                              <TableCell>Chain</TableCell>
                              <TableCell>Amount requested</TableCell>
                              <TableCell>Crypto</TableCell>
                              <TableCell align="right">Crypto Amount</TableCell>
                              <TableCell>Transaction</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <>
                              {payoutRows.map((row, index) => (
                                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                  <TableCell>{row.address}</TableCell>
                                  <TableCell>{row.chainName}</TableCell>
                                  <TableCell>
                                    <Typography align="right" width={120}>
                                      {CURRENCY_SYMBOLS[row.currency]}
                                      {row.amount}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">{row.crypto}</TableCell>
                                  <TableCell align="right">
                                    <Typography width={120}>{row.cryptoAmount}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Link
                                      href={GetBlockchainTxUrlByChainIds(
                                        pullPaymentData?.network === 1 ? true : false,
                                        row.chain,
                                        row.tx,
                                      )}
                                      target={'blank'}
                                    >
                                      {OmitMiddleString(row.tx)}
                                    </Link>
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={row.status} variant={'filled'} color={'info'} />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography>No payments have been made yet.</Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {pullPaymentData &&
              alreadyClaim < pullPaymentData?.amount &&
              pullPaymentData?.pullPaymentStatus === PULL_PAYMENT_STATUS.Active && (
                <Box mt={4}>
                  <Button
                    variant={'contained'}
                    fullWidth
                    size="large"
                    onClick={() => {
                      setPage(2);
                    }}
                  >
                    Claim Funds
                  </Button>
                </Box>
              )}
          </Box>
        )}
        {page === 2 && (
          <Box mt={2}>
            <Button
              variant={'outlined'}
              size="large"
              onClick={() => {
                setPage(1);
              }}
            >
              Back
            </Button>

            <Box mt={1}>
              <SelectChainAndCrypto
                network={Number(pullPaymentData?.network)}
                amount={Number(pullPaymentData?.amount)}
                currency={String(pullPaymentData?.currency)}
                onClickCoin={onClickCoin}
              />
            </Box>
          </Box>
        )}
      </Container>

      <Dialog
        onClose={() => {
          setShowQR(false);
        }}
        open={showQR}
        fullWidth
      >
        <DialogTitle>Pull Payment QR</DialogTitle>
        <DialogContent>
          <Box mt={2} textAlign={'center'}>
            <QRCodeSVG
              value={websiteUrl}
              width={250}
              height={250}
              imageSettings={{
                src: '',
                width: 35,
                height: 35,
                excavate: false,
              }}
            />
          </Box>

          <Box mt={4}>
            <Typography>PULL PAYMENT QR</Typography>
            <Stack direction={'row'} alignItems={'center'}>
              <Typography mr={1}>{OmitMiddleString(websiteUrl, 20)}</Typography>
              <IconButton
                onClick={async () => {
                  await navigator.clipboard.writeText(websiteUrl);

                  setSnackMessage('Successfully copy');
                  setSnackSeverity('success');
                  setSnackOpen(true);
                }}
              >
                <CopyAll />
              </IconButton>
            </Stack>
          </Box>

          <Box mt={4}>
            <Typography>Scan this QR code to open this page on your mobile device.</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PullPaymentsDetails;

type SelectType = {
  network: number;
  amount: number;
  currency: string;
  onClickCoin: (item: COIN, address: string, amount: number) => Promise<void>;
};

const SelectChainAndCrypto = (props: SelectType) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>([]);
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>();

  const [open, setOpen] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) => (props.network === 1 ? item.isMainnet : !item.isMainnet));
    setBlcokchain(value);
  }, [props.network]);

  const handleOpen = async (chainId: number) => {
    setOpen(true);
  };

  const handleClose = () => {
    setAddress('');
    setAmount(0);

    setOpen(false);
  };

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
                <Typography sx={{ width: '33%', flexShrink: 0 }} fontWeight={'bold'}>
                  {item.name.toUpperCase()}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
              </AccordionSummary>
              {item.coins &&
                item.coins.length > 0 &&
                item.coins.map((coinItem: COIN, coinIndex) => (
                  <AccordionDetails key={coinIndex}>
                    <Button
                      fullWidth
                      onClick={async () => {
                        setSelectCoinItem(coinItem);

                        await handleOpen(coinItem.chainId);
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

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">Claim free funds</DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <FormControl variant="outlined" fullWidth size={'small'}>
              <OutlinedInput
                type="text"
                endAdornment={
                  <InputAdornment position="end">
                    {FindChainNamesByChains(selectCoinItem?.chainId as CHAINS)}
                  </InputAdornment>
                }
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={address}
                onChange={(e: any) => {
                  setAddress(e.target.value);
                }}
                placeholder="Enter your address"
              />
            </FormControl>
          </Box>

          <Box mb={2}>
            <FormControl variant="outlined" fullWidth size={'small'}>
              <OutlinedInput
                type="number"
                endAdornment={<InputAdornment position="end">{props.currency}</InputAdornment>}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                value={amount}
                onChange={(e: any) => {
                  setAmount(e.target.value);
                }}
                placeholder="Enter you amount"
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant={'outlined'} onClick={handleClose}>
            Close
          </Button>
          <Button
            variant={'contained'}
            onClick={async () => {
              await props.onClickCoin(selectCoinItem as COIN, address, amount);
              handleClose();
            }}
          >
            Claim Funds
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
