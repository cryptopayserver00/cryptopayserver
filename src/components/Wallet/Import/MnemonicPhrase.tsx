import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const ImportMnemonicPhrase = () => {
  const [bit, setBit] = useState<number>(12);
  const [phrase, setPhrase] = useState<string[]>([]);

  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setWalletId, setIsWallet } = useWalletPresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);

  const handleBitChange = (e: any) => {
    setBit(e.target.value);
  };

  const handlePhraseChange = (e: any, index: number) => {
    const newPhrase = [...phrase];
    newPhrase[index - 1] = e.target.value;
    setPhrase(newPhrase);
  };

  const handleButtonClick = async () => {
    if (!phrase || phrase.filter((element) => element !== undefined && element !== '').length !== bit) {
      setSnackSeverity('error');
      setSnackMessage('No suuport the wallet');
      setSnackOpen(true);
      return;
    }

    try {
      const response: any = await axios.get(Http.find_wallet, {
        params: {
          store_id: getStoreId(),
        },
      });

      if (response.result && response.data.length > 0) {
        setSnackSeverity('error');
        setSnackMessage('This store already has a wallet');
        setSnackOpen(true);

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
        return;
      }

      const import_wallet_resp: any = await axios.post(Http.save_wallet, {
        import_wallet: phrase.join(' '),
        store_id: getStoreId(),
        user_id: getUserId(),
      });

      if (import_wallet_resp.result) {
        setWalletId(import_wallet_resp.data.wallet_id);
        setIsWallet(true);
        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);
        setTimeout(() => {
          window.location.href = '/wallet/setPassword';
        }, 2000);
      } else {
        setSnackSeverity('error');
        setSnackMessage('No suuport the wallet');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('No suuport the wallet');
      setSnackOpen(true);
      console.error(e);
    }
  };

  return (
    <Box>
      <Stack direction={'row'} alignItems={'center'}>
        <Typography>My mnemonic phrase is</Typography>
        <Box ml={1}>
          <FormControl hiddenLabel size="small">
            <Select value={bit} onChange={handleBitChange}>
              <MenuItem value={12}>12 bit</MenuItem>
              {/* <MenuItem value={24}>24 bit</MenuItem> */}
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <Box>
        <Box mt={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <TextField
              hiddenLabel
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">1</InputAdornment>,
              }}
              value={phrase[0]}
              onChange={(e: any) => {
                handlePhraseChange(e, 1);
              }}
              style={{ width: 200 }}
            />
            <Box ml={2}>
              <TextField
                hiddenLabel
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">2</InputAdornment>,
                }}
                style={{ width: 200 }}
                value={phrase[1]}
                onChange={(e: any) => {
                  handlePhraseChange(e, 2);
                }}
              />
            </Box>
          </Stack>
        </Box>
        <Box mt={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <TextField
              hiddenLabel
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">3</InputAdornment>,
              }}
              style={{ width: 200 }}
              value={phrase[2]}
              onChange={(e: any) => {
                handlePhraseChange(e, 3);
              }}
            />
            <Box ml={2}>
              <TextField
                hiddenLabel
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">4</InputAdornment>,
                }}
                style={{ width: 200 }}
                value={phrase[3]}
                onChange={(e: any) => {
                  handlePhraseChange(e, 4);
                }}
              />
            </Box>
          </Stack>
        </Box>
        <Box mt={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <TextField
              hiddenLabel
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">5</InputAdornment>,
              }}
              style={{ width: 200 }}
              value={phrase[4]}
              onChange={(e: any) => {
                handlePhraseChange(e, 5);
              }}
            />
            <Box ml={2}>
              <TextField
                hiddenLabel
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">6</InputAdornment>,
                }}
                style={{ width: 200 }}
                value={phrase[5]}
                onChange={(e: any) => {
                  handlePhraseChange(e, 6);
                }}
              />
            </Box>
          </Stack>
        </Box>
        <Box mt={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <TextField
              hiddenLabel
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">7</InputAdornment>,
              }}
              style={{ width: 200 }}
              value={phrase[6]}
              onChange={(e: any) => {
                handlePhraseChange(e, 7);
              }}
            />
            <Box ml={2}>
              <TextField
                hiddenLabel
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">8</InputAdornment>,
                }}
                style={{ width: 200 }}
                value={phrase[7]}
                onChange={(e: any) => {
                  handlePhraseChange(e, 8);
                }}
              />
            </Box>
          </Stack>
        </Box>
        <Box mt={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <TextField
              hiddenLabel
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">9</InputAdornment>,
              }}
              style={{ width: 200 }}
              value={phrase[8]}
              onChange={(e: any) => {
                handlePhraseChange(e, 9);
              }}
            />
            <Box ml={2}>
              <TextField
                hiddenLabel
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">10</InputAdornment>,
                }}
                style={{ width: 200 }}
                value={phrase[9]}
                onChange={(e: any) => {
                  handlePhraseChange(e, 10);
                }}
              />
            </Box>
          </Stack>
        </Box>
        <Box mt={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <TextField
              hiddenLabel
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start">11</InputAdornment>,
              }}
              style={{ width: 200 }}
              value={phrase[10]}
              onChange={(e: any) => {
                handlePhraseChange(e, 11);
              }}
            />
            <Box ml={2}>
              <TextField
                hiddenLabel
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">12</InputAdornment>,
                }}
                style={{ width: 200 }}
                value={phrase[11]}
                onChange={(e: any) => {
                  handlePhraseChange(e, 12);
                }}
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box mt={5}>
        <Button size="large" variant={'contained'} onClick={() => handleButtonClick()}>
          Confirm
        </Button>
      </Box>
    </Box>
  );
};

export default ImportMnemonicPhrase;
