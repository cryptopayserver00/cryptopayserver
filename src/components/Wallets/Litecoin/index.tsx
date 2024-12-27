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
import { GetBlockchainAddressUrl } from 'utils/chain/ltc';
import { TransactionDetail } from 'packages/web3/types';
import Link from 'next/link';

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

const Litecoin = () => {
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
      const resp: any = await axios.put(Http.update_payment_setting_by_id, {
        id: settingId,
        user_id: getUserId(),
        chain_id: CHAINS.LITECOIN,
        store_id: getStoreId(),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        payment_expire: paymentExpire,
        confirm_block: confirmBlock,
        show_recommended_fee: showRecommendedFee ? 1 : 2,
        current_used_address_id: currentUsedAddressId,
      });
      if (resp.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);

        await init();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getLitecoinWalletAddress = async () => {
    try {
      const find_address_resp: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          user_id: getUserId(),
          wallet_id: getWalletId(),
          chain_id: CHAINS.LITECOIN,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (find_address_resp.result && find_address_resp.data.length > 0) {
        let ws: walletType[] = [];
        find_address_resp.data.forEach(async (item: any) => {
          ws.push({
            id: item.id,
            address: item.address,
            type: item.note,
            balance: item.balance,
            transactions: item.transactions,
          });
        });
        setWallet(ws);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getLitecoinPaymentSetting = async () => {
    try {
      const find_setting_resp: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: getUserId(),
          chain_id: CHAINS.LITECOIN,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (find_setting_resp.result && find_setting_resp.data.length === 1) {
        setSettingId(find_setting_resp.data[0].id);
        setPaymentExpire(find_setting_resp.data[0].payment_expire);
        setConfirmBlock(find_setting_resp.data[0].confirm_block);
        setShowRecommendedFee(find_setting_resp.data[0].show_recommended_fee === 1 ? true : false);
        setCurrentUsedAddressId(
          find_setting_resp.data[0].current_used_address_id ? find_setting_resp.data[0].current_used_address_id : 0,
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getLitecoinFeeRate = async () => {
    try {
      const find_fee_resp: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: CHAINS.LITECOIN,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (find_fee_resp.result) {
        setFeeObj({
          fastest: find_fee_resp.data.fastest,
          halfHour: find_fee_resp.data.halfHour,
          hour: find_fee_resp.data.hour,
          economy: find_fee_resp.data.economy,
          minimum: find_fee_resp.data.minimum,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onClickRescanAddress = async () => {
    await getLitecoinWalletAddress();

    setSnackSeverity('success');
    setSnackMessage('Successful rescan!');
    setSnackOpen(true);
  };

  const init = async () => {
    await getLitecoinWalletAddress();
    await getLitecoinPaymentSetting();
    await getLitecoinFeeRate();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Box>
      <Container>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
          <Box>
            <Typography variant="h6">Litecoin Wallet</Typography>
          </Box>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = '/wallets/litecoin/send';
                }}
              >
                Send
              </Button>
            </Box>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = '/wallets/litecoin/receive';
                }}
              >
                Receive
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

export default Litecoin;

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
        </TableBody>
      </Table>
    </TableContainer>
  );
}
