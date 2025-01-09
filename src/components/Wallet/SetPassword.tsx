import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSnackPresistStore } from 'lib/store/snack';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';

const SetPassword = () => {
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);

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
      const pwd = password.trim();
      const comPwd = confirmPassword.trim();
      if (pwd.length > 8 && pwd === comPwd) {
        // create password and wallet
        const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
          user_id: getUserId(),
          wallet_id: getWalletId(),
          store_id: getStoreId(),
          password: pwd,
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
      } else {
        setSnackMessage('Input is wrong');
        setSnackSeverity('error');
        setSnackOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password" size={'small'}>
                  Enter at least 8 characters
                </InputLabel>
                <OutlinedInput
                  size={'small'}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  value={password}
                  onChange={(e: any) => {
                    setPassword(e.target.value);
                  }}
                />
              </FormControl>
            </Box>
          </Box>
          <Box mt={4}>
            <Typography>Confirm password</Typography>
            <Box mt={1}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password" size={'small'}>
                  Enter at least 8 characters
                </InputLabel>
                <OutlinedInput
                  size={'small'}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  type={showConfirmPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  value={confirmPassword}
                  onChange={(e: any) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
              </FormControl>
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
