import { Box, Button, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ContentCopy, Send } from '@mui/icons-material';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore } from 'lib/store';
import { GetImgSrcByCrypto } from 'utils/qrcode';
import TransactionDataGrid from 'components/DataList/TransactionDataGrid';
import { FindChainNamesByChains } from 'utils/web3';
import { CHAINS, COIN, COINS } from 'packages/constants/blockchain';
import { useRouter } from 'next/router';
import WalletConnectButton from 'components/Button/WalletConnectButton';

const WalletsReceive = () => {
  const router = useRouter();
  const { chainId, storeId, network } = router.query;

  const { setSnackOpen, setSnackSeverity, setSnackMessage } = useSnackPresistStore((state) => state);

  const [address, setAddress] = useState<string>('');
  const [mainCoin, setMainCoin] = useState<COIN>();

  const getWallet = async (chainId: number, storeId: number, network: string) => {
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
        setMainCoin(response.data.main_coin);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async (chainId: number, storeId: number, network: string) => {
    await getWallet(chainId, storeId, network);
  };

  useEffect(() => {
    if (!chainId || !storeId || !network) {
      return;
    }
    init(Number(chainId), Number(storeId), String(network));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, storeId, network]);

  return (
    <Box mt={4}>
      <Container>
        <Typography variant="h4" mt={4} textAlign={'center'}>
          Receive {mainCoin?.name}
        </Typography>

        <Box mt={4} textAlign={'center'}>
          <Typography>Send only {FindChainNamesByChains(Number(chainId))} assets to this address</Typography>
          <Box textAlign={'right'}>
            <WalletConnectButton
              network={network === 'mainnet' ? 1 : 2}
              chainId={Number(chainId)}
              address={address}
              value="0"
            />
          </Box>
          <Paper style={{ padding: 80, marginTop: 20 }}>
            <QRCodeSVG
              value={address}
              width={250}
              height={250}
              imageSettings={{
                src: GetImgSrcByCrypto(mainCoin?.name as COINS),
                width: 30,
                height: 30,
                excavate: true,
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
            {chainId && storeId && network && (
              <TransactionDataGrid
                source="none"
                chain={Number(chainId)}
                storeId={Number(storeId)}
                network={String(network)}
                address={address}
              />
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default WalletsReceive;
