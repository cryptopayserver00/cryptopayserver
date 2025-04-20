import { Box, Button, FormControl, OutlinedInput, Stack, Typography } from '@mui/material';
import { useSnackPresistStore, useUserPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { isValidPassword } from 'utils/verify';

const Password = () => {
  const [oldPwd, setOldPwd] = useState<string>('');
  const [newPwd, setNewPwd] = useState<string>('');
  const [confirmNewPwd, setConfirmNewPwd] = useState<string>('');

  const { getUserEmail } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickUpdatePassword = async () => {
    try {
      if (
        !oldPwd ||
        !newPwd ||
        !confirmNewPwd ||
        newPwd !== confirmNewPwd ||
        oldPwd === newPwd ||
        !isValidPassword(oldPwd) ||
        !isValidPassword(newPwd) ||
        !isValidPassword(confirmNewPwd)
      ) {
        setSnackSeverity('error');
        setSnackMessage('Please confirm the input content!');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.put(Http.update_user_password_by_email, {
        email: getUserEmail(),
        old_password: oldPwd,
        new_password: newPwd,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Update successful!');
        setSnackOpen(true);
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
    } finally {
      clearData();
    }
  };

  const clearData = () => {
    setOldPwd('');
    setNewPwd('');
    setConfirmNewPwd('');
  };

  return (
    <Box>
      <Typography variant={'h6'}>Change your password</Typography>
      <Box mt={4}>
        <Typography>Current password</Typography>
        <Box mt={1}>
          <FormControl variant="outlined" fullWidth>
            <OutlinedInput
              size={'small'}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              type={'password'}
              value={oldPwd}
              onChange={(e: any) => {
                setOldPwd(e.target.value);
              }}
            />
          </FormControl>
        </Box>
      </Box>

      <Box mt={4}>
        <Typography>New password</Typography>
        <Box mt={1}>
          <FormControl variant="outlined" fullWidth>
            <OutlinedInput
              size={'small'}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              type={'password'}
              value={newPwd}
              onChange={(e: any) => {
                setNewPwd(e.target.value);
              }}
            />
          </FormControl>
        </Box>
      </Box>

      <Box mt={4}>
        <Typography>Confirm new password</Typography>
        <Box mt={1}>
          <FormControl variant="outlined" fullWidth>
            <OutlinedInput
              size={'small'}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              type={'password'}
              value={confirmNewPwd}
              onChange={(e: any) => {
                setConfirmNewPwd(e.target.value);
              }}
            />
          </FormControl>
        </Box>
      </Box>

      <Box mt={5}>
        <Button variant={'contained'} size={'large'} onClick={onClickUpdatePassword} color={'success'}>
          Update Password
        </Button>
      </Box>
    </Box>
  );
};

export default Password;
