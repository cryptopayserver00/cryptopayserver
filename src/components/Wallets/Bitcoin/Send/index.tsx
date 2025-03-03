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
} from '@mui/material';
import { useEffect, useState } from 'react';
import BitcoinSVG from 'assets/chain/bitcoin.svg';
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
import { BigDiv } from 'utils/number';

const fee_byte_length = 140;

type feeType = {
  fastest: number;
  halfHour: number;
  hour: number;
  economy: number;
  minimum: number;
};

const BitcoinSend = () => {
  const router = useRouter();
  const { payoutId } = router.query;

  const [alignment, setAlignment] = useState<'fastest' | 'halfHour' | 'hour' | 'economy' | 'minimum'>('fastest');
  const [feeObj, setFeeObj] = useState<feeType>();
  const [addressAlert, setAddressAlert] = useState<boolean>(false);
  const [amountAlert, setAmountAlert] = useState<boolean>(false);
  const [amountRed, setAmountRed] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [feeRate, setFeeRate] = useState<number>(0);
  const [networkFee, setNetworkFee] = useState<number>(0);
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false);
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false);

  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  useEffect(() => {
    if (feeRate) {
      setNetworkFee((fee_byte_length * feeRate) / 100000000);
    }
  }, [feeRate]);

  const handleChangeFees = (e: any) => {
    switch (e.target.value) {
      case 'fastest':
        setFeeRate(feeObj?.fastest as number);
        break;
      case 'halfHour':
        setFeeRate(feeObj?.halfHour as number);
        break;
      case 'hour':
        setFeeRate(feeObj?.hour as number);
        break;
      case 'economy':
        setFeeRate(feeObj?.economy as number);
        break;
      case 'minimum':
        setFeeRate(feeObj?.minimum as number);
        break;
    }
    setAlignment(e.target.value);
  };

  const getBitcoin = async () => {
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
        setBalance(response.data.balance.BTC);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getBitcoinFeeRate = async () => {
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
    if (amount && networkFee && parseFloat(amount) != 0 && parseFloat(balance) >= parseFloat(amount) + networkFee) {
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

    setPage(2);
  };

  const init = async (payoutId: any) => {
    await getBitcoin();
    await getBitcoinFeeRate();

    if (payoutId) {
      await getPayoutInfo(payoutId);
    }
  };

  useEffect(() => {
    init(payoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payoutId]);

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
        fee_rate: feeRate,
        coin: COINS.BTC,
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

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={10}>
      <Typography variant="h4" mt={4}>
        Send BTC
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
              <Typography color={'red'} mt={1} display={addressAlert ? 'block' : 'none'}>
                The Destination Address field is required.
              </Typography>
            </Box>

            <Box mt={4}>
              <Stack mt={2} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography>Destination Address</Typography>
                {/* <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={Add} fontSize={'small'} />
                  <Typography pl={1}>Add another destination</Typography>
                </Stack> */}
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
                The Destination Address field is required.
              </Typography>
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
                      if (parseFloat(e.target.value) > parseFloat(balance)) {
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
                The field Amount must be between 1E-08 and 21000000.
              </Typography>
              <Typography mt={1} color={amountRed ? 'red' : 'none'} fontWeight={'bold'}>
                Your available balance is {balance} BTC.
              </Typography>
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
              <Typography mt={1}>Network Fee: {networkFee}</Typography>
            </Box>

            <Stack mt={4} direction={'row'} alignItems={'center'}>
              <Typography>Confirm in the next</Typography>
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
            <Box textAlign={'center'}>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={4}>
                <Image src={BitcoinSVG} alt="" width={25} height={25} />
                <Typography ml={1}>{getNetwork() === 'mainnet' ? 'Bitcoin Mainnet' : 'Bitcoin Testnet'}</Typography>
              </Stack>

              <Box mt={4}>
                <Typography>Send to</Typography>
                <Typography mt={1}>{OmitMiddleString(destinationAddress)}</Typography>
              </Box>

              <Box mt={4}>
                <Typography>Spend Amount</Typography>
                <Stack direction={'row'} alignItems={'baseline'} justifyContent={'center'}>
                  <Typography mt={1} variant={'h4'}>
                    {amount}
                  </Typography>
                  <Typography ml={1}>BTC</Typography>
                </Stack>
                <Stack direction={'row'} alignItems={'baseline'} justifyContent={'center'}>
                  <Typography mt={1}>{networkFee}</Typography>
                  <Typography ml={1}>BTC</Typography>
                  <Typography ml={1}>(network fee)</Typography>
                </Stack>
              </Box>

              <Box mt={4}>
                <Typography>Network Fee:</Typography>
                <Box mt={1}>
                  <FormControl variant="outlined">
                    <OutlinedInput
                      size={'small'}
                      endAdornment={<InputAdornment position="end">BTC</InputAdornment>}
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                      value={networkFee}
                      disabled
                    />
                  </FormControl>
                </Box>
              </Box>

              <Box mt={4}>
                <Typography>Network Fee Rate:</Typography>
                <Box mt={1}>
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
                </Box>
              </Box>

              <Box mt={4}>
                <Typography>Input:(1)</Typography>
                <Stack mt={1} direction={'row'} alignItems={'center'} justifyContent={'center'}>
                  <Typography>{OmitMiddleString(fromAddress)}</Typography>
                  <Typography ml={10}>{balance}</Typography>
                  <Typography ml={1}>BTC</Typography>
                </Stack>
              </Box>

              <Box mt={4}>
                <Typography>Output:(2)</Typography>
                <Stack mt={1} direction={'row'} alignItems={'center'} justifyContent={'center'}>
                  <Typography>{OmitMiddleString(destinationAddress)}</Typography>
                  <Typography ml={10}>{parseFloat(amount as string).toFixed(8)}</Typography>
                  <Typography ml={1}>BTC</Typography>
                </Stack>
                <Stack mt={1} direction={'row'} alignItems={'center'} justifyContent={'center'}>
                  <Typography>{OmitMiddleString(fromAddress)}</Typography>
                  <Typography ml={10}>
                    {(parseFloat(balance) - parseFloat(amount as string) - (networkFee as number)).toFixed(8)}
                  </Typography>
                  <Typography ml={1}>BTC</Typography>
                </Stack>
              </Box>

              <Stack mt={8} direction={'row'} alignItems={'center'} justifyContent={'center'}>
                <Button
                  variant={'contained'}
                  onClick={() => {
                    setPage(1);
                  }}
                >
                  Reject
                </Button>
                <Box ml={2}>
                  <Button variant={'contained'} onClick={onClickSignAndPay}>
                    Sign & Pay
                  </Button>
                </Box>
              </Stack>
            </Box>
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
