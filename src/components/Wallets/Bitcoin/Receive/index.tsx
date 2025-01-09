import { Box, Container, IconButton, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ContentCopy } from '@mui/icons-material';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CHAINS } from 'packages/constants/blockchain';
import { GetImgSrcByCrypto } from 'utils/qrcode';

const BitcoinReceive = () => {
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackSeverity, setSnackMessage } = useSnackPresistStore((state) => state);

  const [lightning, setLightning] = useState<string>('');
  const [bitcoin, setBitcoin] = useState<string>('');
  const [alignment, setAlignment] = useState<'lightning' | 'bitcoin'>('bitcoin');

  const handleChange = (e: any) => {
    setAlignment(e.target.value);
  };

  const getBitcoin = async () => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          user_id: getUserId(),
          chain_id: CHAINS.BITCOIN,
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result) {
        setBitcoin(response.data.address);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const init = async () => {
    await getBitcoin();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <Box mt={4}>
      <Container maxWidth="sm">
        <Typography variant="h4" mt={4} textAlign={'center'}>
          Receive BTC
        </Typography>
        <Box mt={2} textAlign={'center'}>
          <ToggleButtonGroup color="primary" value={alignment} exclusive onChange={handleChange} aria-label="type">
            <ToggleButton value="lightning">Lightning</ToggleButton>
            <ToggleButton value="bitcoin">Bitcoin</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {alignment === 'lightning' ? (
          <>
            <Box mt={4} textAlign={'center'}>
              <Typography>No support right now!</Typography>
            </Box>
          </>
        ) : (
          <>
            <Box mt={4} textAlign={'center'}>
              <Typography>Send only Bitcoin network assets to this address</Typography>

              <Paper style={{ padding: 80, marginTop: 20 }}>
                <QRCodeSVG
                  value={bitcoin}
                  width={250}
                  height={250}
                  imageSettings={{
                    src: GetImgSrcByCrypto('BTC'),
                    width: 35,
                    height: 35,
                    excavate: false,
                  }}
                />

                <Box mt={4}>
                  <Stack direction="row" alignItems="center" justifyContent="center">
                    <Typography mr={1}>{bitcoin}</Typography>
                    <IconButton
                      onClick={async () => {
                        await navigator.clipboard.writeText(bitcoin);

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
          </>
        )}
      </Container>
    </Box>
  );
};

export default BitcoinReceive;
