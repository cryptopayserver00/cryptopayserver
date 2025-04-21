import { ReportGmailerrorred } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
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
  const [openExplain, setOpenExplain] = useState<boolean>(false);
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

      if (response.result) {
        setId(response.data.id);
        setShopName(response.data.shop_name);
        setApiKey(response.data.api_key);
        setAdminApiAccessToken(response.data.admin_api_access_token);
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
          <Box mt={2}>
            <Alert severity="warning">
              <AlertTitle>Important notice</AlertTitle>
              This Shopify integration has been discontinued by Shopify and will no longer be supported after{' '}
              <b>August 31, 2025</b>.
              <br />
              If you completed your CryptoPay Server-Shopify setup before <b>December 31, 2024</b>, you may continue
              using it until August 31, 2025.
              <br />
              However, we recommend transitioning to Shopify V2 for continued functionality.
              <br />
              All new users have to use Shopify V2. Refer to this guide to get started with Shopify V2
            </Alert>
          </Box>

          <Stack direction={'row'} alignItems={'center'} pt={2}>
            <Typography variant="h6">Shopify</Typography>
            <IconButton
              onClick={() => {
                setOpenExplain(!openExplain);
              }}
            >
              <ReportGmailerrorred />
            </IconButton>
          </Stack>
          {openExplain && (
            <Alert severity="info">
              <AlertTitle>Info</AlertTitle>
              Introducing CryptoPay Server for Shopify – open-source payment gateway that enables you accept crypto
              payments directly on your website or stores from customers with no fee.
            </Alert>
          )}
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
            <Button variant={'contained'} size={'large'} onClick={onClickSave} color="success">
              Save
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Shopify;
