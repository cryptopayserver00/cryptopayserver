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
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import Link from 'next/link';
import { CHAINS } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import { EthereumTransactionDetail } from 'packages/web3/types';
import { GetBlockchainAddressUrl, GetBlockchainTxUrl } from 'utils/chain/avax';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import AvalancheSVG from 'assets/chain/avalanche.svg';
import Image from 'next/image';
import { WeiToGwei } from 'utils/number';

type walletType = {
  id: number;
  address: string;
  type: string;
  balance: any;
  transactions: EthereumTransactionDetail[];
};

type feeType = {
  high: number;
  average: number;
  low: number;
};

const Avalanche = () => {
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackMessage, setSnackSeverity, setSnackOpen } = useSnackPresistStore((state) => state);

  const [isSettings, setIsSettings] = useState<boolean>(false);
  const [wallet, setWallet] = useState<walletType[]>([]);
  const [feeObj, setFeeObj] = useState<feeType>();

  const [settingId, setSettingId] = useState<number>(0);
  const [paymentExpire, setPaymentExpire] = useState<number>(0);
  const [confirmBlock, setConfirmBlock] = useState<number>(0);
  const [showRecommendedFee, setShowRecommendedFee] = useState<boolean>(false);
  const [currentUsedAddressId, setCurrentUsedAddressId] = useState<number>(0);

  const onClickRescanAddress = async () => {
    await getAvalancheWalletAddress();

    setSnackSeverity('success');
    setSnackMessage('Successful rescan!');
    setSnackOpen(true);
  };

  const getAvalancheWalletAddress = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          user_id: getUserId(),
          wallet_id: getWalletId(),
          chain_id: CHAINS.AVALANCHE,
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

  const getAvalanchePaymentSetting = async () => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: getUserId(),
          chain_id: CHAINS.AVALANCHE,
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

  const getAvalancheFeeRate = async () => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: CHAINS.AVALANCHE,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setFeeObj({
          high: response.data.fast,
          average: response.data.normal,
          low: response.data.slow,
        });
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const updatePaymentSetting = async () => {
    try {
      const response: any = await axios.put(Http.update_payment_setting_by_id, {
        id: settingId,
        user_id: getUserId(),
        chain_id: CHAINS.AVALANCHE,
        store_id: getStoreId(),
        network: getNetwork() === 'mainnet' ? 1 : 2,
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

  const init = async () => {
    await getAvalancheWalletAddress();
    await getAvalanchePaymentSetting();
    await getAvalancheFeeRate();
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
            <Image src={AvalancheSVG} alt="" width={50} height={50} />
            <Typography variant="h6" pl={1}>
              Avalanche Wallet
            </Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = '/wallets/avalanche/send';
                }}
              >
                Send
              </Button>
            </Box>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = '/wallets/avalanche/receive';
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
          <Typography variant="h6">Avalanche Gas Tracker</Typography>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-around'} mt={2}>
            <Box>
              <Typography>Low</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {WeiToGwei(feeObj?.low as number)} Gwei
              </Typography>
            </Box>
            <Box>
              <Typography>Average</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {WeiToGwei(feeObj?.average as number)} Gwei
              </Typography>
            </Box>
            <Box>
              <Typography>High</Typography>
              <Typography mt={2} fontWeight={'bold'}>
                {WeiToGwei(feeObj?.high as number)} Gwei
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box mt={8}>
          {isSettings ? (
            <Box>
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

                <Box mt={6}>
                  <Button variant={'contained'} onClick={updatePaymentSetting}>
                    Save Payment Settings
                  </Button>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              {wallet &&
                wallet.length > 0 &&
                wallet.map((item, index) => (
                  <Box key={index} mb={10}>
                    <Stack direction={'row'} justifyContent={'space-between'}>
                      <Box>
                        <Typography fontWeight={'bold'} fontSize={18}>
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

export default Avalanche;

function TransactionsTab({ rows }: { rows: EthereumTransactionDetail[] }) {
  const { getNetwork } = useUserPresistStore((state) => state);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Hash</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Asset</TableCell>
            <TableCell>Contract Address</TableCell>
            <TableCell>Type</TableCell>
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
                    <Link
                      href={GetBlockchainTxUrl(getNetwork() === 'mainnet' ? true : false, row.hash)}
                      target={'_blank'}
                    >
                      {row.hash}
                    </Link>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.asset}</TableCell>
                  <TableCell>{row.contractAddress}</TableCell>
                  <TableCell>{row.type}</TableCell>
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
