import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  Icon,
  IconButton,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINNAMES, CHAINS } from 'packages/constants/blockchain';
import Link from 'next/link';
import { GetBlockchainAddressUrlByChainIds } from 'utils/web3';
import { CURRENCY_SYMBOLS, WALLET_ITEM_TYPE } from 'packages/constants';
import {
  AccountCircle,
  Add,
  ArrowDownward,
  ArrowDropDown,
  ArrowDropUp,
  ArrowUpward,
  ContentCopy,
  LocalFlorist,
  OpenInNew,
  Remove,
  SwapHoriz,
} from '@mui/icons-material';
import { OmitMiddleString } from 'utils/strings';
import EthereumSVG from 'assets/chain/ethereum.svg';
import BitcoinSVG from 'assets/chain/bitcoin.svg';

const MyAssets = () => {
  const [address, setAddress] = useState<string>('0xEBf18b3A6E21B2a9845e02151224FB25cF4ac09a');
  const [network, setNetwork] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN);
  const [alignment, setAlignment] = useState<string>(WALLET_ITEM_TYPE.TOKENS);

  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const init = async () => {};

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Typography variant="h6">My Assets</Typography>
        <Stack direction={'row'} alignItems={'center'} mt={2} justifyContent={'space-between'}>
          <Typography variant="h4">{CURRENCY_SYMBOLS['USD']}0.00</Typography>
          <Stack direction={'row'} alignItems={'center'}>
            <Stack direction="row" alignItems="center" justifyContent="center" gap={4}>
              <Button
                variant={'outlined'}
                endIcon={<ContentCopy />}
                onClick={async () => {
                  await navigator.clipboard.writeText(address);

                  setSnackMessage('Successfully copy');
                  setSnackSeverity('success');
                  setSnackOpen(true);
                }}
              >
                {OmitMiddleString(address)}
              </Button>
              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  size={'small'}
                  inputProps={{ 'aria-label': 'Without label' }}
                  onChange={(e) => {
                    setNetwork(e.target.value as CHAINNAMES);
                  }}
                  value={network}
                >
                  {CHAINNAMES &&
                    Object.entries(CHAINNAMES).length > 0 &&
                    Object.entries(CHAINNAMES).map((item, index) => (
                      <MenuItem value={item[1]} key={index}>
                        {item[1]}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Stack direction={'row'} alignItems={'center'} gap={1}>
                <Typography variant="h6">Wallet 2</Typography>
                <Icon component={AccountCircle} fontSize={'large'} />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Box py={2}>
          <Divider />
        </Box>

        <Grid container gap={4} mt={2}>
          <Grid item xs={5} md={5} sm={5}>
            <ToggleButtonGroup
              color="primary"
              value={alignment}
              exclusive
              onChange={(e: any) => {
                setAlignment(e.target.value);
              }}
              aria-label="Platform"
            >
              {WALLET_ITEM_TYPE &&
                Object.entries(WALLET_ITEM_TYPE).map((item, index) => (
                  <ToggleButton value={item[1]} key={index}>
                    {item[1]}
                  </ToggleButton>
                ))}
            </ToggleButtonGroup>

            <Stack mt={2} gap={1}>
              <ListItemButton component="a" href="#" selected>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Icon component={AccountCircle} fontSize={'large'} />
                    <Box ml={1}>
                      <Typography fontWeight={'bold'}>Ethereum</Typography>
                      <Typography>0.00 ETH</Typography>
                    </Box>
                  </Stack>
                  <Box textAlign={'right'}>
                    <Typography variant="h6">{CURRENCY_SYMBOLS['USD']}0.00</Typography>
                    <Stack direction={'row'}>
                      <Icon component={ArrowDropUp} color={'success'} />
                      <Typography>0.96%</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </ListItemButton>
              <ListItemButton component="a" href="#" selected>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Icon component={AccountCircle} fontSize={'large'} />
                    <Box ml={1}>
                      <Typography fontWeight={'bold'}>Ethereum</Typography>
                      <Typography>0.00 ETH</Typography>
                    </Box>
                  </Stack>
                  <Box textAlign={'right'}>
                    <Typography variant="h6">{CURRENCY_SYMBOLS['USD']}0.00</Typography>
                    <Stack direction={'row'}>
                      <Icon component={ArrowDropDown} color={'error'} />
                      <Typography>0.96%</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </ListItemButton>
            </Stack>
          </Grid>
          <Grid item>
            <Divider orientation={'vertical'} />
          </Grid>
          <Grid item xs={6} md={6} sm={6}>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'}>
              <Stack direction={'row'} alignItems={'center'}>
                <Image src={BitcoinSVG} alt="icon" width={80} height={80} />
                <Box ml={3}>
                  <Typography variant="h4" fontWeight={'bold'}>
                    Ethereum
                  </Typography>
                  <Typography mt={1}>Price</Typography>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography variant="h6" fontWeight={'bold'} pr={2}>
                      {CURRENCY_SYMBOLS['USD']}1,1234.12
                    </Typography>
                    <Chip icon={<ArrowDropUp color="success" />} label={'1.10%'} variant="outlined" />
                  </Stack>
                </Box>
              </Stack>
              <Stack direction={'row'} gap={2}>
                <IconButton onClick={async () => {}} edge="end">
                  <AccountCircle />
                </IconButton>
                <IconButton onClick={async () => {}} edge="end">
                  <OpenInNew />
                </IconButton>
              </Stack>
            </Stack>

            <Box mt={2}>
              <Typography>Balance</Typography>
              <Typography variant="h5" fontWeight={'bold'} py={1}>
                {CURRENCY_SYMBOLS['USD']}0.00
              </Typography>
              <Typography>0.00 ETH</Typography>
            </Box>

            <Grid container gap={2} mt={4}>
              <Button style={{ width: 130 }} variant={'contained'} startIcon={<ArrowUpward />} onClick={async () => {}}>
                Send
              </Button>
              <Button
                style={{ width: 130 }}
                variant={'contained'}
                startIcon={<ArrowDownward />}
                onClick={async () => {}}
              >
                Receive
              </Button>
              <Button style={{ width: 130 }} variant={'contained'} startIcon={<SwapHoriz />} onClick={async () => {}}>
                Swap
              </Button>
              <Button
                style={{ width: 130 }}
                variant={'contained'}
                startIcon={<LocalFlorist />}
                onClick={async () => {}}
              >
                Stack
              </Button>
              <Button style={{ width: 130 }} variant={'contained'} startIcon={<Add />} onClick={async () => {}}>
                Buy
              </Button>
              <Button style={{ width: 130 }} variant={'contained'} startIcon={<Remove />} onClick={async () => {}}>
                Sell
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MyAssets;
