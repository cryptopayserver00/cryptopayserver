import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { CustomLogo } from 'components/Logo/CustomLogo';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getIsLogin, setUserId, setUserEmail, setUsername, setIsLogin } = useUserPresistStore((state) => state);
  const { setStoreId, setStoreName, setStoreCurrency, setStorePriceSource, setIsStore } = useStorePresistStore(
    (state) => state,
  );
  const { setWalletId, setIsWallet } = useWalletPresistStore((state) => state);

  const onLogin = async () => {
    try {
      if (email !== '' && password !== '') {
        const response: any = await axios.post(Http.login, {
          email: email,
          password: password,
        });
        if (response.result && response.data.length === 1) {
          setUserId(response.data[0].id);
          setUserEmail(response.data[0].email);
          setUsername(response.data[0].username);
          setIsLogin(true);

          const store_resp: any = await axios.get(Http.find_store, {
            params: {
              user_id: response.data[0].id,
            },
          });

          if (store_resp.result) {
            if (store_resp.data.length > 0) {
              setStoreId(store_resp.data[0].id);
              setStoreName(store_resp.data[0].name);
              setStoreCurrency(store_resp.data[0].currency);
              setStorePriceSource(store_resp.data[0].price_source);
              setIsStore(true);

              // search wallet
              const wallet_resp: any = await axios.get(Http.find_wallet, {
                params: {
                  store_id: store_resp.data[0].id,
                },
              });
              if (wallet_resp.result) {
                if (wallet_resp.data.length > 0) {
                  setWalletId(wallet_resp.data[0].id);
                  setIsWallet(true);
                  window.location.href = '/dashboard';
                } else {
                  window.location.href = '/wallet/create';
                }
              } else {
                setSnackSeverity('error');
                setSnackMessage('Can not find the wallet on site!');
                setSnackOpen(true);
              }
            } else {
              window.location.href = '/stores/create';
            }
          } else {
            setSnackSeverity('error');
            setSnackMessage('Can not find the store on site!');
            setSnackOpen(true);
          }
        } else {
          setSnackSeverity('error');
          setSnackMessage('Incorrect username or password!');
          setSnackOpen(true);
        }
      } else {
        setSnackSeverity('error');
        setSnackMessage('The input content is incorrect, please check!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    if (getIsLogin()) {
      window.location.href = '/dashboard';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Stack alignItems={'center'} mt={8}>
          <CustomLogo style={{ width: 50, height: 50 }}>C</CustomLogo>
          <Typography variant="h5" fontWeight={'bold'} mt={4}>
            Welcome to your CryptoPay Server
          </Typography>

          <Card sx={{ minWidth: 450, mt: 4, padding: 2 }}>
            <CardContent>
              <Typography variant="h5">Sign in</Typography>
              <Box mt={3}>
                <Typography>Email</Typography>
                <Box mt={1}>
                  <TextField
                    fullWidth
                    hiddenLabel
                    size="small"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                </Box>
              </Box>
              <Box mt={3}>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography>Password</Typography>
                  <Button>Forgot password?</Button>
                </Stack>
                <Box mt={1}>
                  <TextField
                    fullWidth
                    hiddenLabel
                    type={'password'}
                    size="small"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                  />
                </Box>
              </Box>
              <Box mt={3}>
                <FormControlLabel control={<Checkbox />} label="Remember me" />
              </Box>

              <Box mt={3}>
                <Button fullWidth variant={'contained'} size={'large'} onClick={onLogin}>
                  Sign in
                </Button>
              </Box>

              <Box mt={3} textAlign={'center'}>
                <Button
                  onClick={() => {
                    window.location.href = '/register';
                  }}
                >
                  Create your account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default Login;
