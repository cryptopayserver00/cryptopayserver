import { Box, Card, CardContent, Container, Icon, Stack, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useEffect } from 'react';
import { useSnackPresistStore } from 'lib/store/snack';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';

const GenerateWallet = () => {
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setWalletId, setIsWallet } = useWalletPresistStore((state) => state);

  const onClickMnemonicPhrase = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet, {
        params: {
          store_id: getStoreId(),
        },
      });
      if (response.result && response.data.length > 0) {
        setSnackSeverity('error');
        setSnackMessage('This store already has a wallet');
        setSnackOpen(true);

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
        setTimeout(() => {
          window.location.href = '/wallet/setPassword';
        }, 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onClickHardwareWallet = () => {
    setSnackMessage('Not supported.');
    setSnackSeverity('warning');
    setSnackOpen(true);
  };

  useEffect(() => {}, []);

  return (
    <Box>
      <Container>
        <Stack alignItems={'center'} mt={20}>
          <Typography variant="h4">Create wallet</Typography>
          <Box mt={8}>
            <div onClick={onClickMnemonicPhrase}>
              <Card sx={{ width: 700, padding: 2 }}>
                <CardContent>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
                      <Box ml={5}>
                        <Typography variant="h5">Mnemonic phrase</Typography>
                      </Box>
                    </Stack>
                    <Icon component={ChevronRightIcon} fontSize={'large'} />
                  </Stack>
                </CardContent>
              </Card>
            </div>
          </Box>
          <Box mt={8}>
            <div onClick={onClickHardwareWallet}>
              <Card sx={{ width: 700, padding: 2 }}>
                <CardContent>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
                      <Box ml={5}>
                        <Typography variant="h5">Hardware wallet</Typography>
                      </Box>
                    </Stack>
                    <Icon component={ChevronRightIcon} fontSize={'large'} />
                  </Stack>
                </CardContent>
              </Card>
            </div>
          </Box>

          <Typography mt={10}>Continuing implies agreeing to CryptoPayServer user agreement.</Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default GenerateWallet;
