import { Box, Button, Card, CardContent, Container, Icon, Stack, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect } from 'react';
import { useSnackPresistStore } from 'lib/store/snack';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import Link from 'next/link';

const GenerateWallet = () => {
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { getIsStore, getStoreId } = useStorePresistStore((state) => state);
  const { setWalletId, setIsWallet } = useWalletPresistStore((state) => state);

  const onClickMnemonicPhrase = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet, {
        params: {
          store_id: getStoreId(),
        },
      });
      if (response.result) {
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        return;
      }

      const create_wallet_resp: any = await axios.post(Http.create_wallet, {
        user_id: getUserId(),
        store_id: getStoreId(),
      });
      if (create_wallet_resp.result) {
        setWalletId(create_wallet_resp.data.wallet_id);
        setIsWallet(true);
        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);

        await walletToBlockScan(create_wallet_resp.data.wallet_id);

        setTimeout(() => {
          window.location.href = '/wallet/setPassword';
        }, 2000);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const walletToBlockScan = async (walletId: string) => {
    try {
      const response: any = await axios.post(Http.create_wallet_to_block_scan, {
        user_id: getUserId(),
        wallet_id: walletId,
      });

      if (response.result) {
      } else {
        setSnackSeverity('error');
        setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickHardwareWallet = () => {
    setSnackMessage('Not supported.');
    setSnackSeverity('warning');
    setSnackOpen(true);
  };

  useEffect(() => {
    if (!getIsStore()) {
      window.location.href = '/stores/create';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Stack alignItems={'center'} mt={20}>
          <Typography variant="h4">Create wallet</Typography>
          <Box mt={8}>
            <Button onClick={onClickMnemonicPhrase}>
              <Card sx={{ width: 700, padding: 2 }}>
                <CardContent>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
                      <Typography variant="h5" ml={5}>
                        Mnemonic phrase
                      </Typography>
                    </Stack>
                    <Icon component={ChevronRightIcon} fontSize={'large'} />
                  </Stack>
                </CardContent>
              </Card>
            </Button>
          </Box>

          <Box mt={8}>
            <Button onClick={onClickHardwareWallet}>
              <Card sx={{ width: 700, padding: 2 }}>
                <CardContent>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
                      <Typography variant="h5" ml={5}>
                        Hardware wallet
                      </Typography>
                    </Stack>
                    <Icon component={ChevronRightIcon} fontSize={'large'} />
                  </Stack>
                </CardContent>
              </Card>
            </Button>
          </Box>

          <Typography mt={10}>
            Continuing implies agreeing to CryptoPayServer <Link href={'#'}>user agreement</Link>.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default GenerateWallet;
