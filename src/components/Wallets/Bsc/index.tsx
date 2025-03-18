import { AccountCircle, Settings } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import Link from 'next/link';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { EthereumTransactionDetail } from 'packages/web3/types';
import { useEffect, useState } from 'react';
import { GetBlockchainAddressUrl, GetBlockchainTxUrl } from 'utils/chain/bsc';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { WeiToGwei } from 'utils/number';
import BscSVG from 'assets/chain/bsc.svg';
import Image from 'next/image';
import TransactionsTab from 'components/Tab/TransactionTab';
import { GetImgSrcByCrypto } from 'utils/qrcode';

type walletType = {
  id: number;
  address: string;
  type: string;
  balance: any;
  txUrl: string;
  transactions: EthereumTransactionDetail[];
};

type feeType = {
  high: number;
  average: number;
  low: number;
};

const Bsc = () => {
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
    await getBscWalletAddress();

    setSnackSeverity('success');
    setSnackMessage('Successful rescan!');
    setSnackOpen(true);
  };

  const getBscWalletAddress = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_address_by_chain_and_network, {
        params: {
          wallet_id: getWalletId(),
          chain_id: CHAINS.BSC,
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
              txUrl: item.tx_url,
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

  const getBscPaymentSetting = async () => {
    try {
      const response: any = await axios.get(Http.find_payment_setting_by_chain_id, {
        params: {
          user_id: getUserId(),
          chain_id: CHAINS.BSC,
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

  const getBscFeeRate = async () => {
    try {
      const response: any = await axios.get(Http.find_fee_rate, {
        params: {
          chain_id: CHAINS.BSC,
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
    await getBscWalletAddress();
    await getBscPaymentSetting();
    await getBscFeeRate();
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
            <Image src={BscSVG} alt="" width={50} height={50} />
            <Typography variant="h6" pl={1}>
              Binance Smart Chain Wallet
            </Typography>
          </Stack>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Box>
              <Button
                variant={'contained'}
                onClick={() => {
                  window.location.href = `/wallets/send?chainId=${CHAINS.BSC}`;
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
                    CHAINS.BSC
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
          <Typography variant="h6">Bsc Gas Tracker</Typography>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-around'} mt={4} textAlign={'center'}>
            <Card>
              <CardContent>
                <Box px={10}>
                  <Typography>Low</Typography>
                  <Typography mt={2} fontWeight={'bold'}>
                    {WeiToGwei(Number(feeObj?.low)).toFixed(3)} gwei
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box px={10}>
                  <Typography>Average</Typography>
                  <Typography mt={2} fontWeight={'bold'}>
                    {WeiToGwei(Number(feeObj?.average)).toFixed(3)} gwei
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box px={10}>
                  <Typography>High</Typography>
                  <Typography mt={2} fontWeight={'bold'}>
                    {WeiToGwei(Number(feeObj?.high)).toFixed(3)} gwei
                  </Typography>
                </Box>
              </CardContent>
            </Card>
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
                    <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                      <Box>
                        <Typography fontWeight={'bold'} fontSize={18}>
                          Binance Smart Chain
                        </Typography>
                        <Box mt={2}>
                          <Chip
                            icon={<AccountCircle />}
                            label={item.address}
                            component="a"
                            variant="outlined"
                            clickable
                            onClick={async () => {
                              await navigator.clipboard.writeText(item.address);

                              setSnackMessage('Successfully copy');
                              setSnackSeverity('success');
                              setSnackOpen(true);
                            }}
                          />
                        </Box>

                        <Grid mt={2} container gap={2}>
                          {item.balance &&
                            Object.entries(item.balance).map(([coin, amount], balanceIndex) => (
                              <Grid item key={balanceIndex}>
                                <Chip
                                  size={'medium'}
                                  label={String(amount) + ' ' + coin}
                                  icon={
                                    <Image src={GetImgSrcByCrypto(coin as COINS)} alt="logo" width={20} height={20} />
                                  }
                                  variant={'outlined'}
                                />
                              </Grid>
                            ))}
                        </Grid>
                      </Box>
                      <Box>
                        <Button style={{ marginRight: 10 }} variant={'outlined'} href={item.txUrl} target={'_blank'}>
                          Check transactions
                        </Button>
                        <Button
                          variant={'outlined'}
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

export default Bsc;
