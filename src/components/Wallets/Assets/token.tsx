import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  Icon,
  IconButton,
  ListItemButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINNAMES, CHAINS, COIN, COINS } from 'packages/constants/blockchain';
import Link from 'next/link';
import { GetBlockchainAddressUrlByChainIds } from 'utils/web3';
import { COINGECKO_IDS, COINPAIR, CURRENCY, CURRENCY_SYMBOLS, WALLET_ITEM_TYPE } from 'packages/constants';
import {
  AccountCircle,
  Add,
  ArrowDownward,
  ArrowDropDown,
  ArrowDropUp,
  ArrowUpward,
  Check,
  ContentCopy,
  LocalFlorist,
  OpenInNew,
  Remove,
  SwapHoriz,
} from '@mui/icons-material';
import { FormatNumberToEnglish, OmitMiddleString } from 'utils/strings';
import BitcoinSVG from 'assets/chain/bitcoin.svg';
import TradingViewWidget from 'components/Widget/TradingViewWidget';

const AssetsToken = () => {
  const [address, setAddress] = useState<string>('0xEBf18b3A6E21B2a9845e02151224FB25cF4ac09a');

  const [crypto, setCrypto] = useState<COINS>(COINS.ETH);
  const [currency, setCurrency] = useState<string>(CURRENCY[0]);
  const [coinPair, setCoinPair] = useState<(typeof COINPAIR)[keyof typeof COINPAIR]>(COINPAIR.ETHUSDT);

  const [price, setPrice] = useState<number>(0);
  const [dayChange, setDayChange] = useState<number>(0);
  const [dayVol, setDayVol] = useState<number>(0);
  const [marketCap, setMarketCap] = useState<number>(0);

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const init = async () => {
    try {
      if (!crypto) {
        return;
      }

      const ids = COINGECKO_IDS[crypto];
      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids,
          currency: currency,
        },
      });

      if (response.result) {
        setPrice(Number(response.data[ids][currency.toLowerCase()]));
        setDayChange(Number(response.data[ids][`${currency.toLowerCase()}_24h_change`]));
        setDayVol(Number(response.data[ids][`${currency.toLowerCase()}_24h_vol`]));
        setMarketCap(Number(response.data[ids][`${currency.toLowerCase()}_market_cap`]));
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Box>
      <Container>
        <Stack direction={'row'} alignItems={'center'}>
          <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
          <Typography pl={1}>Ethereum network</Typography>
        </Stack>

        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={4}>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Button variant={'contained'} startIcon={<ArrowUpward />} onClick={async () => {}}>
              Send
            </Button>
            <Button variant={'contained'} startIcon={<ArrowDownward />} onClick={async () => {}}>
              Receive
            </Button>
            <Button variant={'contained'} startIcon={<SwapHoriz />} onClick={async () => {}}>
              Swap
            </Button>
            <Button variant={'contained'} startIcon={<LocalFlorist />} onClick={async () => {}}>
              Stack
            </Button>
          </Stack>

          <Button variant={'outlined'} endIcon={<OpenInNew />} onClick={async () => {}}>
            View on block explorer
          </Button>
        </Stack>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Typography variant="h4" pb={2} fontWeight={'bold'}>
                {CURRENCY_SYMBOLS[currency]}
                {price}
              </Typography>
              <Box height={'400px'}>
                <TradingViewWidget coinPair={coinPair} />
              </Box>

              <Grid container spacing={2} pt={4}>
                <Grid item xs={3} md={3} sm={3}>
                  <Box>
                    <Typography>Day change (24hr)</Typography>
                    <Typography fontWeight={'bold'} mt={1} color={dayChange >= 0 ? 'green' : 'red'}>
                      {parseFloat(String(dayChange)).toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3} md={3} sm={3}>
                  <Box>
                    <Typography>Market cap</Typography>
                    <Typography fontWeight={'bold'} mt={1}>
                      {FormatNumberToEnglish(marketCap)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3} md={3} sm={3}>
                  <Box>
                    <Typography>Total volume (24hr)</Typography>
                    <Typography fontWeight={'bold'} mt={1}>
                      {FormatNumberToEnglish(dayVol)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pb={2}>
                <Typography variant="h6" fontWeight={'bold'}>
                  Holdings
                </Typography>
                <Typography fontWeight={'bold'}>$0.24</Typography>
              </Stack>

              <Stack gap={1}>
                <ListItemButton component="a" href="#" selected>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AccountCircle} fontSize={'large'} />
                      <Typography px={1}>{OmitMiddleString(address)}</Typography>
                      <IconButton onClick={async () => {}} edge="end">
                        <ContentCopy fontSize={'small'} />
                      </IconButton>
                    </Stack>
                    <Box>
                      <Typography fontWeight={'bold'}>$34.65</Typography>
                      <Typography>0.0192 ETH</Typography>
                    </Box>
                  </Stack>
                </ListItemButton>
                <ListItemButton component="a" href="#" selected>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AccountCircle} fontSize={'large'} />
                      <Typography px={1}>{OmitMiddleString(address)}</Typography>
                      <IconButton onClick={async () => {}} edge="end">
                        <ContentCopy fontSize={'small'} />
                      </IconButton>
                    </Stack>
                    <Box>
                      <Typography fontWeight={'bold'}>$34.65</Typography>
                      <Typography>0.0192 ETH</Typography>
                    </Box>
                  </Stack>
                </ListItemButton>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default AssetsToken;
