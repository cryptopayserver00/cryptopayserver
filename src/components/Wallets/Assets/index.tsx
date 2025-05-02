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
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINNAMES, CHAINS } from 'packages/constants/blockchain';
import Link from 'next/link';
import { FindChainIdsByChainNames, GetBlockchainAddressUrlByChainIds, GetChainIds } from 'utils/web3';
import { CURRENCY_SYMBOLS, WALLET_ITEM_TYPE } from 'packages/constants';
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
import { OmitMiddleString } from 'utils/strings';
import BitcoinSVG from 'assets/chain/bitcoin.svg';
import { GetImgSrcByChain } from 'utils/qrcode';

const MyAssets = () => {
  const [address, setAddress] = useState<string>('0xEBf18b3A6E21B2a9845e02151224FB25cF4ac09a');
  const [network, setNetwork] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN);
  const [alignment, setAlignment] = useState<string>(WALLET_ITEM_TYPE.TOKENS);

  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const getAssetWallet = async () => {
    
  };

  const init = async () => {
    await getAssetWallet();
  };

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
                        <Stack direction={'row'} alignItems={'center'}>
                          <Image
                            src={GetImgSrcByChain(FindChainIdsByChainNames(item[1]))}
                            alt="icon"
                            width={30}
                            height={30}
                          />
                          <Typography pl={1}>{item[1]}</Typography>
                        </Stack>
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
              size="small"
              fullWidth
            >
              {WALLET_ITEM_TYPE &&
                Object.entries(WALLET_ITEM_TYPE).map((item, index) => (
                  <ToggleButton value={item[1]} key={index}>
                    {item[1]}
                  </ToggleButton>
                ))}
            </ToggleButtonGroup>

            {WALLET_ITEM_TYPE.TOKENS === alignment && (
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
            )}

            {WALLET_ITEM_TYPE.NFTS === alignment && (
              <Grid container mt={2} spacing={2}>
                <Grid item xs={6} md={6} sm={6}>
                  <Card>
                    <CardActionArea>
                      <CardMedia component="img" height="200" image="/chain/base.svg" alt="green iguana" />
                      <CardContent>
                        <Typography py={1}>The shooting</Typography>
                        <Typography variant="h6" fontWeight={'bold'}>
                          The shooting/Rabbit
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={6} md={6} sm={6}>
                  <Card>
                    <CardActionArea>
                      <CardMedia component="img" height="200" image="/chain/base.svg" alt="green iguana" />
                      <CardContent>
                        <Typography py={1}>The shooting</Typography>
                        <Typography variant="h6" fontWeight={'bold'}>
                          The shooting/Rabbit
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={6} md={6} sm={6}>
                  <Card>
                    <CardActionArea>
                      <CardMedia component="img" height="200" image="/chain/base.svg" alt="green iguana" />
                      <CardContent>
                        <Typography py={1}>The shooting</Typography>
                        <Typography variant="h6" fontWeight={'bold'}>
                          The shooting/Rabbit
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
                <Grid item xs={6} md={6} sm={6}>
                  <Card>
                    <CardActionArea>
                      <CardMedia component="img" height="200" image="/chain/base.svg" alt="green iguana" />
                      <CardContent>
                        <Typography py={1}>The shooting</Typography>
                        <Typography variant="h6" fontWeight={'bold'}>
                          The shooting/Rabbit
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              </Grid>
            )}

            {WALLET_ITEM_TYPE.DEFI === alignment && (
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
                    </Box>
                  </Stack>
                </ListItemButton>
              </Stack>
            )}

            {WALLET_ITEM_TYPE.TRANSACTIONS === alignment && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={12} sm={12}>
                  <Typography py={2}>April 23, 2025</Typography>
                  <Box py={1}>
                    <Card>
                      <CardContent>
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                          <Stack direction={'row'} alignItems={'center'}>
                            <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
                            <Box px={2}>
                              <Typography>Native Transfer</Typography>
                              <Typography>{OmitMiddleString(address)}</Typography>
                            </Box>
                          </Stack>

                          <Stack direction={'row'} alignItems={'center'}>
                            <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
                            <Box pl={2}>
                              <Typography>-0.001</Typography>
                              <Typography>ETH</Typography>
                            </Box>
                          </Stack>
                        </Stack>

                        <Box py={2} textAlign={'center'}>
                          <ArrowDownward />
                        </Box>

                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                          <Stack direction={'row'} alignItems={'center'}>
                            <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
                            <Box px={2}>
                              <Typography>To</Typography>
                              <Typography>{OmitMiddleString(address)}</Typography>
                            </Box>
                          </Stack>

                          <Typography fontWeight={'bold'}>0.001 ETH</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box py={1}>
                    <Card>
                      <CardContent>
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                          <Stack direction={'row'} alignItems={'center'}>
                            <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
                            <Box px={2}>
                              <Typography>Native Transfer</Typography>
                              <Typography>{OmitMiddleString(address)}</Typography>
                            </Box>
                          </Stack>

                          <Stack direction={'row'} alignItems={'center'}>
                            <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
                            <Box pl={2}>
                              <Typography>-0.001</Typography>
                              <Typography>ETH</Typography>
                            </Box>
                          </Stack>
                        </Stack>

                        <Box py={2} textAlign={'center'}>
                          <ArrowDownward />
                        </Box>

                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                          <Stack direction={'row'} alignItems={'center'}>
                            <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
                            <Box px={2}>
                              <Typography>To</Typography>
                              <Typography>{OmitMiddleString(address)}</Typography>
                            </Box>
                          </Stack>

                          <Typography fontWeight={'bold'}>0.001 ETH</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            )}

            {WALLET_ITEM_TYPE.SPENDINGCAPS === alignment && (
              <Box mt={2}>
                <Typography variant="h6">Spending Caps</Typography>
                <Typography>
                  A spending cap is a set permission, granted to a specific smart contract, allowing it to spend or
                  utilize a defined amount of tokens from the owner&apos;s wallet. You can revoke these permissions at any
                  time.
                </Typography>
              </Box>
            )}
          </Grid>
          <Grid item>
            <Divider orientation={'vertical'} />
          </Grid>
          <Grid item xs={6} md={6} sm={6}>
            {WALLET_ITEM_TYPE.TOKENS === alignment && (
              <Box>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'flex-start'}>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Image src={BitcoinSVG} alt="icon" width={80} height={80} />
                    <Box ml={3}>
                      <Typography variant="h4" fontWeight={'bold'}>
                        Ethereum
                      </Typography>
                      <Typography py={1}>Price</Typography>
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

                <Grid container spacing={2} mt={4}>
                  <Grid item xs={3} md={3} sm={3}>
                    <Button fullWidth variant={'contained'} startIcon={<ArrowUpward />} onClick={async () => {}}>
                      Send
                    </Button>
                  </Grid>
                  <Grid item xs={3} md={3} sm={3}>
                    <Button fullWidth variant={'contained'} startIcon={<ArrowDownward />} onClick={async () => {}}>
                      Receive
                    </Button>
                  </Grid>
                  <Grid item xs={3} md={3} sm={3}>
                    <Button fullWidth variant={'contained'} startIcon={<SwapHoriz />} onClick={async () => {}}>
                      Swap
                    </Button>
                  </Grid>
                  <Grid item xs={3} md={3} sm={3}>
                    <Button fullWidth variant={'contained'} startIcon={<LocalFlorist />} onClick={async () => {}}>
                      Stack
                    </Button>
                  </Grid>
                  <Grid item xs={3} md={3} sm={3}>
                    <Button fullWidth variant={'contained'} startIcon={<Add />} onClick={async () => {}}>
                      Buy
                    </Button>
                  </Grid>
                  <Grid item xs={3} md={3} sm={3}>
                    <Button fullWidth variant={'contained'} startIcon={<Remove />} onClick={async () => {}}>
                      Sell
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {WALLET_ITEM_TYPE.NFTS === alignment && (
              <Stack direction={'row'} alignItems={'flex-start'}>
                <Image alt="img" src={'/chain/base.svg'} width={250} height={250} />

                <Box ml={2}>
                  <Typography>Monster Suit</Typography>
                  <Typography variant="h6">Monster Suit #4951</Typography>
                  <Stack direction={'row'} alignItems={'center'} mt={4}>
                    <Box>
                      <Typography>Owner(You)</Typography>
                      <Typography mt={1}>{OmitMiddleString(address)}</Typography>
                    </Box>
                    <Box ml={4}>
                      <Typography>Bought for</Typography>
                      <Typography mt={1}>-</Typography>
                    </Box>
                  </Stack>
                  <Box mt={4}>
                    <Typography>Floor price</Typography>
                    <Typography mt={1}>-</Typography>
                  </Box>

                  <Box mt={4}>
                    <Typography variant="h5">About</Typography>
                    <Typography mt={2}>
                      Rue NFTs is a community driven and collaborative project from Crystal Roots LLC and USGMEN.
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography>Properties</Typography>
                    <Typography mt={2}>PropertiesPropertiesPropertiesPropertiesProperties</Typography>
                  </Box>

                  <Box mt={4}>
                    <Typography variant="h5">Token Details</Typography>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={2} py={1}>
                      <Typography>Token ID</Typography>
                      <Typography>884</Typography>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                      <Typography>Blockchain</Typography>
                      <Typography>Base</Typography>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                      <Typography>Token Standard</Typography>
                      <Typography>ERC-721</Typography>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                      <Typography>Contract Address</Typography>
                      <Typography>{OmitMiddleString(address)}</Typography>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            )}

            {WALLET_ITEM_TYPE.DEFI === alignment && (
              <Stack direction={'row'} alignItems={'flex-start'}>
                <Typography>No positions to show</Typography>
              </Stack>
            )}

            {WALLET_ITEM_TYPE.TRANSACTIONS === alignment && (
              <Box>
                <Typography variant="h5">Send</Typography>
                <Typography mt={1}>Apr 23, 2025 at 05:12 pm</Typography>

                <Stack direction={'row'} alignItems={'flex-start'} mt={4}>
                  <Box>
                    <Typography>from (You)</Typography>
                    <Stack direction={'row'} alignItems={'center'} mt={1}>
                      <Image src={BitcoinSVG} alt="icon" width={30} height={30} />
                      <Typography px={1}>{OmitMiddleString(address)}</Typography>
                      <IconButton onClick={async () => {}} edge="end">
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Stack>

                    <Box mt={4}>
                      <Typography>Transaction ID</Typography>
                      <Stack direction={'row'} alignItems={'center'}>
                        <Typography pr={1}>{OmitMiddleString(address)}</Typography>
                        <IconButton onClick={async () => {}} edge="end">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Box>

                  <Box pl={20}>
                    <Typography>To</Typography>
                    <Stack direction={'row'} alignItems={'center'} mt={1}>
                      <Image src={BitcoinSVG} alt="icon" width={30} height={30} />
                      <Typography px={1}>{OmitMiddleString(address)}</Typography>
                      <IconButton onClick={async () => {}} edge="end">
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Box mt={4}>
                      <Typography>Transaction Fee</Typography>
                      <Stack direction={'row'} alignItems={'center'} mt={1}>
                        <Typography>0.001 ETH</Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>

                <Box mt={6}>
                  <Typography variant="h6">Sent</Typography>
                  <Stack direction={'row'} alignItems={'center'} mt={1}>
                    <Image src={BitcoinSVG} alt="icon" width={40} height={40} />
                    <Box ml={1}>
                      <Typography>-0.001</Typography>
                      <Typography>ETH</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box mt={6}>
                  <Typography variant="h6">Transaction Details</Typography>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Blockchain</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Image src={BitcoinSVG} alt="icon" width={30} height={30} />
                      <Typography pl={1}>Base</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Status</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Check color="success" />
                      <Typography pl={1}>Success</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Timestamp</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Typography>4 days ago (Apr 23, 2025 at 05:12 pm)</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Block Number</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <IconButton onClick={async () => {}} edge="end">
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <Typography pl={1}>29305093</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Block Hash</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <IconButton onClick={async () => {}} edge="end">
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <Typography pl={1}>{OmitMiddleString(address)}</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Value</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Typography>0.0005 ETH</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Gas Price</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Typography>2010490</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Gas Used</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Typography>21000</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={1}>
                    <Typography>Nonce</Typography>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Typography>11</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            )}

            {WALLET_ITEM_TYPE.SPENDINGCAPS === alignment && <SpendingCapsTable />}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MyAssets;

type RowType = {
  id: number;
  token: string;
  account: string;
  spender: string;
  spendingCap: string;
};

function SpendingCapsTable() {
  const [rows, setRows] = useState<RowType[]>([
    {
      id: 1,
      token: 'USDT',
      account: '0x4e1...eb9a',
      spender: '0x4e1...eb9a',
      spendingCap: 'Unlimited',
    },
  ]);

  const onClickRevoke = (id: number) => {};

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell>Account</TableCell>
            <TableCell>Spender</TableCell>
            <TableCell>Spending Cap</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Stack direction={'row'} alignItems={'center'}>
                      <Image src={BitcoinSVG} alt="icon" width={30} height={30} />
                      <Box pl={1}>
                        <Typography>{row.token}</Typography>
                        <Typography>Ethereum Network</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.account}</TableCell>
                  <TableCell>{row.spender}</TableCell>
                  <TableCell>{row.spendingCap}</TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => {
                        onClickRevoke(row.id);
                      }}
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={100} align="center">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
