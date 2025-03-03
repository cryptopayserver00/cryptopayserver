import { Settings } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Paper,
  TableRow,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { CHAINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { GetBlockchainAddressUrl } from 'utils/chain/btc';
import { TransactionDetail } from 'packages/web3/types';
import Link from 'next/link';
import BitcoinSVG from 'assets/chain/bitcoin.svg';
import Image from 'next/image';

type walletType = {
  id: number;
  address: string;
  type: string;
  balance: any;
  transactions: TransactionDetail[];
};

type feeType = {
  fastest: number;
  halfHour: number;
  hour: number;
  economy: number;
  minimum: number;
};

const Bitcoin = () => {
  const [isSettings, setIsSettings] = useState<boolean>(false);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const [wallet, setWallet] = useState<walletType[]>([]);
  const [feeObj, setFeeObj] = useState<feeType>();

  const [settingId, setSettingId] = useState<number>(0);
  const [paymentExpire, setPaymentExpire] = useState<number>(0);
  const [confirmBlock, setConfirmBlock] = useState<number>(0);
  const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false);
  const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0);

  const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state);

  const updatePaymentSetting = async () => {
    try {
      const response: any = await axios.put(Http.update_payment_setting_by_id, {
        id: settingId,
        payment_expire: paymentExpire,
        confirm_block: confirmBlock,
        show_recommended_fee: showRecommendedFee ? 1 : 2,
        current_used_address_id: currentUsedAddressId,
      });
      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);

        await init();
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getBitcoinWalletAddress = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          wallet_id: getWalletId(),
          chain_id: CHAINS.BITCOIN,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let ws: walletType[] = [];
          response.data.forEach(async (item: any) => {
            ws.push({
              id: item.id,
              address: item.address,
              type: item.note,
              balance: item.balance,
              transactions: item.transactions,
            });
          });
          setWallet(ws);
        } else {
          setWallet([]);
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

  const getBitcoinPaymentSetting = async () => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: getUserId(),
          chain_id: CHAINS.BITCOIN,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result) {
        setSettingId(response.data.id);
        setPaymentExpire(response.data.payment_expire);
        setConfirmBlock(response.data.confirm_block);
        setShowRecommendedFee(response.data.show_recommended_fee === 1 ? true : false);
        setCurrentUsedAddressId(response.data.current_used_address_id ? response.data.current_used_address_id : 0);
      } else {
        setSnackSeverity('error');
        setSnackMessage('The network error occurred. Please try again later.');
        setSnackOpen(true);
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
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickRescanAddress = async () => {
    await getBitcoinWalletAddress();

    setSnackSeverity('success');
    setSnackMessage('Successful rescan!');
    setSnackOpen(true);
  };

  const init = async () => {
    await getBitcoinWalletAddress();
    await getBitcoinPaymentSetting();
    await getBitcoinFeeRate();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
          <Stack direction={'row'} alignItems={'center'}>
            <Image src={BitcoinSVG} alt="" width={50} height={50} />
            <Typography variant="h6" pl={1}>
              Bitcoin Wallet
            </Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = '/wallets/bitcoin/send';
                }}
              >
                Send
              </Button>
            </Box>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = `/wallets/receive?chainId=${
                    CHAINS.BITCOIN
                  }&storeId=${getStoreId()}&network=${getNetwork()}`;
                }}
              >
                Receive
              </Button>
            </Box>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = '/wallets/security/privatekey';
                }}
              >
                Private Key
              </Button>
            </Box>
            <Box>
              <Button variant={'contained'} onClick={onClickRescanAddress}>
                Rescan address
              </Button>
            </Box>
            <IconButton
              onClick={() => {
                setIsSettings(!isSettings);
              }}
            >
              <Settings />
            </IconButton>
          </Stack>
        </Stack>

        <Box mt={8}>
          <Typography variant="h6">Transaction fee</Typography>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-around'} mt={2}>
            <Box>
              <Typography>Minimum</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {feeObj?.minimum} sat/vB
              </Typography>
            </Box>
            <Box>
              <Typography>Economy</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {feeObj?.economy} sat/vB
              </Typography>
            </Box>
            <Box>
              <Typography>Hour</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {feeObj?.hour} sat/vB
              </Typography>
            </Box>
            <Box>
              <Typography>HalfHour</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {feeObj?.halfHour} sat/vB
              </Typography>
            </Box>
            <Box>
              <Typography>Fastest</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {feeObj?.fastest} sat/vB
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box mt={8}>
          {isSettings ? (
            <Box>
              {/* <Typography variant="h6">BTC Wallet Settings</Typography>
              <Stack alignItems={'center'} direction={'row'} mt={2}>
                <Typography>Hot wallet</Typography>
                <Box ml={2}>
                  <FormControl sx={{ minWidth: 300 }}>
                    <Select
                      size={'small'}
                      inputProps={{ 'aria-label': 'Without label' }}
                      defaultValue={0}
                      //   value={age}

                      //   onChange={handleChange}
                    >
                      <MenuItem disabled value={0}>
                        <em>Actions</em>
                      </MenuItem>
                      <MenuItem value={1}>Rescan wallet for missing transactions</MenuItem>
                      <MenuItem value={2}>Prune old transactions from history</MenuItem>
                      <MenuItem value={3}>Register wallet for payment links</MenuItem>
                      <MenuItem value={4}>Replace wallet</MenuItem>
                      <MenuItem value={5}>Remove wallet</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
              <Stack alignItems={'center'} direction={'row'} mt={2}>
                <Switch />
                <Typography>Enabled</Typography>
              </Stack>

              <Box mt={2}>
                <Typography>Label</Typography>
                <Box mt={1}>
                  <FormControl variant="outlined">
                    <OutlinedInput
                      size={'small'}
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                    />
                  </FormControl>
                </Box>
              </Box>

              <Box mt={2}>
                <Typography>Derivation scheme</Typography>
                <Box mt={1}>
                  <FormControl sx={{ width: '500px' }} variant="outlined">
                    <OutlinedInput
                      size={'small'}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={() => {}} edge="end">
                            <ContentCopy />
                          </IconButton>
                        </InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                      value={
                        'xpub6DRunDsNiq7TnoRURSkhQ3C5BL6GFPCCmifHup86urjRjJdvnue6ArArMvkhiAaMMbq3mtCoAGfL8DSLqZwzSHTXt8c7YismkM8oUaaaYiq'
                      }
                      disabled
                    />
                  </FormControl>
                </Box>
              </Box>

              <Box mt={5}>
                <Typography variant="h6">Account Key 0</Typography>

                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={2}>
                  <Typography>Account key</Typography>
                  <Stack direction={'row'} alignItems={'center'}>
                    <QrCode />
                    <Typography pl={1}>Show export QR</Typography>
                  </Stack>
                </Stack>

                <Box mt={1}>
                  <FormControl variant="outlined" fullWidth>
                    <OutlinedInput
                      size={'small'}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton aria-label="toggle password visibility" onClick={() => {}} edge="end">
                            <ContentCopy />
                          </IconButton>
                        </InputAdornment>
                      }
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                      value={
                        'xpub6DRunDsNiq7TnoRURSkhQ3C5BL6GFPCCmifHup86urjRjJdvnue6ArArMvkhiAaMMbq3mtCoAGfL8DSLqZwzSHTXt8c7YismkM8oUaaaYiq'
                      }
                      disabled
                    />
                  </FormControl>
                </Box>

                <Stack direction={'row'} alignItems={'center'} mt={3}>
                  <Box>
                    <Typography>Master fingerprint</Typography>
                    <Box mt={1}>
                      <FormControl variant="outlined">
                        <OutlinedInput
                          size={'small'}
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            'aria-label': 'weight',
                          }}
                        />
                      </FormControl>
                    </Box>
                  </Box>
                  <Box ml={4}>
                    <Typography>Account key path</Typography>
                    <Box mt={1}>
                      <FormControl variant="outlined">
                        <OutlinedInput
                          size={'small'}
                          aria-describedby="outlined-weight-helper-text"
                          inputProps={{
                            'aria-label': 'weight',
                          }}
                        />
                      </FormControl>
                    </Box>
                  </Box>
                </Stack>

                <Box mt={5}>
                  <Button variant={'contained'}>Save Wallet Settings</Button>
                </Box>
              </Box> */}

              <Box mt={5}>
                <Typography variant="h6">Payment</Typography>
                <Box mt={3}>
                  <Typography>The transaction address currently used</Typography>
                  <Box mt={1}>
                    <FormControl sx={{ minWidth: 300 }}>
                      <Select
                        size={'small'}
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={currentUsedAddressId}
                        onChange={(e: any) => {
                          setCurrentUsedAddressId(e.target.value);
                        }}
                      >
                        <MenuItem value={0}>None</MenuItem>
                        {wallet.map((item, index) => (
                          <MenuItem value={item.id} key={index}>
                            {item.address}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box mt={3}>
                  <Typography>Payment invalid if transactions fails to confirm … after invoice expiration</Typography>
                  <Box mt={1}>
                    <FormControl variant="outlined">
                      <OutlinedInput
                        size={'small'}
                        type="number"
                        endAdornment={<InputAdornment position="end">minutes</InputAdornment>}
                        aria-describedby="outlined-weight-helper-text"
                        inputProps={{
                          'aria-label': 'weight',
                        }}
                        value={paymentExpire}
                        onChange={(e: any) => {
                          setPaymentExpire(e.target.value);
                        }}
                      />
                    </FormControl>
                  </Box>
                </Box>
                <Box mt={3}>
                  <Typography>Consider the invoice settled when the payment transaction …</Typography>
                  <Box mt={1}>
                    <FormControl sx={{ minWidth: 300 }}>
                      <Select
                        size={'small'}
                        inputProps={{ 'aria-label': 'Without label' }}
                        value={confirmBlock}
                        onChange={(e: any) => {
                          setConfirmBlock(e.target.value);
                        }}
                      >
                        <MenuItem value={0}>Is unconfirmed</MenuItem>
                        <MenuItem value={1}>Has at least 1 confirmation</MenuItem>
                        <MenuItem value={2}>Has at least 2 confirmation</MenuItem>
                        <MenuItem value={3}>Has at least 6 confirmation</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Box mt={3}>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Switch
                      checked={showRecommendedFee}
                      onChange={(e: any) => {
                        setShowRecommendedFee(e.target.checked);
                      }}
                    />
                    <Box ml={2}>
                      <Typography>Show recommended fee</Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* <Typography mt={3}>Recommended fee confirmation target blocks</Typography>
                <Box mt={1}>
                  <FormControl variant="outlined">
                    <OutlinedInput
                      size={'small'}
                      type="number"
                      aria-describedby="outlined-weight-helper-text"
                      inputProps={{
                        'aria-label': 'weight',
                      }}
                    />
                  </FormControl>
                </Box> */}

                <Box mt={6}>
                  <Button variant={'contained'} onClick={updatePaymentSetting}>
                    Save Payment Settings
                  </Button>
                </Box>
              </Box>

              {/* <Box mt={5}>
                <Typography variant="h6">Labels</Typography>
                <Box mt={2}>
                  <Button>Manage labels</Button>
                </Box>
              </Box> */}
            </Box>
          ) : (
            <Box>
              {wallet &&
                wallet.length > 0 &&
                wallet.map((item, index) => (
                  <Box key={index} mb={10}>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                      <Box>
                        <Typography fontWeight={'bold'} fontSize={14}>
                          {item.type}
                        </Typography>
                        <Typography mt={1}>{item.address}</Typography>
                        {item.balance &&
                          Object.entries(item.balance).map(([coin, amount], balanceIndex) => (
                            <Typography mt={1} fontWeight={'bold'} key={balanceIndex}>
                              {amount as string} {coin}
                            </Typography>
                          ))}
                      </Box>
                      <Box>
                        <Button
                          href={GetBlockchainAddressUrl(getNetwork() === 'mainnet' ? true : false, item.address)}
                          target={'_blank'}
                        >
                          Check onChain
                        </Button>
                      </Box>
                    </Stack>
                    <Box mt={5}>
                      {item.transactions && item.transactions.length > 0 ? (
                        <TransactionsTab rows={item.transactions} />
                      ) : (
                        <Typography>There are no transactions yet.</Typography>
                      )}
                    </Box>
                  </Box>
                ))}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Bitcoin;

function TransactionsTab({ rows }: { rows: TransactionDetail[] }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Hash</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Asset</TableCell>
            <TableCell>Fee</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Block Number</TableCell>
            <TableCell>Block Timestamp</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Link href={row.url} target={'_blank'}>
                      {row.hash}
                    </Link>
                  </TableCell>
                  <TableCell>{row.value} sat</TableCell>
                  <TableCell>{row.asset}</TableCell>
                  <TableCell>{row.fee} sat</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.blockNumber}</TableCell>
                  <TableCell>{new Date((row.blockTimestamp as number) * 1000).toLocaleString()}</TableCell>
                  <TableCell>{row.status}</TableCell>
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
