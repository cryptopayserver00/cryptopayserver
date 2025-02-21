import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import AccountCircle from '@mui/icons-material/AccountCircle';

const SecurityWallet = () => {
  const [name, setName] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [isBackup, setIsBackup] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onClickRename = async () => {
    try {
      if (!newName || newName === '') {
        setSnackSeverity('error');
        setSnackMessage('Incorrect name input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.put(Http.update_name_by_wallet_id, {
        wallet_id: getWalletId(),
        name: newName,
      });
      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);

        await init();

        handleClose();
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    setNewName('');

    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: getWalletId(),
        },
      });

      if (response.result && response.data) {
        setName(response.data.name);
        setIsBackup(response.data.is_backup === 1 ? true : false);
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
        <Typography variant="h6">Wallet Manage</Typography>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'center'}>
                <Icon component={AccountCircle} fontSize={'large'} />
                <Typography fontWeight={'bold'} ml={1} mr={5}>
                  {name ? name : 'UNKOWN NAME'}
                </Typography>
                <Chip label={isBackup ? 'Backed up' : 'Not backed up'} />
              </Stack>

              <Box mt={4} width={300}>
                <Button fullWidth variant={'contained'} onClick={handleOpen}>
                  Rename wallet
                </Button>
                <Box mt={1}>
                  <Button
                    fullWidth
                    variant={'contained'}
                    onClick={() => {
                      window.location.href = '/wallet/phrase/intro';
                    }}
                  >
                    Go back up
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Rename Wallet</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              type={'text'}
              fullWidth
              variant="standard"
              value={newName}
              onChange={(e: any) => {
                setNewName(e.target.value);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button onClick={onClickRename}>Confirm</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SecurityWallet;
