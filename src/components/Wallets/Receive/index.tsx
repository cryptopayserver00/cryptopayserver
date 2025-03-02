import { Box, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ContentCopy } from '@mui/icons-material';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CHAINS, COINS } from 'packages/constants/blockchain';
import { GetImgSrcByCrypto } from 'utils/qrcode';
import TransactionDataGrid from 'components/DataList/TransactionDataGrid';
import { useRouter } from 'next/router';

const WalletsReceive = () => {
  const router = useRouter();
  const { chainId, storeId, network } = router.query;

  if (!chainId || !storeId || !network) return;

  const { setSnackOpen, setSnackSeverity, setSnackMessage } = useSnackPresistStore((state) => state);

  const [address, setAddress] = useState<string>('');

  const getEthereum = async () => {
    try {
      const response: any = await axios.get(Http.find_asset_balance, {
        params: {
          chain_id: chainId,
          store_id: storeId,
          network: network === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result) {
        setAddress(response.data.address);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    await getEthereum();
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box mt={4}>
      <Container>
        <Typography variant="h4" mt={4} textAlign={'center'}>
          Receive ETH
        </Typography>

        <Box mt={4} textAlign={'center'}>
          <Typography>Send only Ethereum network assets to this address</Typography>
          <Paper style={{ padding: 80, marginTop: 20 }}>
            <QRCodeSVG
              value={address}
              width={250}
              height={250}
              imageSettings={{
                src: GetImgSrcByCrypto(COINS.ETH),
                width: 20,
                height: 35,
                excavate: false,
              }}
            />
            <Box mt={4}>
              <Stack direction="row" alignItems="center" justifyContent="center">
                <Typography mr={1}>{address}</Typography>
                <IconButton
                  onClick={async () => {
                    await navigator.clipboard.writeText(address);

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

        <Box mt={4}>
          <Typography variant="h5">Latest Transaction</Typography>
          <Box mt={2}>
            <TransactionDataGrid source="none" chain={Number(chainId)} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default WalletsReceive;
