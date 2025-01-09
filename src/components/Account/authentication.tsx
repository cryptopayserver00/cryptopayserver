import { ContentCopy } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useUserPresistStore } from 'lib/store';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { GenerateAuthenticatorSecret, VerifyAuthenticator, VerifyTOTP } from 'utils/totp';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Authentication = () => {
  const [page, setPage] = useState<number>(1);

  const [text, setText] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const { setSnackMessage, setSnackOpen, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getUserEmail } = useUserPresistStore((state) => state);

  const init = async () => {
    try {
      if (!getUserEmail()) return;

      const response: any = await axios.get(Http.find_user_by_email, {
        params: {
          email: getUserEmail(),
        },
      });

      if (
        response.result &&
        response.data.length === 1 &&
        response.data[0].authenticator &&
        response.data[0].authenticator !== ''
      ) {
        setText(response.data[0].authenticator);
        const link = `otpauth://totp/CryptoPayServer:${getUserEmail()}?secret=${
          response.data[0].authenticator
        }&issuer=CryptoPayServer&digits=6`;
        setQrCode(link);
        setPage(2);
      } else {
        const token = GenerateAuthenticatorSecret();
        setText(token);
        const link = `otpauth://totp/CryptoPayServer:${getUserEmail()}?secret=${token}&issuer=CryptoPayServer&digits=6`;
        setQrCode(link);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const onClickResetApp = async () => {
    try {
      const response: any = await axios.put(Http.update_user_by_email, {
        email: getUserEmail(),
        empty_authenticator: 1,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Update successful!');
        setSnackOpen(true);

        setPage(1);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Update failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickVerify = async () => {
    if (VerifyAuthenticator(code, text)) {
      try {
        const response: any = await axios.put(Http.update_user_by_email, {
          email: getUserEmail(),
          authenticator: text,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Update successful!');
          setSnackOpen(true);

          setPage(1);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Update failed!');
          setSnackOpen(true);
        }
      } catch (e) {
        setSnackSeverity('error');
        setSnackMessage('The network error occurred. Please try again later.');
        setSnackOpen(true);
        console.error(e);
      }
    } else {
      setSnackMessage('Verification failure!');
      setSnackSeverity('error');
      setSnackOpen(true);
    }
  };

  return (
    <Box>
      {page === 1 && (
        <>
          <Typography variant={'h6'}>Two-Factor Authentication</Typography>
          <Typography mt={2} fontSize={14}>
            Two-Factor Authentication (2FA) is an additional measure to protect your account. In addition to your
            password you will be asked for a second proof on login. This can be provided by an app (such as Google or
            Microsoft Authenticator) or a security device (like a Yubikey or your hardware wallet supporting FIDO2).
          </Typography>

          <Typography variant={'h6'} mt={4}>
            App-based 2FA
          </Typography>

          <Box mt={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Enable 2FA</Typography>
                <Typography mt={1} mb={1} fontSize={14}>
                  Using apps such as Google or Microsoft Authenticator.
                </Typography>
                <Button
                  variant={'contained'}
                  onClick={() => {
                    setPage(3);
                  }}
                >
                  Click
                </Button>
              </CardContent>
            </Card>
          </Box>
        </>
      )}

      {page === 2 && (
        <>
          <Typography variant={'h6'}>Two-Factor Authentication</Typography>
          <Typography mt={2} fontSize={14}>
            Two-Factor Authentication (2FA) is an additional measure to protect your account. In addition to your
            password you will be asked for a second proof on login. This can be provided by an app (such as Google or
            Microsoft Authenticator) or a security device (like a Yubikey or your hardware wallet supporting FIDO2).
          </Typography>

          <Typography variant={'h6'} mt={4}>
            App-based 2FA
          </Typography>

          <Box mt={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Disable 2FA</Typography>
                <Typography mt={1} mb={1} fontSize={14}>
                  Re-enabling will not require you to reconfigure your app.
                </Typography>
                <Button
                  variant={'contained'}
                  onClick={() => {
                    onClickResetApp();
                  }}
                >
                  Click
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box mt={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Reset app</Typography>
                <Typography mt={1} mb={1} fontSize={14}>
                  Invalidates the current authenticator configuration. Useful if you believe your authenticator settings
                  were compromised.
                </Typography>
                <Button
                  variant={'contained'}
                  onClick={() => {
                    onClickResetApp();
                  }}
                >
                  Click
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box mt={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Configure app</Typography>
                <Typography mt={1} mb={1} fontSize={14}>
                  Display the key or QR code to configure an authenticator app with your current setup.
                </Typography>
                <Button
                  variant={'contained'}
                  onClick={() => {
                    setPage(3);
                  }}
                >
                  Click
                </Button>
              </CardContent>
            </Card>
          </Box>
        </>
      )}

      {page === 3 && (
        <>
          <Typography variant={'h6'}>Enable Authenticator App</Typography>
          <Box mt={6}>
            <Typography fontSize={14}>To use an authenticator app go through the following steps:</Typography>
            <Typography fontSize={14} mt={2}>
              1. Download a two-factor authenticator app like …
            </Typography>
            <ul>
              <li>
                <Typography fontSize={14}>
                  Authy for&nbsp;
                  <Link href={'https://play.google.com/store/apps/details?id=com.authy.authy'} target="_blank">
                    Android
                  </Link>
                  &nbsp;or&nbsp;
                  <Link href={'https://apps.apple.com/us/app/authy/id494168017'} target="_blank">
                    iOS
                  </Link>
                </Typography>
              </li>
              <li>
                <Typography fontSize={14}>
                  Microsoft Authenticator for&nbsp;
                  <Link href={'https://play.google.com/store/apps/details?id=com.azure.authenticator'} target="_blank">
                    Android
                  </Link>
                  &nbsp;or&nbsp;
                  <Link href={'https://apps.apple.com/us/app/microsoft-authenticator/id983156458'} target="_blank">
                    iOS
                  </Link>
                </Typography>
              </li>
              <li>
                <Typography fontSize={14}>
                  Google Authenticator for&nbsp;
                  <Link
                    href={'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en'}
                    target="_blank"
                  >
                    Android
                  </Link>
                  &nbsp;or&nbsp;
                  <Link href={'https://apps.apple.com/us/app/google-authenticator/id388497605'} target="_blank">
                    iOS
                  </Link>
                </Typography>
              </li>
            </ul>
          </Box>

          <Box mt={4}>
            <Typography fontSize={14}>
              2. Scan the QR Code or enter the following key into your two-factor authenticator app:
            </Typography>

            <Box mt={2}>
              <FormControl sx={{ width: '400px' }} variant="outlined">
                <OutlinedInput
                  size={'small'}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={async () => {
                          await navigator.clipboard.writeText(text);

                          setSnackMessage('Successfully copy');
                          setSnackSeverity('success');
                          setSnackOpen(true);
                        }}
                        edge="end"
                      >
                        <ContentCopy />
                      </IconButton>
                    </InputAdornment>
                  }
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={text}
                  disabled
                />
              </FormControl>

              <Box mt={2}>
                <Paper style={{ padding: 20 }}>
                  <QRCodeSVG
                    value={qrCode}
                    width={250}
                    height={250}
                    imageSettings={{
                      src: '',
                      width: 35,
                      height: 35,
                      excavate: false,
                    }}
                  />
                </Paper>
              </Box>
            </Box>
          </Box>

          <Box mt={4}>
            <Typography fontSize={14}>
              3. Your two-factor authenticator app will provide you with a unique code. Enter the code in the
              confirmation box below.
            </Typography>

            <Box mt={3}>
              <Typography mb={1} fontSize={14}>
                Verification Code
              </Typography>
              <TextField
                hiddenLabel
                size="small"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                }}
              />
            </Box>
          </Box>

          <Box mt={4}>
            <Button onClick={onClickVerify} variant={'contained'}>
              Verify
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Authentication;
