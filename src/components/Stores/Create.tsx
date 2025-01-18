import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { useWalletPresistStore } from 'lib/store';
import { useSnackPresistStore } from 'lib/store/snack';
import { useStorePresistStore } from 'lib/store/store';
import { useUserPresistStore } from 'lib/store/user';
import { CURRENCY, PRICE_RESOURCE } from 'packages/constants';
import { useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const CreateStore = () => {
  const [name, setName] = useState<string>('');
  const [currency, setCurrency] = useState<string>(CURRENCY[0]);
  const [priceSource, setPriceSource] = useState<string>(PRICE_RESOURCE[0]);

  const { getUserId } = useUserPresistStore((state) => state);
  const { setStoreId, setStoreName, setStoreCurrency, setStorePriceSource, setIsStore } = useStorePresistStore(
    (state) => state,
  );
  const { resetWallet } = useWalletPresistStore(
    (state) => state,
  );
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const onCreateStore = async () => {
    try {
      if (name === '' || currency === '' || priceSource === '') {
        setSnackSeverity('error');
        setSnackMessage('The input content is incorrect, please check!');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.post(Http.create_store, {
        user_id: getUserId(),
        name: name,
        currency: currency,
        price_source: priceSource,
        website: window.location.origin,
      });

      if (response.result) {
        setStoreId(response.data.id);
        setStoreName(response.data.name);
        setStoreCurrency(response.data.currency);
        setStorePriceSource(response.data.price_source);
        setIsStore(true);

        resetWallet()

        setSnackSeverity('success');
        setSnackMessage('Successful creation!');
        setSnackOpen(true);

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
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
      <Container>
        <Stack alignItems={'center'} mt={8}>
          <CustomLogo style={{ width: 50, height: 50 }}>C</CustomLogo>
          <Typography variant="h5" fontWeight={'bold'} mt={4}>
            Create a new store
          </Typography>
          <Typography variant="h6" mt={2}>
            Create a store to begin accepting payments.
          </Typography>

          <Card sx={{ width: 500, mt: 4, padding: 2 }}>
            <CardContent>
              <Box mt={3}>
                <Typography>Name</Typography>
                <Box mt={1}>
                  <TextField
                    fullWidth
                    hiddenLabel
                    size="small"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  />
                </Box>
              </Box>
              <Box mt={3}>
                <Typography>Default currency</Typography>
                <Box mt={1}>
                  <Select
                    size={'small'}
                    inputProps={{ 'aria-label': 'Without label' }}
                    defaultValue={CURRENCY[0]}
                    onChange={(e) => {
                      setCurrency(e.target.value);
                    }}
                    fullWidth
                  >
                    {CURRENCY &&
                      CURRENCY.length > 0 &&
                      CURRENCY.map((item, index) => (
                        <MenuItem value={item} key={index}>
                          {item}
                        </MenuItem>
                      ))}
                  </Select>
                </Box>
              </Box>
              <Box mt={3}>
                <Typography>Preferred Price Source</Typography>
                <Box mt={1}>
                  <Select
                    size={'small'}
                    inputProps={{ 'aria-label': 'Without label' }}
                    defaultValue={PRICE_RESOURCE[0]}
                    onChange={(e) => {
                      setPriceSource(e.target.value);
                    }}
                    fullWidth
                  >
                    {PRICE_RESOURCE &&
                      PRICE_RESOURCE.length > 0 &&
                      PRICE_RESOURCE.map((item, index) => (
                        <MenuItem value={item} key={index}>
                          {item}
                        </MenuItem>
                      ))}
                  </Select>
                </Box>
                <Typography fontSize={14}>
                  The recommended price source gets chosen based on the default currency.
                </Typography>
              </Box>
              <Box mt={3}>
                <Button fullWidth variant={'contained'} size={'large'} onClick={onCreateStore}>
                  Create Store
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default CreateStore;
