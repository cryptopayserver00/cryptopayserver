// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Grid,
//   IconButton,
//   ListItemButton,
//   Stack,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import Image from 'next/image';
// import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain';
// import { FindChainNamesByChains } from '@/utils/web3';
// import { COINPAIR, COINTOPAIR } from '@/packages/constants';
// import { ArrowDownward, ArrowUpward, ContentCopy, LocalFlorist, OpenInNew, SwapHoriz } from '@mui/icons-material';
// import { FormatNumberToEnglish, OmitMiddleString } from '@/utils/strings';
// import TradingViewWidget from '@/components/Widget/TradingViewWidget';
// import { useRouter } from 'next/router';
// import { GetImgSrcByChain } from '@/utils/qrcode';

// type CoinType = {
//   coin: string;
//   price: string;
//   number: number;
//   unit: string;
//   balance: string;
//   marketCap: string;
//   twentyFourHVol: string;
//   twentyFourHChange: string;
// };

// type WalletType = {
//   walletId: number;
//   walletName: string;
//   address: string;
//   chainId: CHAINS;
//   coins: CoinType[];
//   totalBalance: number;
//   currency: string;
//   currencySymbol: string;
// };

// const AssetsToken = () => {
//   const router = useRouter();
//   const { chain, coin } = router.query;

//   const [chainId, setChainId] = useState<CHAINS>();
//   const [useCoin, setUseCoin] = useState<COINS>();
//   const [assetWallet, setAssetWallet] = useState<WalletType>();
//   const [blockchain, setBlockchain] = useState<BLOCKCHAIN>();
//   const [coinPair, setCoinPair] = useState<(typeof COINPAIR)[keyof typeof COINPAIR]>(COINPAIR.BTCUSDT);

//   const { getNetwork } = useUserPresistStore((state) => state);
//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const getAssetWallet = async (chain: CHAINS, coin: COINS) => {
//     try {
//       setUseCoin(coin);
//       setChainId(chain);
//       setCoinPair(COINTOPAIR[coin as keyof typeof COINTOPAIR]);

//       const blockchain = BLOCKCHAINNAMES.find(
//         (item: BLOCKCHAIN) =>
//           (getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet) &&
//           item.name === FindChainNamesByChains(chain),
//       );

//       setBlockchain(blockchain);

//       const response: any = await axios.get(Http.find_wallet_balance_by_network, {
//         params: {
//           wallet_id: getWalletId(),
//           store_id: getStoreId(),
//           chain_id: chain,
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });
//       if (response.result) {
//         setAssetWallet(response.data);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     if (router.isReady) {
//       if (chain && coin) {
//         getAssetWallet(Number(chain), coin as COINS);
//       } else {
//         getAssetWallet(CHAINS.BITCOIN, COINS.BTC);
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [router.isReady, chain, coin]);

//   return (
//     <Box>
//       <Container>
//         <Stack direction={'row'} alignItems={'center'}>
//           {assetWallet?.chainId && (
//             <Image src={GetImgSrcByChain(assetWallet?.chainId)} alt="icon" width={40} height={40} />
//           )}
//           {assetWallet?.chainId && <Typography pl={1}>{FindChainNamesByChains(assetWallet?.chainId)}</Typography>}
//         </Stack>

//         <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={4}>
//           <Stack direction={'row'} alignItems={'center'} gap={2}>
//             <Button variant={'contained'} startIcon={<ArrowUpward />} onClick={async () => {}}>
//               Send
//             </Button>
//             <Button variant={'contained'} startIcon={<ArrowDownward />} onClick={async () => {}}>
//               Receive
//             </Button>
//             <Button variant={'contained'} startIcon={<SwapHoriz />} onClick={async () => {}}>
//               Swap
//             </Button>
//             <Button variant={'contained'} startIcon={<LocalFlorist />} onClick={async () => {}}>
//               Stack
//             </Button>
//           </Stack>

//           <Button variant={'outlined'} endIcon={<OpenInNew />} href={String(blockchain?.explorerUrl)} target="_blank">
//             View on block explorer
//           </Button>
//         </Stack>

//         <Box mt={4}>
//           <Card>
//             <CardContent>
//               <Stack direction={'row'} alignItems={'baseline'} justifyContent={'space-between'} pb={2}>
//                 <Typography variant="h4" fontWeight={'bold'}>
//                   {assetWallet?.currencySymbol}
//                   {assetWallet?.coins.find((item) => item.coin === useCoin)?.price}
//                 </Typography>
//                 {blockchain && (
//                   <Image
//                     src={blockchain?.coins.find((item) => item.name === useCoin)?.icon}
//                     width={40}
//                     height={40}
//                     alt="icon"
//                   />
//                 )}
//               </Stack>
//               <Box height={'400px'}>
//                 <TradingViewWidget coinPair={coinPair} />
//               </Box>

//               <Grid container spacing={2} pt={4}>
//                 <Grid item xs={3} md={3} sm={3}>
//                   <Box>
//                     <Typography>Day change (24hr)</Typography>
//                     <Typography
//                       fontWeight={'bold'}
//                       mt={1}
//                       color={
//                         Number(assetWallet?.coins.find((item) => item.coin === useCoin)?.twentyFourHChange) >= 0
//                           ? 'green'
//                           : 'red'
//                       }
//                     >
//                       {parseFloat(
//                         String(assetWallet?.coins.find((item) => item.coin === useCoin)?.twentyFourHChange),
//                       ).toFixed(2)}
//                       %
//                     </Typography>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={3} md={3} sm={3}>
//                   <Box>
//                     <Typography>Market cap</Typography>
//                     <Typography fontWeight={'bold'} mt={1}>
//                       {FormatNumberToEnglish(
//                         Number(assetWallet?.coins.find((item) => item.coin === useCoin)?.marketCap),
//                       )}
//                     </Typography>
//                   </Box>
//                 </Grid>
//                 <Grid item xs={3} md={3} sm={3}>
//                   <Box>
//                     <Typography>Total volume (24hr)</Typography>
//                     <Typography fontWeight={'bold'} mt={1}>
//                       {FormatNumberToEnglish(
//                         Number(assetWallet?.coins.find((item) => item.coin === useCoin)?.twentyFourHVol),
//                       )}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </CardContent>
//           </Card>
//         </Box>

//         <Box mt={4}>
//           <Card>
//             <CardContent>
//               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pb={2}>
//                 <Typography variant="h6" fontWeight={'bold'}>
//                   Holdings
//                 </Typography>
//                 <Typography fontWeight={'bold'}>
//                   {assetWallet?.currencySymbol}
//                   {assetWallet?.totalBalance.toFixed(2)}
//                 </Typography>
//               </Stack>

//               <Stack gap={1}>
//                 {blockchain &&
//                   blockchain.coins.map((item, index) => (
//                     <ListItemButton
//                       key={index}
//                       selected={item.name === useCoin ? true : false}
//                       onClick={() => {
//                         setUseCoin(item.name);
//                         setCoinPair(COINTOPAIR[item.name as keyof typeof COINTOPAIR]);
//                       }}
//                     >
//                       <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
//                         <Stack direction={'row'} alignItems={'center'}>
//                           {item.icon && <Image src={item.icon} width={40} height={40} alt="icon" />}
//                           <Typography px={1}>{OmitMiddleString(String(assetWallet?.address))}</Typography>
//                           <IconButton onClick={async () => {}} edge="end">
//                             <ContentCopy fontSize={'small'} />
//                           </IconButton>
//                         </Stack>
//                         <Box textAlign={'right'}>
//                           <Typography fontWeight={'bold'}>
//                             {assetWallet?.currencySymbol}
//                             {parseFloat(
//                               String(assetWallet?.coins.find((findItem) => findItem.coin === item.name)?.balance),
//                             ).toFixed(2)}
//                           </Typography>
//                           <Typography>
//                             {assetWallet?.coins
//                               .find((fintItem) => fintItem.coin === item.name)
//                               ?.number.toFixed(item.displayDecimals)}{' '}
//                             {item.name}
//                           </Typography>
//                         </Box>
//                       </Stack>
//                     </ListItemButton>
//                   ))}
//               </Stack>
//             </CardContent>
//           </Card>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default AssetsToken;

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ArrowDown, ArrowUp, Copy, ExternalLink, Flower2, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useSnackPresistStore,
  useStorePresistStore,
  useUserPresistStore,
  useWalletPresistStore,
} from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS, COINS } from '@/packages/constants/blockchain'
import { FindChainNamesByChains } from '@/utils/web3'
import { COINPAIR, COINTOPAIR } from '@/packages/constants'
import { FormatNumberToEnglish, OmitMiddleString } from '@/utils/strings'
import TradingViewWidget from '@/components/Widget/TradingViewWidget'
import { GetImgSrcByChain } from '@/utils/qrcode'
import { cn } from '@/lib/utils'

type CoinType = {
  coin: string
  price: string
  number: number
  unit: string
  balance: string
  marketCap: string
  twentyFourHVol: string
  twentyFourHChange: string
}

type WalletType = {
  walletId: number
  walletName: string
  address: string
  chainId: CHAINS
  coins: CoinType[]
  totalBalance: number
  currency: string
  currencySymbol: string
}

const AssetsToken = () => {
  const router = useRouter()
  const { chain, coin } = router.query

  const [chainId, setChainId] = useState<CHAINS>()
  const [useCoin, setUseCoin] = useState<COINS>()
  const [assetWallet, setAssetWallet] = useState<WalletType>()
  const [blockchain, setBlockchain] = useState<BLOCKCHAIN>()
  const [coinPair, setCoinPair] = useState<(typeof COINPAIR)[keyof typeof COINPAIR]>(
    COINPAIR.BTCUSDT
  )

  const { getNetwork } = useUserPresistStore((state) => state)
  const { getWalletId } = useWalletPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)

  const getAssetWallet = async (chain: CHAINS, coin: COINS) => {
    try {
      setUseCoin(coin)
      setChainId(chain)
      setCoinPair(COINTOPAIR[coin as keyof typeof COINTOPAIR])

      const blockchain = BLOCKCHAINNAMES.find(
        (item: BLOCKCHAIN) =>
          (getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet) &&
          item.name === FindChainNamesByChains(chain)
      )

      setBlockchain(blockchain)

      const response: any = await axios.get(Http.find_wallet_balance_by_network, {
        params: {
          wallet_id: getWalletId(),
          store_id: getStoreId(),
          chain_id: chain,
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      })
      if (response.result) {
        setAssetWallet(response.data)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    if (router.isReady) {
      if (chain && coin) {
        getAssetWallet(Number(chain), coin as COINS)
      } else {
        getAssetWallet(CHAINS.BITCOIN, COINS.BTC)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, chain, coin])

  const activeCoin = assetWallet?.coins.find((item) => item.coin === useCoin)
  const change = Number(activeCoin?.twentyFourHChange)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-center">
        {assetWallet?.chainId && (
          <Image src={GetImgSrcByChain(assetWallet?.chainId)} alt="icon" width={40} height={40} />
        )}
        {assetWallet?.chainId && (
          <span className="pl-2 text-lg font-medium">
            {FindChainNamesByChains(assetWallet?.chainId)}
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={async () => {}}>
            <ArrowUp className="mr-2 h-4 w-4" /> Send
          </Button>
          <Button onClick={async () => {}}>
            <ArrowDown className="mr-2 h-4 w-4" /> Receive
          </Button>
          <Button onClick={async () => {}}>
            <Repeat className="mr-2 h-4 w-4" /> Swap
          </Button>
          <Button onClick={async () => {}}>
            <Flower2 className="mr-2 h-4 w-4" /> Stack
          </Button>
        </div>

        <Button variant="outline" asChild>
          <a href={String(blockchain?.explorerUrl)} target="_blank" rel="noreferrer">
            View on block explorer <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-baseline justify-between pb-4">
            <span className="text-3xl font-bold">
              {assetWallet?.currencySymbol}
              {activeCoin?.price}
            </span>
            {blockchain && (
              <Image
                src={blockchain?.coins.find((item) => item.name === useCoin)?.icon}
                width={40}
                height={40}
                alt="icon"
              />
            )}
          </div>
          <div className="h-[400px]">
            <TradingViewWidget coinPair={coinPair} />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Day change (24hr)</p>
              <p
                className={cn('mt-1 font-bold', change >= 0 ? 'text-emerald-500' : 'text-red-500')}
              >
                {parseFloat(String(activeCoin?.twentyFourHChange)).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market cap</p>
              <p className="mt-1 font-bold">
                {FormatNumberToEnglish(Number(activeCoin?.marketCap))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total volume (24hr)</p>
              <p className="mt-1 font-bold">
                {FormatNumberToEnglish(Number(activeCoin?.twentyFourHVol))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-lg font-bold">Holdings</h3>
            <span className="font-bold">
              {assetWallet?.currencySymbol}
              {assetWallet?.totalBalance.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {blockchain &&
              blockchain.coins.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUseCoin(item.name)
                    setCoinPair(COINTOPAIR[item.name as keyof typeof COINTOPAIR])
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors hover:bg-accent',
                    item.name === useCoin && 'bg-accent'
                  )}
                >
                  <div className="flex items-center">
                    {item.icon && <Image src={item.icon} width={40} height={40} alt="icon" />}
                    <span className="px-2 font-mono text-sm">
                      {OmitMiddleString(String(assetWallet?.address))}
                    </span>
                    <span
                      role="button"
                      onClick={async (e) => {
                        e.stopPropagation()
                      }}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {assetWallet?.currencySymbol}
                      {parseFloat(
                        String(
                          assetWallet?.coins.find((findItem) => findItem.coin === item.name)
                            ?.balance
                        )
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {assetWallet?.coins
                        .find((fintItem) => fintItem.coin === item.name)
                        ?.number.toFixed(item.displayDecimals)}{' '}
                      {item.name}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssetsToken
