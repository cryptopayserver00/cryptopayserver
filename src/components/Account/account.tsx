import styled from '@emotion/styled';
import { CloudUpload } from '@mui/icons-material';
import { Box, Button, FormControl, OutlinedInput, Stack, Typography } from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { useUserPresistStore } from 'lib/store/user';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const MainAccount = () => {
  const { getUserEmail } = useUserPresistStore((state) => state);

  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [profileUrl, setProfileUrl] = useState<string>('');

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickSave = async () => {
    try {
      const response: any = await axios.put(Http.update_user_by_email, {
        email: email,
        username: name,
        profile_picture_url: profileUrl,
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
    }
  };

  const onClickDeleteAccount = async () => {
    try {
      const response: any = await axios.put(Http.delete_user_by_email, {
        email: email,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Delete successful!');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Delete failed!');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    console.log(111);
    try {
      if (!getUserEmail()) return;

      const response: any = await axios.get(Http.find_user_by_email, {
        params: {
          email: getUserEmail(),
        },
      });

      if (response.result && response.data.length === 1) {
        setName(response.data[0].username);
        setEmail(response.data[0].email);
        setProfileUrl(response.data[0].profile_picture_url);
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

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  return (
    <Box>
      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
        <Typography variant={'h6'}>Update your account</Typography>
        <Button variant={'contained'} onClick={onClickSave} size="large">
          Save
        </Button>
      </Stack>

      <Box mt={4}>
        <Typography>Email</Typography>
        <Box mt={1}>
          <FormControl fullWidth variant="outlined">
            <OutlinedInput
              size={'small'}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              value={email}
              onChange={(e: any) => {
                setEmail(e.target.value);
              }}
            />
          </FormControl>
        </Box>
      </Box>

      <Box mt={2}>
        <Typography>Name</Typography>
        <Box mt={1}>
          <FormControl fullWidth variant="outlined">
            <OutlinedInput
              fullWidth
              size={'small'}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              value={name}
              onChange={(e: any) => {
                setName(e.target.value);
              }}
            />
          </FormControl>
        </Box>
      </Box>

      <Box mt={2}>
        <Typography>Profile Picture</Typography>
        <Box mt={1}>
          {profileUrl && (
            <Box mt={4} mb={4}>
              <Image src={profileUrl} alt="logo" width={100} height={100} />
            </Box>
          )}

          <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<CloudUpload />}>
            Choose File
            <VisuallyHiddenInput type="file" />
          </Button>
        </Box>
      </Box>

      <Box mt={5}>
        <Typography variant={'h6'}>Delete Account</Typography>
        <Box mt={2}>
          <Button variant={'contained'} size={'large'} onClick={onClickDeleteAccount}>
            Delete Account
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default MainAccount;
