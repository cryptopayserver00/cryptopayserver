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
import { IsValidEmail } from 'utils/verify';

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('');

  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getIsLogin } = useUserPresistStore((state) => state);

  const onResetPassword = async () => {
    try {
      if (!email || email === '' || !IsValidEmail(email)) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect email input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.get(Http.send_reset_email, {
        params: {
          email: email,
        },
      });
      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Email already sent');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Incorrect email');
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
              <Typography variant="h5">Forgot Password</Typography>
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
                <Button fullWidth variant={'contained'} size={'large'} onClick={onResetPassword}>
                  Send reset email
                </Button>
              </Box>
              <Box mt={2}>
                <Button
                  fullWidth
                  size={'large'}
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  Return to Login
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
