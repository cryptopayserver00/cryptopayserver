import {
  Box,
  Icon,
  Stack,
  Typography,
  Container,
  FormControl,
  OutlinedInput,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { OmitMiddleString } from 'utils/strings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';
import { GetBlockchainTxUrl } from 'utils/chain/btc';
import { useRouter } from 'next/router';
import { COINGECKO_IDS, PAYOUT_STATUS } from 'packages/constants';
import { BigDiv, BigSub } from 'utils/number';
import { GetImgSrcByChain, GetImgSrcByCrypto } from 'utils/qrcode';
import { FindChainNamesByChains } from 'utils/web3';

const fee_byte_length = 140;

type feeType = {
  fastest: number;
  halfHour: number;
  hour: number;
  economy: number;
  minimum: number;
};

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

const BitcoinSend = () => {
  const router = useRouter();
  const { payoutId } = router.query;

  const [mainCoin, setMainCoin] = useState<COINS>();

  const [alignment, setAlignment] = useState<'fastest' | 'halfHour' | 'hour' | 'economy' | 'minimum'>('fastest');
  const [feeObj, setFeeObj] = useState<feeType>();
  const [addressBookrows, setAddressBookrows] = useState<AddressBookRowType[]>([]);

  const [page, setPage] = useState<number>(1);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [balance, setBalance] = useState<Coin>({});
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [feeRate, setFeeRate] = useState<number>(0);

  const [networkFee, setNetworkFee] = useState<number>(0);
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');
  const [coin, setCoin] = useState<COINS>();

  const [addressAlert, setAddressAlert] = useState<boolean>(false);
  const [amountAlert, setAmountAlert] = useState<boolean>(false);
  const [amountRed, setAmountRed] = useState<boolean>(false);

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false);
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false);

  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const handleChangeFees = (e: any) => {
    switch (e.target.value) {
      case 'fastest':
        setFeeRate(Number(feeObj?.fastest));
        break;
      case 'halfHour':
        setFeeRate(Number(feeObj?.halfHour));
        break;
      case 'hour':
        setFeeRate(Number(feeObj?.hour));
        break;
      case 'economy':
        setFeeRate(Number(feeObj?.economy));
        break;
      case 'minimum':
        setFeeRate(Number(feeObj?.minimum));
        break;
    }
    setAlignment(e.target.value);
  };

  const getBalance = async () => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: CHAINS.BITCOIN,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setFromAddress(response.data.address);
        setBalance(response.data.balance);
        setMainCoin(response.data.main_coin.name);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getFeeRate = async () => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: CHAINS.BITCOIN,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setFeeObj({
          fastest: response.data.fastest,
          halfHour: response.data.halfHour,
          hour: response.data.hour,
          economy: response.data.economy,
          minimum: response.data.minimum,
        });
        setFeeRate(response.data.fastest);
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
          chain_id: CHAINS.BITCOIN,
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

  const getPayoutInfo = async (id: number) => {
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
          const totalPrice = parseFloat(BigDiv(Number(response.data.amount).toString(), rate)).toFixed(4);
          setAmount(totalPrice);

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
          chain_id: CHAINS.BITCOIN,
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
    if (
      amount &&
      networkFee &&
      parseFloat(amount) > 0 &&
      parseFloat(balance[String(coin)]) >= parseFloat(amount) + networkFee
    ) {
      return true;
    }

    return false;
  };

  const checkFeeRate = (): boolean => {
    if (feeRate && feeRate > 0) {
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

    if (!checkFeeRate()) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect fee rate');
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
        chain_id: CHAINS.BITCOIN,
        from_address: fromAddress,
        to_address: destinationAddress,
        network: getNetwork() === 'mainnet' ? 1 : 2,
        wallet_id: getWalletId(),
        user_id: getUserId(),
        value: amount,
        coin: coin,
        fee_rate: feeRate,
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

  useEffect(() => {
    if (feeRate && feeRate > 0) {
      setNetworkFee((fee_byte_length * feeRate) / 100000000);
    }
  }, [feeRate]);

  const init = async (payoutId: number) => {
    await getBalance();
    await getFeeRate();
    await getAddressBook();

    if (payoutId) {
      await getPayoutInfo(payoutId);
    }
  };

  useEffect(() => {
    init(Number(payoutId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payoutId]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={10}>
      <Stack direction={'row'} alignItems={'center'} justifyContent={'center'}>
        <Image src={GetImgSrcByChain(CHAINS.BITCOIN)} alt="chain" width={50} height={50} />
        <Typography variant="h4" my={4} ml={2}>
          Send coin on{' '}
          {getNetwork() === 'mainnet'
            ? FindChainNamesByChains(CHAINS.BITCOIN) + ' mainnet'
            : FindChainNamesByChains(CHAINS.BITCOIN) + ' testnet'}
        </Typography>
      </Stack>
      <Container>
        {page === 1 && (
          <>
            <Box mt={4}>
              <Stack mt={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>From address</Typography>
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
              <Typography color={'red'} mt={1} display={addressAlert ? 'block' : 'none'}>
                The Destination Address field is required.
              </Typography>
            </Box>

            <Box mt={4}>
              <Stack mt={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>Destination address</Typography>
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
              <Typography color={'red'} mt={1} display={addressAlert ? 'block' : 'none'}>
                The destination Address field is required.
              </Typography>
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
              <Typography color={'red'} mt={1} display={amountAlert ? 'block' : 'none'}>
                The field amount must be between 0 and 21000000.
              </Typography>
              {balance[String(coin)] && (
                <Typography mt={1} color={amountRed ? 'red' : 'none'} fontWeight={'bold'}>
                  Your available balance is {balance[String(coin)]} {mainCoin}.
                </Typography>
              )}
            </Box>

            <Box mt={4}>
              <Typography>Fee rate (satoshi per byte)</Typography>
              <Box mt={1}>
                <FormControl sx={{ width: '25ch' }} variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    type="number"
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={feeRate}
                    onChange={(e: any) => {
                      setFeeRate(e.target.value);
                    }}
                  />
                </FormControl>
              </Box>
              <Typography mt={1}>Network fee: {networkFee}</Typography>
            </Box>

            <Stack mt={4} direction={'row'} alignItems={'center'}>
              <Typography>Select the fee rate</Typography>
              <Box ml={2}>
                <ToggleButtonGroup
                  color="primary"
                  value={alignment}
                  exclusive
                  onChange={handleChangeFees}
                  aria-label="type"
                >
                  <ToggleButton value="fastest">fastest</ToggleButton>
                  <ToggleButton value="halfHour">halfHour</ToggleButton>
                  <ToggleButton value="hour">hour</ToggleButton>
                  <ToggleButton value="economy">economy</ToggleButton>
                  <ToggleButton value="minimum">minimum</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>

            <Box mt={8}>
              <Button variant={'contained'} onClick={onClickSignTransaction}>
                Sign transaction
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
                <Typography>Network fee rate</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">sat/vB</InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={feeRate}
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

              <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Input:(1)</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={OmitMiddleString(fromAddress)}
                    disabled
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">{mainCoin}</InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={balance[String(coin)]}
                    disabled
                  />
                </FormControl>
              </Stack>

              <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Output:(1)</Typography>
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
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">{mainCoin}</InputAdornment>}
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
                <Typography>Output:(2)</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={OmitMiddleString(fromAddress)}
                    disabled
                  />
                </FormControl>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">{mainCoin}</InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={parseFloat(BigSub(balance[String(coin)], (Number(amount) + networkFee).toString()))}
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
                    window.location.href = '/wallets/bitcoin';
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

export default BitcoinSend;
