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

  const [isSetup, setIsSetup] = useState<boolean>(false);
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

      if (response.result && response.data.authenticator && response.data.authenticator !== '') {
        setIsSetup(true);
        setText(response.data.authenticator);
        const link = `otpauth://totp/CryptoPayServer:${getUserEmail()}?secret=${
          response.data.authenticator
        }&issuer=CryptoPayServer&digits=6`;
        setQrCode(link);
        setPage(1);
      } else {
        setIsSetup(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClickResetApp = async () => {
    try {
      const response: any = await axios.put(Http.update_user_by_email, {
        email: getUserEmail(),
        authenticator: '',
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Reset successful!');
        setSnackOpen(true);

        await init();
        setPage(2);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Reset failed!');
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
    if (!text || !code) {
      return;
    }

    if (VerifyAuthenticator(code, text)) {
      try {
        const response: any = await axios.put(Http.update_user_by_email, {
          email: getUserEmail(),
          authenticator: text,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Save successful!');
          setSnackOpen(true);

          await init();
        } else {
          setSnackSeverity('error');
          setSnackMessage('Authentication failed!');
          setSnackOpen(true);
        }
      } catch (e) {
        setSnackSeverity('error');
        setSnackMessage('The network error occurred. Please try again later.');
        setSnackOpen(true);
        console.error(e);
      } finally {
        clearData();
      }
    } else {
      setSnackMessage('Verification failed!');
      setSnackSeverity('error');
      setSnackOpen(true);
    }
  };

  const clearData = () => {
    setCode('');
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

          {isSetup ? (
            <>
              <Box mt={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Disable 2FA</Typography>
                    <Typography mt={1} mb={2} fontSize={14}>
                      Re-enabling will not require you to reconfigure your app.
                    </Typography>
                    <Button
                      variant={'contained'}
                      onClick={() => {
                        onClickResetApp();
                      }}
                      color="error"
                    >
                      Disable
                    </Button>
                  </CardContent>
                </Card>
              </Box>

              <Box mt={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Reset app</Typography>
                    <Typography mt={1} mb={2} fontSize={14}>
                      Invalidates the current authenticator configuration. Useful if you believe your authenticator
                      settings were compromised.
                    </Typography>
                    <Button
                      variant={'contained'}
                      onClick={() => {
                        onClickResetApp();
                      }}
                      color={'warning'}
                    >
                      Reset
                    </Button>
                  </CardContent>
                </Card>
              </Box>

              <Box mt={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Configure app</Typography>
                    <Typography mt={1} mb={2} fontSize={14}>
                      Display the key or QR code to configure an authenticator app with your current setup.
                    </Typography>
                    <Button
                      variant={'contained'}
                      onClick={() => {
                        setPage(2);
                        clearData();
                      }}
                      color="success"
                    >
                      Check
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </>
          ) : (
            <Box mt={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Enable 2FA</Typography>
                  <Typography mt={1} mb={2} fontSize={14}>
                    Using apps such as Google or Microsoft Authenticator.
                  </Typography>
                  <Button
                    variant={'contained'}
                    onClick={() => {
                      setPage(2);
                      clearData();
                    }}
                    color="success"
                  >
                    Enable
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}
        </>
      )}

      {page === 2 && (
        <>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant={'h6'}>Enable Authenticator App</Typography>
            <Button
              onClick={() => {
                setPage(1);
              }}
              variant={'contained'}
            >
              Back
            </Button>
          </Stack>
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

          <Box mt={6}>
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

          <Box mt={6}>
            <Typography fontSize={14}>
              3. Your two-factor authenticator app will provide you with a unique code. Enter the code in the
              confirmation box below.
            </Typography>

            <Box mt={6}>
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
            <Button onClick={onClickVerify} variant={'contained'} size="large" color="success">
              Verify
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Authentication;
