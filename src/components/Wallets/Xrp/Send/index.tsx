import {
  Box,
  Button,
  Chip,
  Container,
  FormControl,
  Grid,
  Icon,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { BigDiv } from 'utils/number';
import Image from 'next/image';
import { DecodeNonstandardCurrencyCode, OmitMiddleString } from 'utils/strings';
import { GetBlockchainAddressUrl, GetBlockchainTxUrl } from 'utils/chain/xrp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';
import { COINGECKO_IDS, PAYOUT_STATUS } from 'packages/constants';
import { useRouter } from 'next/router';
import { GetImgSrcByChain, GetImgSrcByCrypto } from 'utils/qrcode';
import { FindChainNamesByChains } from 'utils/web3';

type Coin = {
  [currency: string]: string;
};

type AddressBookRowType = {
  id: number;
  chainId: number;
  isMainnet: boolean;
  name: string;
  address: string;
};

type trustLineType = {
  account: string;
  balance: string;
  currency: string;
  limit: string;
  limitPeer: string;
  noRipple: boolean;
  noRipplePeer: boolean;
  qualityIn: number;
  qualityOut: number;
};

const XrpSend = () => {
  const router = useRouter();
  const { payoutId } = router.query;

  const [mainCoin, setMainCoin] = useState<COINS>();

  const [addressBookrows, setAddressBookrows] = useState<AddressBookRowType[]>([]);

  const [page, setPage] = useState<number>(1);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [balance, setBalance] = useState<Coin>({});
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [trustLines, setTrustLines] = useState<trustLineType[]>([]);
  const [networkFee, setNetworkFee] = useState<number>(0);
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');
  const [coin, setCoin] = useState<COINS>();
  const [amountRed, setAmountRed] = useState<boolean>(false);

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false);
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false);

  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const getBalance = async () => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: CHAINS.XRP,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setFromAddress(response.data.address);
        setBalance(response.data.balance);
        setMainCoin(response.data.main_coin.name);

        await getTokenTrustLine(response.data.address);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getTokenTrustLine = async (address: string) => {
    try {
      const response: any = await axios.get(Http.find_token_trust_line, {
        params: {
          chain_id: CHAINS.XRP,
          network: getNetwork() === 'mainnet' ? 1 : 2,
          address: address,
        },
      });
      if (response.result) {
        if (response.data && response.data.length > 0) {
          let tl: trustLineType[] = [];
          response.data.forEach((item: any) => {
            tl.push({
              account: item.account,
              balance: item.balance,
              currency: DecodeNonstandardCurrencyCode(item.currency),
              limit: item.limit,
              limitPeer: item.limit_peer,
              noRipple: item.no_ripple,
              noRipplePeer: item.no_ripple_peer,
              qualityIn: item.quality_in,
              qualityOut: item.quality_out,
            });
          });
          setTrustLines(tl);
        }
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
      return false;
    }
  };

  const getFeeRate = async () => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: CHAINS.XRP,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setNetworkFee(response.data.base_fee);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getAddressBook = async () => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          chain_id: CHAINS.XRP,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result && response.data.length > 0) {
        let rt: AddressBookRowType[] = [];
        response.data.forEach((item: any) => {
          rt.push({
            id: item.id,
            chainId: item.chain_id,
            isMainnet: item.network === 1 ? true : false,
            name: item.name,
            address: item.address,
          });
        });

        setAddressBookrows(rt);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPayoutInfo = async (id: any) => {
    try {
      const response: any = await axios.get(Http.find_payout_by_id, {
        params: {
          id: id,
        },
      });

      if (response.result) {
        setDestinationAddress(response.data.address);

        const ids = COINGECKO_IDS[response.data.crypto as COINS];
        const rate_response: any = await axios.get(Http.find_crypto_price, {
          params: {
            ids: ids,
            currency: response.data.currency,
          },
        });
        if (rate_response.result) {
          const rate = rate_response.data[ids][response.data.currency.toLowerCase()];
          const totalPrice = parseFloat(BigDiv(Number(response.data.amount).toString(), rate)).toFixed(8);

          setAmount(totalPrice);
          setCoin(response.data.crypto);

          setIsDisableDestinationAddress(true);
          setIsDisableAmount(true);
        }
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const checkAddress = async (): Promise<boolean> => {
    if (destinationAddress === fromAddress) {
      return false;
    }

    if (!destinationAddress || destinationAddress === '') {
      return false;
    }

    try {
      const response: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: CHAINS.XRP,
          address: destinationAddress,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      return response.result;
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
      return false;
    }
  };

  const checkAmount = (): boolean => {
    if (amount && parseFloat(amount) > 0 && parseFloat(balance[String(coin)]) >= parseFloat(amount)) {
      return true;
    }

    return false;
  };

  const onClickSignTransaction = async () => {
    if (!(await checkAddress())) {
      setSnackSeverity('error');
      setSnackMessage('The destination address cannot be empty or input errors');
      setSnackOpen(true);
      return;
    }

    if (!checkAmount()) {
      setSnackSeverity('error');
      setSnackMessage('Insufficient balance or input error');
      setSnackOpen(true);
      return;
    }

    if (coin === mainCoin) {
      if (!networkFee || !amount || networkFee + parseFloat(amount) > parseFloat(balance[String(mainCoin)])) {
        setSnackSeverity('error');
        setSnackMessage('Insufficient balance or Insufficient gas fee');
        setSnackOpen(true);
        return;
      }
    } else {
      if (!networkFee || !amount || networkFee > parseFloat(balance[String(mainCoin)])) {
        setSnackSeverity('error');
        setSnackMessage('Insufficient balance or Insufficient gas fee');
        setSnackOpen(true);
        return;
      }
    }

    if (networkFee && networkFee > 0) {
      setPage(2);
    }
  };

  const onClickSignAndPay = async () => {
    try {
      const response: any = await axios.post(Http.send_transaction, {
        chain_id: CHAINS.XRP,
        from_address: fromAddress,
        to_address: destinationAddress,
        network: getNetwork() === 'mainnet' ? 1 : 2,
        wallet_id: getWalletId(),
        user_id: getUserId(),
        value: amount,
        coin: coin,
        fee_rate: networkFee,
      });

      if (response.result) {
        // update payout order
        if (payoutId) {
          const update_payout_resp: any = await axios.put(Http.update_payout_by_id, {
            id: payoutId,
            tx: response.data.hash,
            crypto_amount: amount,
            payout_status: PAYOUT_STATUS.Completed,
          });

          if (!update_payout_resp.result) {
            setSnackSeverity('error');
            setSnackMessage('Can not update the status of payout!');
            setSnackOpen(true);
            return;
          }
        }

        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);

        setBlockExplorerLink(GetBlockchainTxUrl(getNetwork() === 'mainnet', response.data.hash));

        setPage(3);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async (payoutId: any) => {
    await getBalance();
    await getFeeRate();
    await getAddressBook();

    if (payoutId) {
      await getPayoutInfo(payoutId);
    }
  };

  useEffect(() => {
    init(payoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payoutId]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={10}>
      <Stack direction={'row'} alignItems={'center'} justifyContent={'center'}>
        <Image src={GetImgSrcByChain(CHAINS.XRP)} alt="chain" width={50} height={50} />
        <Typography variant="h4" my={4} ml={2}>
          Send coin on{' '}
          {getNetwork() === 'mainnet'
            ? FindChainNamesByChains(CHAINS.XRP) + ' mainnet'
            : FindChainNamesByChains(CHAINS.XRP) + ' testnet'}
        </Typography>
      </Stack>
      <Container>
        {page === 1 && (
          <>
            <Box mt={4}>
              <Stack mt={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>From Address</Typography>
              </Stack>
              <Box mt={1}>
                <FormControl fullWidth variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={fromAddress}
                    disabled
                  />
                </FormControl>
              </Box>
            </Box>

            <Box mt={4}>
              <Stack mt={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>Destination Address</Typography>
              </Stack>
              <Box mt={1}>
                <FormControl fullWidth variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={destinationAddress}
                    onChange={(e: any) => {
                      setDestinationAddress(e.target.value);
                    }}
                    disabled={isDisableDestinationAddress}
                  />
                </FormControl>
              </Box>
            </Box>

            {addressBookrows && addressBookrows.length > 0 && (
              <Box mt={4}>
                <Typography mb={2}>Address books</Typography>
                <Grid container spacing={2}>
                  {addressBookrows.map((item, index) => (
                    <Grid item key={index}>
                      <Chip
                        label={OmitMiddleString(item.address)}
                        variant="outlined"
                        onClick={() => {
                          setDestinationAddress(item.address);
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Box mt={4}>
              <Typography>Coin</Typography>
              <Grid mt={2} container gap={2}>
                {balance &&
                  Object.entries(balance).map(([token, amount], balanceIndex) => (
                    <Grid item key={balanceIndex}>
                      <Chip
                        size={'medium'}
                        label={String(amount) + ' ' + token}
                        icon={<Image src={GetImgSrcByCrypto(token as COINS)} alt="logo" width={20} height={20} />}
                        variant={token === coin ? 'filled' : 'outlined'}
                        onClick={() => {
                          setCoin(token as COINS);
                        }}
                      />
                    </Grid>
                  ))}
              </Grid>
            </Box>

            {coin !== mainCoin && (
              <>
                <Typography mt={4}>Trust Line</Typography>
                {trustLines && trustLines.length > 0 ? (
                  <Box mt={2}>
                    <Box mt={2}>
                      <Stack direction={'row'} gap={2}>
                        <Typography>Issuer:</Typography>
                        <Link
                          href={GetBlockchainAddressUrl(
                            getNetwork() === 'mainnet' ? true : false,
                            String(trustLines.find((item) => item.currency === coin)?.account),
                          )}
                          target={'_blank'}
                        >
                          {trustLines.find((item) => item.currency === coin)?.account}
                        </Link>
                      </Stack>
                      <Stack direction={'row'} gap={2}>
                        <Typography>Token:</Typography>
                        <Typography>{trustLines.find((item) => item.currency === coin)?.currency}</Typography>
                      </Stack>
                      <Stack direction={'row'} gap={2}>
                        <Typography>Limit:</Typography>
                        <Typography>{trustLines.find((item) => item.currency === coin)?.limit}</Typography>
                      </Stack>
                    </Box>
                  </Box>
                ) : (
                  <Box mt={2}>
                    <Typography>No support for any trust line.</Typography>
                  </Box>
                )}
              </>
            )}

            <Box mt={4}>
              <Typography>Amount</Typography>
              <Box mt={1}>
                <FormControl fullWidth variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    type="number"
                    value={amount}
                    onChange={(e: any) => {
                      setAmount(e.target.value);
                      if (parseFloat(e.target.value) > parseFloat(balance[String(coin)])) {
                        setAmountRed(true);
                      } else {
                        setAmountRed(false);
                      }
                    }}
                    disabled={isDisableAmount}
                  />
                </FormControl>
              </Box>
              {balance[String(coin)] && (
                <Typography mt={1} color={amountRed ? 'red' : 'none'} fontWeight={'bold'}>
                  Your available balance is {balance[String(coin)]} {coin}
                </Typography>
              )}
            </Box>

            <Box mt={4}>
              <Typography>Network Fee</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {networkFee} {mainCoin}
              </Typography>
            </Box>

            <Box mt={8}>
              <Button variant={'contained'} onClick={onClickSignTransaction}>
                Sign Transaction
              </Button>
            </Box>
          </>
        )}

        {page === 2 && (
          <>
            <Container maxWidth="sm">
              <Stack mt={10} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Send to</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={OmitMiddleString(destinationAddress)}
                    disabled
                  />
                </FormControl>
              </Stack>

              <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Spend amount</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">{coin}</InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={amount}
                    disabled
                  />
                </FormControl>
              </Stack>

              <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Network fee</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">{mainCoin}</InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={networkFee}
                    disabled
                  />
                </FormControl>
              </Stack>

              <Stack mt={8} direction={'row'} alignItems={'center'} justifyContent={'right'}>
                <Button
                  color={'error'}
                  variant={'contained'}
                  onClick={() => {
                    setPage(1);
                  }}
                >
                  Reject
                </Button>
                <Box ml={2}>
                  <Button variant={'contained'} onClick={onClickSignAndPay} color={'success'}>
                    Sign & Pay
                  </Button>
                </Box>
              </Stack>
            </Container>
          </>
        )}

        {page === 3 && (
          <>
            <Box textAlign={'center'} mt={10}>
              <Icon component={CheckCircleIcon} color={'success'} style={{ fontSize: 80 }} />
              <Typography mt={2} fontWeight={'bold'} fontSize={20}>
                Payment Sent
              </Typography>
              <Typography mt={2}>Your transaction has been successfully sent</Typography>
              <Link href={blockExplorerLink} target="_blank">
                <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={2}>
                  <Icon component={RemoveRedEyeIcon} />
                  <Typography ml={1}>View on Block Explorer</Typography>
                </Stack>
              </Link>
              <Box mt={10}>
                <Button
                  size={'large'}
                  variant={'contained'}
                  style={{ width: 500 }}
                  onClick={() => {
                    window.location.href = '/wallets/xrp';
                  }}
                >
                  Done
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default XrpSend;
