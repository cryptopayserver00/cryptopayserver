import { Box, Container, IconButton, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ContentCopy } from '@mui/icons-material';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { GetImgSrcByCrypto } from 'utils/qrcode';

const LitecoinReceive = () => {
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackSeverity, setSnackMessage } = useSnackPresistStore((state) => state);

  const [litecoin, setLitecoin] = useState<string>('');

  const getLitecoin = async () => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          user_id: getUserId(),
          chain_id: CHAINS.LITECOIN,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result) {
        setLitecoin(response.data.address);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    await getLitecoin();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box mt={4}>
      <Container maxWidth="sm">
        <Typography variant="h4" mt={4} textAlign={'center'}>
          Receive LTC
        </Typography>

        <Box mt={4} textAlign={'center'}>
          <Typography>Send only Litecoin network assets to this address</Typography>

          <Paper style={{ padding: 80, marginTop: 20 }}>
            <QRCodeSVG
              value={litecoin}
              width={250}
              height={250}
              imageSettings={{
                src: GetImgSrcByCrypto(COINS.LTC),
                width: 45,
                height: 45,
                excavate: false,
              }}
            />

            <Box mt={4}>
              <Stack direction="row" alignItems="center" justifyContent="center">
                <Typography mr={1}>{litecoin}</Typography>
                <IconButton
                  onClick={async () => {
                    await navigator.clipboard.writeText(litecoin);

                    setSnackMessage('Successfully copy');
                    setSnackSeverity('success');
                    setSnackOpen(true);
                  }}
                >
                  <ContentCopy fontSize={'small'} />
                </IconButton>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default LitecoinReceive;
