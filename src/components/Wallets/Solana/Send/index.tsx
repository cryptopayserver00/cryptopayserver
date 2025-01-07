import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Icon,
  OutlinedInput,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import SolanaSVG from 'assets/chain/solana.svg';
import Image from 'next/image';
import { OmitMiddleString } from 'utils/strings';
import { GetBlockchainTxUrl } from 'utils/chain/solana';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';
import { COINGECKO_IDS, PAYOUT_STATUS } from 'packages/constants';
import { useRouter } from 'next/router';
import { BigDiv } from 'utils/number';

type Coin = {
  [currency: string]: string;
};

const SolanaSend = () => {
  const router = useRouter();
  const { payoutId } = router.query;

  const [page, setPage] = useState<number>(1);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [balance, setBalance] = useState<Coin>({});
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');
  const [coin, setCoin] = useState<string>('SOL');
  const [amountRed, setAmountRed] = useState<boolean>(false);

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false);
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false);

  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const getSolana = async () => {
    try {
      const find_payment_resp: any = await axios.get(Http.find_asset_balance, {
        params: {
          user_id: getUserId(),
          chain_id: CHAINS.SOLANA,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (find_payment_resp.result) {
        setFromAddress(find_payment_resp.data.address);
        setBalance(find_payment_resp.data.balance);
      }
    } catch (e) {
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
      const checkout_resp: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: CHAINS.SOLANA,
          address: destinationAddress,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      return checkout_resp.result;
    } catch (e) {
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

    setPage(2);
  };

  const getPayoutInfo = async (id: any) => {
    try {
      const find_payout_resp: any = await axios.get(Http.find_payout_by_id, {
        params: {
          id: id,
        },
      });

      if (find_payout_resp.result && find_payout_resp.data.length === 1) {
        setDestinationAddress(find_payout_resp.data[0].address);

        const ids = COINGECKO_IDS[find_payout_resp.data[0].crypto as COINS];
        const rate_response: any = await axios.get(Http.find_crypto_price, {
          params: {
            ids: ids,
            currency: find_payout_resp.data[0].currency,
          },
        });

        const rate = rate_response.data[ids][find_payout_resp.data[0].currency.toLowerCase()];
        const totalPrice = parseFloat(BigDiv((find_payout_resp.data[0].amount as number).toString(), rate)).toFixed(4);
        setAmount(totalPrice);
        setCoin(find_payout_resp.data[0].crypto);

        setIsDisableDestinationAddress(true);
        setIsDisableAmount(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onClickSignAndPay = async () => {
    try {
      const send_transaction_resp: any = await axios.post(Http.send_transaction, {
        chain_id: CHAINS.SOLANA,
        from_address: fromAddress,
        to_address: destinationAddress,
        network: getNetwork() === 'mainnet' ? 1 : 2,
        wallet_id: getWalletId(),
        user_id: getUserId(),
        value: amount,
        coin: coin,
      });

      if (send_transaction_resp.result) {
        // update payout order
        if (payoutId) {
          const update_payout_resp: any = await axios.put(Http.update_payout_by_id, {
            user_id: getUserId(),
            store_id: getStoreId(),
            id: payoutId,
            tx: send_transaction_resp.data.hash,
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

        setBlockExplorerLink(GetBlockchainTxUrl(getNetwork() === 'mainnet', send_transaction_resp.data.hash));

        setPage(3);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const init = async (payoutId: any) => {
    await getSolana();

    if (payoutId) {
      await getPayoutInfo(payoutId);
    }
  };

  useEffect(() => {
    init(payoutId);
  }, [payoutId]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={10}>
      <Typography variant="h4" mt={4}>
        Send Coin on Solana
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

            <Box mt={4}>
              <Typography>Coin</Typography>
              <Box mt={1}>
                <FormControl>
                  <RadioGroup
                    value={coin}
                    onChange={(e: any) => {
                      setCoin(e.target.value);
                    }}
                  >
                    {balance &&
                      Object.entries(balance).map((item, index) => (
                        <FormControlLabel
                          value={item[0]}
                          control={<Radio />}
                          label={`${item[0].toUpperCase()} => Balance: ${item[1]}`}
                          key={index}
                          labelPlacement={'end'}
                        />
                      ))}
                  </RadioGroup>
                </FormControl>
              </Box>
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

            <Box mt={8}>
              <Button variant={'contained'} onClick={onClickSignTransaction}>
                {'Sign Transaction'}
              </Button>
            </Box>
          </>
        )}

        {page === 2 && (
          <>
            <Box textAlign={'center'}>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={4}>
                <Image src={SolanaSVG} alt="" width={25} height={25} />
                <Typography ml={1}>{getNetwork() === 'mainnet' ? 'Solana Mainnet' : 'Solana Devnet'}</Typography>
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
                  <Typography ml={1}>{coin}</Typography>
                </Stack>
              </Box>

              <Box mt={4}>
                <Typography>Coin:</Typography>
                <Box mt={1}>
                  <FormControl variant="outlined">
                    <OutlinedInput
                      size={'small'}
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                      value={coin}
                      disabled
                    />
                  </FormControl>
                </Box>
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
                    window.location.href = '/wallets/solana';
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

export default SolanaSend;
