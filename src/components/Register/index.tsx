import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { useSnackPresistStore } from 'lib/store/snack';
import { useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Register = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const onRegister = async () => {
    try {
      if (email !== '' && password !== '' && confirmPassword !== '' && password === confirmPassword) {
        const response: any = await axios.get(Http.find_user_by_email, {
          params: {
            email: email,
          },
        });
        if (response.result && response.data.length > 0) {
          setSnackSeverity('error');
          setSnackMessage('User already exists!');
          setSnackOpen(true);
          return;
        }

        // create user
        const create_user_resp: any = await axios.post(Http.create_user, {
          email: email,
          password: password,
        });
        if (create_user_resp.result) {
          setSnackSeverity('success');
          setSnackMessage('Successful creation!');
          setSnackOpen(true);
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } else {
        setSnackSeverity('error');
        setSnackMessage('The input content is incorrect, please check!');
        setSnackOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Box>
      <Container>
        <Stack alignItems={'center'} mt={8}>
          <CustomLogo style={{ width: 50, height: 50 }}>C</CustomLogo>
          <Typography variant="h5" fontWeight={'bold'} mt={4}>
            Welcome to your CryptoPay Server
          </Typography>
          <Typography mt={2}>
            A self-hosted, open-source crypto payment processor. It is secure, private, censorship-resistant and free.
          </Typography>

          <Card sx={{ minWidth: 450, mt: 4, padding: 2 }}>
            <CardContent>
              <Typography variant="h5">Create account</Typography>
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
                <Typography>Password</Typography>
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
                <Typography>Confirm Password</Typography>
                <Box mt={1}>
                  <TextField
                    fullWidth
                    hiddenLabel
                    type={'password'}
                    size="small"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                  />
                </Box>
              </Box>
              <Box mt={3}>
                <Button fullWidth variant={'contained'} size={'large'} onClick={onRegister}>
                  Create account
                </Button>
              </Box>

              <Box mt={3} textAlign={'center'}>
                <Button
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  Log in
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default Register;
