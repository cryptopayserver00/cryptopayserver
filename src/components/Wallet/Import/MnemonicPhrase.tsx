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
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const ImportMnemonicPhrase = () => {
  const [bit, setBit] = useState<number>(12);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [phrase, setPhrase] = useState<string[]>([]);

  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
  const { getStoreId, getIsStore } = useStorePresistStore((state) => state);
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
      setSnackMessage('The input cannot be empty');
      setSnackOpen(true);
      return;
    }

    try {
      const response: any = await axios.get(Http.find_wallet, {
        params: {
          store_id: getStoreId(),
        },
      });

      if (response.result) {
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

        await walletToBlockScan(import_wallet_resp.data.wallet_id);

        setTimeout(() => {
          window.location.href = '/wallet/setPassword';
        }, 2000);
      } else {
        setSnackSeverity('error');
        setSnackMessage('No support the wallet');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('No support the wallet');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const walletToBlockScan = async (walletId: string) => {
    try {
      const response: any = await axios.post(Http.create_wallet_to_block_scan, {
        user_id: getUserId(),
        wallet_id: walletId,
      });

      if (response.result) {
      } else {
        setSnackSeverity('error');
        setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('Some addresses cannot join the Sweeping Quest, please try again');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    const newNumbers = Array.from({ length: bit / 2 }, (_, index) => index);
    setNumbers(newNumbers);
  }, [bit]);

  useEffect(() => {
    if (!getIsStore()) {
      window.location.href = '/stores/create';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Stack direction={'row'} alignItems={'center'}>
        <Typography>My mnemonic phrase is</Typography>
        <Box ml={1}>
          <FormControl hiddenLabel size="small">
            <Select value={bit} onChange={handleBitChange}>
              <MenuItem value={12}>12 bit</MenuItem>
              <MenuItem value={24}>24 bit</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
      <Box>
        {numbers &&
          numbers.map((item, index) => (
            <Box mt={2} key={index}>
              <Stack direction={'row'} alignItems={'center'}>
                <TextField
                  hiddenLabel
                  size="small"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{item * 2 + 1}</InputAdornment>,
                  }}
                  value={phrase[item * 2]}
                  onChange={(e: any) => {
                    handlePhraseChange(e, item * 2 + 1);
                  }}
                  style={{ width: 200 }}
                />
                <Box ml={2}>
                  <TextField
                    hiddenLabel
                    size="small"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">{item * 2 + 2}</InputAdornment>,
                    }}
                    style={{ width: 200 }}
                    value={phrase[item * 2 + 1]}
                    onChange={(e: any) => {
                      handlePhraseChange(e, item * 2 + 2);
                    }}
                  />
                </Box>
              </Stack>
            </Box>
          ))}
      </Box>

      <Box mt={5} width={420}>
        <Button size="large" fullWidth variant={'contained'} onClick={handleButtonClick}>
          Confirm
        </Button>
      </Box>
    </Box>
  );
};

export default ImportMnemonicPhrase;
