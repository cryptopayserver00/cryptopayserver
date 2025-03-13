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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { BigDiv, BigMul, GweiToEther, WeiToGwei } from 'utils/number';
import Image from 'next/image';
import { OmitMiddleString } from 'utils/strings';
import { GetBlockchainTxUrl } from 'utils/chain/eth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';
import { COINGECKO_IDS, PAYOUT_STATUS } from 'packages/constants';
import { useRouter } from 'next/router';
import { GetImgSrcByChain, GetImgSrcByCrypto } from 'utils/qrcode';

type feeType = {
  high: number;
  average: number;
  low: number;
};

type maxPriortyFeeType = {
  fast: number;
  normal: number;
  slow: number;
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

const EthereumSend = () => {
  const router = useRouter();
  const { payoutId } = router.query;

  const [chain, setChain] = useState<CHAINS>(CHAINS.ETHEREUM);

  const [alignment, setAlignment] = useState<'high' | 'average' | 'low'>('average');
  const [maxPriortyFeeAlignment, setMaxPriortyFeeAlignment] = useState<'fast' | 'normal' | 'slow'>('normal');
  const [feeObj, setFeeObj] = useState<feeType>();
  const [maxPriortyFeeObj, setMaxPriortyFeeObj] = useState<maxPriortyFeeType>();
  const [addressBookrows, setAddressBookrows] = useState<AddressBookRowType[]>([]);

  const [page, setPage] = useState<number>(1);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [balance, setBalance] = useState<Coin>({});
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [maxFee, setMaxFee] = useState<number>(0);
  const [maxPriortyFee, setMaxPriortyFee] = useState<number>(0);
  const [gasLimit, setGasLimit] = useState<number>(0);

  const [networkFee, setNetworkFee] = useState<string>('');
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');
  const [nonce, setNonce] = useState<number>(0);
  const [coin, setCoin] = useState<string>('ETH');
  const [displaySign, setDisplaySign] = useState<boolean>(false);
  const [amountRed, setAmountRed] = useState<boolean>(false);

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false);
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false);

  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const handleChangeFees = (e: any) => {
    switch (e.target.value) {
      case 'high':
        setMaxFee(WeiToGwei(feeObj?.high as number));
        break;
      case 'average':
        setMaxFee(WeiToGwei(feeObj?.average as number));
        break;
      case 'low':
        setMaxFee(WeiToGwei(feeObj?.low as number));
        break;
    }
    setAlignment(e.target.value);
  };

  const handleChangeMaxPriortyFee = (e: any) => {
    switch (e.target.value) {
      case 'fast':
        setMaxPriortyFee(WeiToGwei(maxPriortyFeeObj?.fast as number));
        break;
      case 'normal':
        setMaxPriortyFee(WeiToGwei(maxPriortyFeeObj?.normal as number));
        break;
      case 'slow':
        setMaxPriortyFee(WeiToGwei(maxPriortyFeeObj?.slow as number));
        break;
    }
    setMaxPriortyFeeAlignment(e.target.value);
  };

  const getBalance = async () => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: chain,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setFromAddress(response.data.address);
        setBalance(response.data.balance);

        await getNonce(response.data.address);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getGasLimit = async (from: string): Promise<boolean> => {
    try {
      const response: any = await axios.get(Http.find_gas_limit, {
        params: {
          chain_id: chain,
          network: getNetwork() === 'mainnet' ? 1 : 2,
          coin: coin,
          from: from,
          to: destinationAddress,
          value: amount,
        },
      });
      if (response.result) {
        setGasLimit(response.data);
        return true;
      }
      return false;
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
          chain_id: chain,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setFeeObj({
          high: response.data.fast,
          average: response.data.normal,
          low: response.data.slow,
        });
        setMaxFee(WeiToGwei(response.data.normal));
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getMaxPriortyFee = async () => {
    try {
      const response: any = await axios.get(Http.find_max_priorty_fee, {
        params: {
          chain_id: chain,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setMaxPriortyFeeObj({
          fast: response.data.fast,
          normal: response.data.normal,
          slow: response.data.slow,
        });
        setMaxPriortyFee(WeiToGwei(response.data.normal));
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
          chain_id: chain,
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

  const getNonce = async (address: string) => {
    if (address && address != '') {
      try {
        const response: any = await axios.get(Http.find_nonce, {
          params: {
            chain_id: chain,
            network: getNetwork() === 'mainnet' ? 1 : 2,
            address: address,
          },
        });
        if (response.result) {
          setNonce(response.data);
        }
      } catch (e) {
        setSnackSeverity('error');
        setSnackMessage('The network error occurred. Please try again later.');
        setSnackOpen(true);
        console.error(e);
      }
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

        const rate = rate_response.data[ids][response.data.currency.toLowerCase()];
        const totalPrice = parseFloat(BigDiv((response.data.amount as number).toString(), rate)).toFixed(4);
        setAmount(totalPrice);
        setCoin(response.data.crypto);

        setIsDisableDestinationAddress(true);
        setIsDisableAmount(true);
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
          chain_id: chain,
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
    if (amount && parseFloat(amount) != 0 && parseFloat(balance[coin]) >= parseFloat(amount)) {
      return true;
    }

    return false;
  };

  const checkNonce = (): boolean => {
    if (nonce >= 0) {
      return true;
    }

    return false;
  };

  const checkMaxFee = (): boolean => {
    if (maxFee && maxFee >= 0) {
      return true;
    }

    return false;
  };

  const checkMaxPriortyFee = (): boolean => {
    if (maxPriortyFee && maxPriortyFee >= 0) {
      return true;
    }

    return false;
  };

  const checkGasLimit = async (): Promise<boolean> => {
    if (gasLimit && gasLimit > 0) {
      return true;
    }

    return await getGasLimit(fromAddress);
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

    if (!checkNonce()) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect nonce amount');
      setSnackOpen(true);
      return;
    }

    if (!checkMaxFee()) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect max fee');
      setSnackOpen(true);
      return;
    }

    if (!checkMaxPriortyFee()) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect max priorty fee');
      setSnackOpen(true);
      return;
    }

    if (!(await checkGasLimit())) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect gas limit');
      setSnackOpen(true);
      return;
    } else {
      setDisplaySign(true);
    }

    if (displaySign) {
      if (coin === 'ETH') {
        if (!networkFee || !amount || parseFloat(networkFee) * 2 + parseFloat(amount) > parseFloat(balance['ETH'])) {
          setSnackSeverity('error');
          setSnackMessage('Insufficient balance or Insufficient gas fee');
          setSnackOpen(true);
          return;
        }
      } else {
        if (!networkFee || !amount || parseFloat(networkFee) * 2 > parseFloat(balance['ETH'])) {
          setSnackSeverity('error');
          setSnackMessage('Insufficient balance or Insufficient gas fee');
          setSnackOpen(true);
          return;
        }
      }

      if (networkFee && networkFee != '') {
        setPage(2);
      }
    }
  };

  const onClickSignAndPay = async () => {
    try {
      const response: any = await axios.post(Http.send_transaction, {
        chain_id: chain,
        from_address: fromAddress,
        to_address: destinationAddress,
        network: getNetwork() === 'mainnet' ? 1 : 2,
        wallet_id: getWalletId(),
        user_id: getUserId(),
        value: amount,
        coin: coin,
        nonce: nonce,
        max_fee: maxFee,
        max_priorty_fee: maxPriortyFee,
        gas_limit: gasLimit,
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
    if (maxFee && maxFee > 0 && gasLimit && gasLimit > 0) {
      setNetworkFee(parseFloat(BigMul(GweiToEther(maxFee).toString(), gasLimit.toString())).toFixed(8));
    }
  }, [maxFee, gasLimit]);

  const init = async (payoutId: any) => {
    await getBalance();
    await getFeeRate();
    await getMaxPriortyFee();
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
      <Typography variant="h4" my={4}>
        Send Coin on Ethereum
      </Typography>
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
                <Typography mb={2}>Address Books</Typography>
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
                          setCoin(token);
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
                      if (parseFloat(e.target.value) > parseFloat(balance[coin])) {
                        setAmountRed(true);
                      } else {
                        setAmountRed(false);
                      }
                    }}
                    disabled={isDisableAmount}
                  />
                </FormControl>
              </Box>
              <Typography mt={1} color={amountRed ? 'red' : 'none'} fontWeight={'bold'}>
                Your available balance is {balance[coin]} {coin}
              </Typography>
            </Box>

            <Box mt={4}>
              <Typography>Nonce</Typography>
              <Box mt={1}>
                <FormControl fullWidth variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    type="number"
                    value={nonce}
                    onChange={(e: any) => {
                      setNonce(e.target.value);
                    }}
                  />
                </FormControl>
              </Box>
            </Box>

            <Box mt={4}>
              <Typography>MaxFee (Gwei)</Typography>
              <Box mt={1}>
                <FormControl sx={{ width: '25ch' }} variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    type="number"
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={maxFee}
                    onChange={(e: any) => {
                      setMaxFee(e.target.value);
                    }}
                  />
                </FormControl>
              </Box>
            </Box>

            <Stack mt={4} direction={'row'} alignItems={'center'}>
              <Typography>Select the maxFee</Typography>
              <Box ml={2}>
                <ToggleButtonGroup
                  color="primary"
                  value={alignment}
                  exclusive
                  onChange={handleChangeFees}
                  aria-label="type"
                >
                  <ToggleButton value="high">High</ToggleButton>
                  <ToggleButton value="average">Average</ToggleButton>
                  <ToggleButton value="low">Low</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>

            <Box mt={4}>
              <Typography>MaxPriortyFee (Gwei)</Typography>
              <Box mt={1}>
                <FormControl sx={{ width: '25ch' }} variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    type="number"
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={maxPriortyFee}
                    onChange={(e: any) => {
                      setMaxPriortyFee(e.target.value);
                    }}
                  />
                </FormControl>
              </Box>
            </Box>

            <Stack mt={4} direction={'row'} alignItems={'center'}>
              <Typography>Select the maxPriortyFee</Typography>
              <Box ml={2}>
                <ToggleButtonGroup
                  color="primary"
                  value={maxPriortyFeeAlignment}
                  exclusive
                  onChange={handleChangeMaxPriortyFee}
                  aria-label="type"
                >
                  <ToggleButton value="fast">Fast</ToggleButton>
                  <ToggleButton value="normal">Normal</ToggleButton>
                  <ToggleButton value="slow">Slow</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>

            {displaySign && (
              <>
                <Box mt={4}>
                  <Typography>Gas</Typography>
                  <Box mt={1}>
                    <FormControl sx={{ width: '25ch' }} variant="outlined">
                      <OutlinedInput
                        size={'small'}
                        type="number"
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          'aria-label': 'weight',
                        }}
                        value={gasLimit}
                        onChange={(e: any) => {
                          setGasLimit(e.target.value);
                        }}
                      />
                    </FormControl>
                  </Box>
                </Box>
                <Box mt={4}>
                  <Typography>
                    Miner Fee: {networkFee} ETH = MaxFee({maxFee}) * Gas({gasLimit})
                  </Typography>
                </Box>
              </>
            )}

            <Box mt={4}>
              <Button variant={'contained'} onClick={onClickSignTransaction}>
                {displaySign ? 'Sign Transaction' : 'Calculate Gas Fee'}
              </Button>
            </Box>
          </>
        )}

        {page === 2 && (
          <>
            <Container maxWidth="sm">
              <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={4}>
                <Image src={GetImgSrcByChain(chain)} alt="chain" width={50} height={50} />
                <Typography ml={1} variant={'h6'}>
                  {getNetwork() === 'mainnet' ? 'Ethereum Mainnet' : 'Ethereum Sepolia Testnet'}
                </Typography>
              </Stack>

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
                <Typography>Spend Amount</Typography>
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
                <Typography>Gas Limit</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={gasLimit}
                    disabled
                  />
                </FormControl>
              </Stack>

              <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Max Fee</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">Gwei</InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={maxFee}
                    disabled
                  />
                </FormControl>
              </Stack>

              <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Max Priorty Fee</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">Gwei</InputAdornment>}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={maxPriortyFee}
                    disabled
                  />
                </FormControl>
              </Stack>

              <Stack mt={4} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography>Network Fee</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    endAdornment={<InputAdornment position="end">ETH</InputAdornment>}
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
                <Typography>Nonce:</Typography>
                <FormControl variant="outlined">
                  <OutlinedInput
                    size={'small'}
                    aria-describedby="outlined-weight-helper-text"
                    inputProps={{
                      'aria-label': 'weight',
                    }}
                    value={nonce}
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
                    window.location.href = '/wallets/ethereum';
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

export default EthereumSend;
