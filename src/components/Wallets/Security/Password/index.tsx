import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { TaskAlt, Close, VisibilityOff, Visibility } from '@mui/icons-material';
import { isValidPassword } from 'utils/verify';

const SecurityPassword = () => {
  const [password, setPassword] = useState<string>('');
  const [isPassword, setIsPassword] = useState<boolean>(false);
  const [openDeletePassword, setOpenDeletePassword] = useState<boolean>(false);
  const [openSetPassword, setOpenSetPassword] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);

  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleDeletePasswordOpen = () => {
    setOpenDeletePassword(true);
  };

  const handleDeletePasswordClose = () => {
    setOpenDeletePassword(false);
  };

  const handleSetPasswordOpen = () => {
    setOpenSetPassword(true);
  };

  const handleSetPasswordClose = () => {
    setOpenSetPassword(false);
  };

  const onClickDeletePassword = async () => {
    const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
      wallet_id: getWalletId(),
      password: '',
    });
    if (response.result) {
      setSnackSeverity('success');
      setSnackMessage('Successful update!');
      setSnackOpen(true);

      await init();

      handleDeletePasswordClose();
    }
  };

  const onClickSetPassword = async () => {
    try {
      if (!password || !isValidPassword(password)) {
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

        await init();

        handleSetPasswordClose();
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    setPassword('');

    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: getWalletId(),
        },
      });

      if (response.result && response.data.password !== '') {
        setIsPassword(true);
      } else {
        setIsPassword(false);
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

  return (
    <Box>
      <Container>
        <Typography variant="h6">Payment Password</Typography>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <Typography fontWeight={'bold'}>Detect Password Binding Status</Typography>
                {isPassword ? (
                  <Icon component={TaskAlt} color={'success'} />
                ) : (
                  <Icon component={Close} color={'error'} />
                )}
              </Stack>

              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={2}>
                <Typography fontWeight={'bold'}>Operate</Typography>
                {isPassword ? (
                  <Button variant={'contained'} color="error" onClick={handleDeletePasswordOpen}>
                    Delete Password
                  </Button>
                ) : (
                  <Button variant={'contained'} onClick={handleSetPasswordOpen}>
                    Set Password
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Dialog
        open={openDeletePassword}
        onClose={handleDeletePasswordClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Are you sure you want to delete your password?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            If you delete your password, you will no longer need password support during the payment process, which may
            raise a range of security risks.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeletePasswordClose}>Disagree</Button>
          <Button onClick={onClickDeletePassword} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSetPassword} onClose={handleSetPasswordClose}>
        <DialogTitle>Set Password</DialogTitle>
        <DialogContent>
          <DialogContentText>Setting up complex passwords can protect your assets.</DialogContentText>
          <TextField
            autoFocus
            required
            margin="dense"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            variant="standard"
            value={password}
            onChange={(e: any) => {
              setPassword(e.target.value);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSetPasswordClose}>Cancel</Button>
          <Button onClick={onClickSetPassword}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityPassword;
