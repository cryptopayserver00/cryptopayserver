import { Box, Button, Container, IconButton, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSnackPresistStore } from 'lib/store/snack';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useStorePresistStore, useWalletPresistStore } from 'lib/store';
import { isValidPassword } from 'utils/verify';

const SetPassword = () => {
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getIsStore } = useStorePresistStore((state) => state);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onClickConfirm = async () => {
    try {
      if (
        !password ||
        !confirmPassword ||
        !isValidPassword(password) ||
        !isValidPassword(confirmPassword) ||
        password != confirmPassword
      ) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect password input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
        wallet_id: getWalletId(),
        password: password,
      });
      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);

        setTimeout(() => {
          if (response.data.is_backup === 1) {
            window.location.href = '/dashboard';
          } else if (response.data.is_backup === 2) {
            window.location.href = '/wallet/phrase/intro';
          } else {
            setSnackMessage('Input is wrong');
            setSnackSeverity('error');
            setSnackOpen(true);
            return;
          }
        }, 2000);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
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
        <Stack mt={20}>
          <Typography variant="h4">Setup wallet password</Typography>
          <Typography mt={5}>
            This password is used to unlock the wallet, we cannot restore this password for you.
          </Typography>
          <Typography mt={1}>
            <Link href="#">learn more</Link>
          </Typography>
          <Box mt={4}>
            <Typography>New password</Typography>
            <Box mt={1}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </Box>
          </Box>
          <Box mt={4}>
            <Typography>Confirm password</Typography>
            <Box mt={1}>
              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
              />
            </Box>
          </Box>

          <Box mt={8}>
            <Button variant={'contained'} size={'large'} onClick={onClickConfirm}>
              Confirm
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default SetPassword;
