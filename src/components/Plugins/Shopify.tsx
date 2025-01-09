import { ReportGmailerrorred } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Shopify = () => {
  const [openShopify, setOpenShopify] = useState<boolean>(false);
  const [id, setId] = useState<number>(0);
  const [shopName, setShopName] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [adminApiAccessToken, setAdminApiAccessToken] = useState<string>('');

  const { getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_shopify_setting, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
        },
      });

      if (response.result && response.data.length === 1) {
        setId(response.data[0].id);
        setShopName(response.data[0].shop_name);
        setApiKey(response.data[0].api_key);
        setAdminApiAccessToken(response.data[0].admin_api_access_token);
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
  }, []);

  const onClickSave = async () => {
    try {
      if (id === 0) {
        // save
        const response: any = await axios.post(Http.create_shopify_setting, {
          user_id: getUserId(),
          store_id: getStoreId(),
          shop_name: shopName,
          api_key: apiKey,
          admin_api_access_token: adminApiAccessToken,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Successful create!');
          setSnackOpen(true);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Failed create!');
          setSnackOpen(true);
        }
      } else if (id > 0) {
        // update
        const response: any = await axios.put(Http.update_shopify_setting, {
          id: id,
          user_id: getUserId(),
          store_id: getStoreId(),
          shop_name: shopName,
          api_key: apiKey,
          admin_api_access_token: adminApiAccessToken,
        });

        if (response.result) {
          setSnackSeverity('success');
          setSnackMessage('Successful update!');
          setSnackOpen(true);
        } else {
          setSnackSeverity('error');
          setSnackMessage('Failed update!');
          setSnackOpen(true);
        }
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
        <Box>
          <Stack direction={'row'} alignItems={'center'} pt={5}>
            <Typography variant="h6">Shopify</Typography>
            <IconButton
              onClick={() => {
                setOpenShopify(!openShopify);
              }}
            >
              <ReportGmailerrorred />
            </IconButton>
          </Stack>
          <Typography mt={2}>Connect CryptoPay Server to your Shopify checkout experience to accept Crypto.</Typography>

          <Box mt={3}>
            <Typography>Shop Name</Typography>
            <Box mt={1}>
              <FormControl variant="outlined" fullWidth>
                <OutlinedInput
                  size={'small'}
                  startAdornment={<InputAdornment position="end">https://</InputAdornment>}
                  endAdornment={<InputAdornment position="end">.myshopify.com</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={shopName}
                  onChange={(e: any) => {
                    setShopName(e.target.value);
                  }}
                />
              </FormControl>
            </Box>
          </Box>

          <Box mt={3}>
            <Typography>API KEY</Typography>
            <Box mt={1}>
              <FormControl fullWidth variant="outlined">
                <OutlinedInput
                  size={'small'}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={apiKey}
                  onChange={(e: any) => {
                    setApiKey(e.target.value);
                  }}
                />
              </FormControl>
            </Box>
          </Box>

          <Box mt={4}>
            <Typography>Admin API access token</Typography>
            <Box mt={1}>
              <FormControl fullWidth variant="outlined">
                <OutlinedInput
                  size={'small'}
                  type="password"
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={adminApiAccessToken}
                  onChange={(e: any) => {
                    setAdminApiAccessToken(e.target.value);
                  }}
                />
              </FormControl>
            </Box>
          </Box>

          <Box mt={5}>
            <Button variant={'contained'} size={'large'} onClick={onClickSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Shopify;
