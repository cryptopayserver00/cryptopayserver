import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
  ListItemButton,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS, COINS } from 'packages/constants/blockchain';
import { FindChainNamesByChains } from 'utils/web3';
import { COINPAIR, COINTOPAIR } from 'packages/constants';
import { ArrowDownward, ArrowUpward, ContentCopy, LocalFlorist, OpenInNew, SwapHoriz } from '@mui/icons-material';
import { FormatNumberToEnglish, OmitMiddleString } from 'utils/strings';
import TradingViewWidget from 'components/Widget/TradingViewWidget';
import { useRouter } from 'next/router';
import { GetImgSrcByChain } from 'utils/qrcode';

type CoinType = {
  coin: string;
  price: string;
  number: number;
  unit: string;
  balance: string;
  marketCap: string;
  twentyFourHVol: string;
  twentyFourHChange: string;
};

type WalletType = {
  walletId: number;
  walletName: string;
  address: string;
  chainId: CHAINS;
  coins: CoinType[];
  totalBalance: number;
  currency: string;
  currencySymbol: string;
};

const AssetsToken = () => {
  const router = useRouter();
  const { chain, coin } = router.query;

  const [chainId, setChainId] = useState<CHAINS>();
  const [useCoin, setUseCoin] = useState<COINS>();
  const [assetWallet, setAssetWallet] = useState<WalletType>();
  const [blockchain, setBlockchain] = useState<BLOCKCHAIN>();
  const [coinPair, setCoinPair] = useState<(typeof COINPAIR)[keyof typeof COINPAIR]>(COINPAIR.BTCUSDT);

  const { getNetwork } = useUserPresistStore((state) => state);
  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const getAssetWallet = async (chain: CHAINS, coin: COINS) => {
    try {
      setUseCoin(coin);
      setChainId(chain);
      setCoinPair(COINTOPAIR[coin as keyof typeof COINTOPAIR]);

      const blockchain = BLOCKCHAINNAMES.find(
        (item: BLOCKCHAIN) =>
          (getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet) &&
          item.name === FindChainNamesByChains(chain),
      );

      setBlockchain(blockchain);

      const response: any = await axios.get(Http.find_wallet_balance_by_network, {
        params: {
          wallet_id: getWalletId(),
          store_id: getStoreId(),
          chain_id: chain,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        setAssetWallet(response.data);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      if (chain && coin) {
        getAssetWallet(Number(chain), coin as COINS);
      } else {
        getAssetWallet(CHAINS.BITCOIN, COINS.BTC);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, chain, coin]);

  return (
    <Box>
      <Container>
        <Stack direction={'row'} alignItems={'center'}>
          {assetWallet?.chainId && (
            <Image src={GetImgSrcByChain(assetWallet?.chainId)} alt="icon" width={40} height={40} />
          )}
          {assetWallet?.chainId && <Typography pl={1}>{FindChainNamesByChains(assetWallet?.chainId)}</Typography>}
        </Stack>

        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={4}>
          <Stack direction={'row'} alignItems={'center'} gap={2}>
            <Button variant={'contained'} startIcon={<ArrowUpward />} onClick={async () => {}}>
              Send
            </Button>
            <Button variant={'contained'} startIcon={<ArrowDownward />} onClick={async () => {}}>
              Receive
            </Button>
            <Button variant={'contained'} startIcon={<SwapHoriz />} onClick={async () => {}}>
              Swap
            </Button>
            <Button variant={'contained'} startIcon={<LocalFlorist />} onClick={async () => {}}>
              Stack
            </Button>
          </Stack>

          <Button variant={'outlined'} endIcon={<OpenInNew />} href={String(blockchain?.explorerUrl)} target="_blank">
            View on block explorer
          </Button>
        </Stack>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'baseline'} justifyContent={'space-between'} pb={2}>
                <Typography variant="h4" fontWeight={'bold'}>
                  {assetWallet?.currencySymbol}
                  {assetWallet?.coins.find((item) => item.coin === useCoin)?.price}
                </Typography>
                {blockchain && (
                  <Image
                    src={blockchain?.coins.find((item) => item.name === useCoin)?.icon}
                    width={40}
                    height={40}
                    alt="icon"
                  />
                )}
              </Stack>
              <Box height={'400px'}>
                <TradingViewWidget coinPair={coinPair} />
              </Box>

              <Grid container spacing={2} pt={4}>
                <Grid item xs={3} md={3} sm={3}>
                  <Box>
                    <Typography>Day change (24hr)</Typography>
                    <Typography
                      fontWeight={'bold'}
                      mt={1}
                      color={
                        Number(assetWallet?.coins.find((item) => item.coin === useCoin)?.twentyFourHChange) >= 0
                          ? 'green'
                          : 'red'
                      }
                    >
                      {parseFloat(
                        String(assetWallet?.coins.find((item) => item.coin === useCoin)?.twentyFourHChange),
                      ).toFixed(2)}
                      %
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3} md={3} sm={3}>
                  <Box>
                    <Typography>Market cap</Typography>
                    <Typography fontWeight={'bold'} mt={1}>
                      {FormatNumberToEnglish(
                        Number(assetWallet?.coins.find((item) => item.coin === useCoin)?.marketCap),
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3} md={3} sm={3}>
                  <Box>
                    <Typography>Total volume (24hr)</Typography>
                    <Typography fontWeight={'bold'} mt={1}>
                      {FormatNumberToEnglish(
                        Number(assetWallet?.coins.find((item) => item.coin === useCoin)?.twentyFourHVol),
                      )}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pb={2}>
                <Typography variant="h6" fontWeight={'bold'}>
                  Holdings
                </Typography>
                <Typography fontWeight={'bold'}>
                  {assetWallet?.currencySymbol}
                  {assetWallet?.totalBalance.toFixed(2)}
                </Typography>
              </Stack>

              <Stack gap={1}>
                {blockchain &&
                  blockchain.coins.map((item, index) => (
                    <ListItemButton
                      key={index}
                      selected={item.name === useCoin ? true : false}
                      onClick={() => {
                        setUseCoin(item.name);
                        setCoinPair(COINTOPAIR[item.name as keyof typeof COINTOPAIR]);
                      }}
                    >
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
                        <Stack direction={'row'} alignItems={'center'}>
                          {item.icon && <Image src={item.icon} width={40} height={40} alt="icon" />}
                          <Typography px={1}>{OmitMiddleString(String(assetWallet?.address))}</Typography>
                          <IconButton onClick={async () => {}} edge="end">
                            <ContentCopy fontSize={'small'} />
                          </IconButton>
                        </Stack>
                        <Box textAlign={'right'}>
                          <Typography fontWeight={'bold'}>
                            {assetWallet?.currencySymbol}
                            {parseFloat(
                              String(assetWallet?.coins.find((findItem) => findItem.coin === item.name)?.balance),
                            ).toFixed(2)}
                          </Typography>
                          <Typography>
                            {assetWallet?.coins
                              .find((fintItem) => fintItem.coin === item.name)
                              ?.number.toFixed(item.displayDecimals)}{' '}
                            {item.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </ListItemButton>
                  ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default AssetsToken;
