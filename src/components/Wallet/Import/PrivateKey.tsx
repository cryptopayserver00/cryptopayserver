import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Icon,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CHAINNAMES } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { FindChainIdsByChainNames } from 'utils/web3';

const ImportPrivateKey = () => {
  const [network, setNetwork] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN);
  const [privateKey, setPrivateKey] = useState<string>('');

  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId, getIsStore } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const onClickBatchImport = () => {
    setSnackMessage('No support right now');
    setSnackSeverity('error');
    setSnackOpen(true);
  };

  const handleButtonClick = async () => {
    try {
      if (!privateKey || privateKey === '') {
        setSnackSeverity('error');
        setSnackMessage('The privateKey cannot be empty');
        setSnackOpen(true);
        return;
      }

      if (!network || !Object.values(CHAINNAMES).includes(network)) {
        setSnackSeverity('error');
        setSnackMessage('The network cannot be empty');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.post(Http.save_wallet_by_private_key, {
        user_id: getUserId(),
        store_id: getStoreId(),
        chain_id: FindChainIdsByChainNames(network),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        private_key: privateKey,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);
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
    <Box width={420}>
      <FormControl fullWidth>
        <Select
          size={'small'}
          inputProps={{ 'aria-label': 'Without label' }}
          onChange={(e) => {
            setNetwork(e.target.value as CHAINNAMES);
          }}
          value={network}
        >
          {CHAINNAMES &&
            Object.entries(CHAINNAMES).length > 0 &&
            Object.entries(CHAINNAMES).map((item, index) => (
              <MenuItem value={item[1]} key={index}>
                {item[1]}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Box mt={2}>
        <TextField
          label="Private key"
          fullWidth
          multiline
          rows={10}
          value={privateKey}
          onChange={(e) => {
            setPrivateKey(e.target.value);
          }}
        />
      </Box>

      <Box mt={5}>
        <Button size="large" fullWidth variant={'contained'} onClick={handleButtonClick}>
          Confirm
        </Button>
      </Box>
    </Box>
  );
};

export default ImportPrivateKey;
