import { AccountCircle, CloudUpload } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  FormControl,
  Icon,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  styled,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import { PRICE_RESOURCE } from 'packages/constants';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';

const Rates = () => {
  const [priceSource, setPriceSource] = useState<string>(PRICE_RESOURCE[0]);

  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_store_by_id, {
        params: {
          id: getStoreId(),
        },
      });

      if (response.result) {
        setPriceSource(response.data.price_source);
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

  const onClickSave = async () => {
    try {
      if (!PRICE_RESOURCE.includes(priceSource)) {
        setSnackSeverity('error');
        setSnackMessage('Incorrect price source');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.put(Http.update_store_by_id, {
        user_id: getUserId(),
        store_id: getStoreId(),
        price_source: priceSource ? priceSource : '',
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Save successful!');
        setSnackOpen(true);

        await init();
      } else {
        setSnackSeverity('error');
        setSnackMessage('The update failed, please try again later.');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  return (
    <Box>
      <Box>
        <Typography variant="h6">Rates</Typography>
        <Box mt={4}>
          <Typography>Preferred Price Source</Typography>
          <Box mt={1}>
            <FormControl fullWidth>
              <Select
                size={'small'}
                inputProps={{ 'aria-label': 'Without label' }}
                value={priceSource}
                onChange={(e: any) => {
                  setPriceSource(e.target.value);
                }}
              >
                {PRICE_RESOURCE &&
                  PRICE_RESOURCE.length > 0 &&
                  PRICE_RESOURCE.map((item, index) => (
                    <MenuItem value={item} key={index}>
                      {item}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Typography mt={1}>Current Rates source is coingecko.</Typography>
          </Box>

          {/* <Stack direction={'row'} alignItems={'center'} mt={4}>
            <Switch />
            <Box ml={2}>
              <Typography>Advanced rate rule scripting</Typography>
              <Typography mt={1} fontSize={14}>
                Enabling will modify your current rate sources. This is a feature for advanced users.
              </Typography>
            </Box>
          </Stack>

          <Box mt={4}>
            <Typography>Add Exchange Rate Spread</Typography>
            <Box mt={1}>
              <FormControl fullWidth variant="outlined">
                <OutlinedInput
                  size={'small'}
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                />
              </FormControl>
            </Box>
          </Box> */}
        </Box>
      </Box>

      {/* <Box mt={5}>
        <Typography variant="h6">Testing</Typography>
        <Box mt={4}>
          <Typography>Currency pairs to test against your rule (e.g. DOGE_USD,DOGE_CAD,BTC_CAD,BTC_USD)</Typography>
          <Stack direction={'row'} alignItems={'center'} gap={2} mt={1}>
            <TextField fullWidth hiddenLabel defaultValue="" size="small" />
            <Button variant="contained" size="large">
              Test
            </Button>
          </Stack>
        </Box>
      </Box>

      <Box mt={5}>
        <Typography variant="h6">Default Currency Pairs</Typography>
        <Box mt={1}>
          <TextField fullWidth hiddenLabel defaultValue="" size="small" />
        </Box>
      </Box> */}

      <Box mt={5}>
        <Button variant={'contained'} size="large" onClick={onClickSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default Rates;
