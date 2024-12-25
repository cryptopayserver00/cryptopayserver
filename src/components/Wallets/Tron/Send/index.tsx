import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Icon,
  InputAdornment,
  OutlinedInput,
  Radio,
  RadioGroup,
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
import TronSVG from 'assets/chain/tron.svg';
import Image from 'next/image';
import { OmitMiddleString } from 'utils/strings';
import { GetBlockchainTxUrl } from 'utils/chain/tron';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';
import { COINGECKO_IDS, PAYOUT_STATUS } from 'packages/constants';
import { useRouter } from 'next/router';

type Coin = {
  [currency: string]: string;
};

const TronSend = () => {
  const router = useRouter();
  const { payoutId } = router.query;

  const [page, setPage] = useState<number>(1);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [balance, setBalance] = useState<Coin>({});
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [networkFee, setNetworkFee] = useState<string>('');
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');
  const [coin, setCoin] = useState<string>('ETH');
  const [displaySign, setDisplaySign] = useState<boolean>(false);
  const [amountRed, setAmountRed] = useState<boolean>(false);

  const [isDisableDestinationAddress, setIsDisableDestinationAddress] = useState<boolean>(false);
  const [isDisableAmount, setIsDisableAmount] = useState<boolean>(false);

  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const onClickSignTransaction = async () => {};

  const onClickSignAndPay = async () => {};

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" mb={10}>
      <Typography variant="h4" mt={4}>
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

            {/* <Box mt={4}>
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
            </Box> */}

            {/* <Stack mt={4} direction={'row'} alignItems={'center'}>
              <Typography>Confirm in the next</Typography>
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
            </Stack> */}

            {/* <Box mt={4}>
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
            </Box> */}

            {/* <Stack mt={4} direction={'row'} alignItems={'center'}>
              <Typography>Confirm in the next</Typography>
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
            </Stack> */}

            {/* {displaySign && (
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
            )} */}

            <Box mt={8}>
              <Button variant={'contained'} onClick={onClickSignTransaction}>
                {displaySign ? 'Sign Transaction' : 'Calculate Gas Fee'}
              </Button>
            </Box>
          </>
        )}

        {page === 2 && (
          <>
            <Box textAlign={'center'}>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={4}>
                <Image src={TronSVG} alt="" width={25} height={25} />
                <Typography ml={1}>
                  {getNetwork() === 'mainnet' ? 'Ethereum Mainnet' : 'Ethereum Sepolia Testnet'}
                </Typography>
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
                <Stack direction={'row'} alignItems={'baseline'} justifyContent={'center'}>
                  <Typography mt={1}>{networkFee}</Typography>
                  <Typography ml={1}>ETH</Typography>
                  <Typography ml={1}>(network fee)</Typography>
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

              {/* <Box mt={4}>
                <Typography>Max Fee:</Typography>
                <Box mt={1}>
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
                </Box>
              </Box> */}

              {/* <Box mt={4}>
                <Typography>Max Priorty Fee:</Typography>
                <Box mt={1}>
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
                </Box>
              </Box> */}

              {/* <Box mt={4}>
                <Typography>Gas Limit:</Typography>
                <Box mt={1}>
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
                </Box>
              </Box> */}

              <Box mt={4}>
                <Typography>Network Fee:</Typography>
                <Box mt={1}>
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

export default TronSend;
