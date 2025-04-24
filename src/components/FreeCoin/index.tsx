import { Box, Button, Container, Icon, Stack, Typography } from '@mui/material';
import { COIN } from 'packages/constants/blockchain';
import { useState } from 'react';
import { GetBlockchainTxUrlByChainIds } from 'utils/web3';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { useSnackPresistStore } from 'lib/store';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Link from 'next/link';
import FreeCoinSelectChainAndCryptoCard from 'components/Card/FreeCoinSelectChainAndCryptoCard';

const FreeCoin = () => {
  const [page, setPage] = useState<number>(1);
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const onClickCoin = async (item: COIN, address: string, amount: number) => {
    if (!item || !address || !amount) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect parameters');
      setSnackOpen(true);
      return;
    }

    try {
      const checkout_resp: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: item.chainId,
          address: address,
          network: 2,
        },
      });

      if (!checkout_resp.result) {
        setSnackSeverity('error');
        setSnackMessage('The input address is invalid, please try it again!');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.get(Http.get_free_coin, {
        params: {
          amount: amount,
          chain_id: item.chainId,
          coin: item.name,
          address: address,
        },
      });

      if (response.result && response.data && response.data.hash) {
        setBlockExplorerLink(GetBlockchainTxUrlByChainIds(false, item.chainId, response.data.hash));

        setPage(2);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not get it, please try it again');
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
    <Box mt={4}>
      <Container>
        <Typography variant="h4" textAlign={'center'}>
          Get Testnet Coin
        </Typography>

        <Box mt={6}>
          {page === 1 && (
            <FreeCoinSelectChainAndCryptoCard network={2} amount={0} currency={''} onClickCoin={onClickCoin} />
          )}

          {page === 2 && (
            <Box textAlign={'center'} mt={10}>
              <Icon component={CheckCircleIcon} color={'success'} style={{ fontSize: 80 }} />
              <Typography mt={2} fontWeight={'bold'} fontSize={20}>
                Payment Sent
              </Typography>
              <Typography mt={2}>Request sending successfully</Typography>
              <Link href={blockExplorerLink} target="_blank">
                <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={2}>
                  <Icon component={RemoveRedEyeIcon} />
                  <Typography ml={1}>View on Block Explorer</Typography>
                </Stack>
              </Link>
              <Box mt={10}>
                <Button
                  size={'large'}
                  variant={'contained'}
                  style={{ width: 500 }}
                  onClick={() => {
                    setPage(1);
                  }}
                >
                  Done
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default FreeCoin;
