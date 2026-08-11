// import { Box, Button, Container, Icon, Stack, Typography } from '@mui/material';
// import { COIN } from '@/packages/constants/blockchain';
// import { useState } from 'react';
// import { GetBlockchainTxUrlByChainIds } from '@/utils/web3';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { useSnackPresistStore } from '@/lib/store';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
// import Link from 'next/link';
// import FreeCoinSelectChainAndCryptoCard from '@/components/Card/FreeCoinSelectChainAndCryptoCard';

// const FreeCoin = () => {
//   const [page, setPage] = useState<number>(1);
//   const [blockExplorerLink, setBlockExplorerLink] = useState<string>('');

//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const onClickCoin = async (item: COIN, address: string, amount: number) => {
//     if (!item || !address || !amount) {
//       setSnackSeverity('error');
//       setSnackMessage('Incorrect parameters');
//       setSnackOpen(true);
//       return;
//     }

//     try {
//       const checkout_resp: any = await axios.get(Http.checkout_chain_address, {
//         params: {
//           chain_id: item.chainId,
//           address: address,
//           network: 2,
//         },
//       });

//       if (!checkout_resp.result) {
//         setSnackSeverity('error');
//         setSnackMessage('The input address is invalid, please try it again!');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.get(Http.get_free_coin, {
//         params: {
//           amount: amount,
//           chain_id: item.chainId,
//           coin: item.name,
//           address: address,
//         },
//       });

//       if (response.result && response.data && response.data.hash) {
//         setBlockExplorerLink(GetBlockchainTxUrlByChainIds(false, item.chainId, response.data.hash));

//         setPage(2);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Can not get it, please try it again');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   return (
//     <Box mt={4}>
//       <Container>
//         <Typography variant="h4" textAlign={'center'}>
//           Get Testnet Coin
//         </Typography>

//         <Box mt={6}>
//           {page === 1 && (
//             <FreeCoinSelectChainAndCryptoCard network={2} amount={0} currency={''} onClickCoin={onClickCoin} />
//           )}

//           {page === 2 && (
//             <Box textAlign={'center'} mt={10}>
//               <Icon component={CheckCircleIcon} color={'success'} style={{ fontSize: 80 }} />
//               <Typography mt={2} fontWeight={'bold'} fontSize={20}>
//                 Payment Sent
//               </Typography>
//               <Typography mt={2}>Request sending successfully</Typography>
//               <Link href={blockExplorerLink} target="_blank">
//                 <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} mt={2}>
//                   <Icon component={RemoveRedEyeIcon} />
//                   <Typography ml={1}>View on Block Explorer</Typography>
//                 </Stack>
//               </Link>
//               <Box mt={10}>
//                 <Button
//                   size={'large'}
//                   variant={'contained'}
//                   style={{ width: 500 }}
//                   onClick={() => {
//                     setPage(1);
//                   }}
//                 >
//                   Done
//                 </Button>
//               </Box>
//             </Box>
//           )}
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default FreeCoin;

import { useState } from 'react'
import { CheckCircle2, Eye } from 'lucide-react'
import Link from 'next/link'

import { COIN } from '@/packages/constants/blockchain'
import { GetBlockchainTxUrlByChainIds } from '@/utils/web3'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useSnackPresistStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import FreeCoinSelectChainAndCryptoCard from '@/components/Card/FreeCoinSelectChainAndCryptoCard'

const FreeCoin = () => {
  const [page, setPage] = useState<number>(1)
  const [blockExplorerLink, setBlockExplorerLink] = useState<string>('')

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const onClickCoin = async (item: COIN, address: string, amount: number) => {
    if (!item || !address || !amount) {
      showSnack('error', 'Incorrect parameters')
      return
    }

    try {
      const checkout_resp: any = await axios.get(Http.checkout_chain_address, {
        params: {
          chain_id: item.chainId,
          address: address,
          network: 2,
        },
      })

      if (!checkout_resp.result) {
        showSnack('error', 'The input address is invalid, please try it again!')
        return
      }

      const response: any = await axios.get(Http.get_free_coin, {
        params: {
          amount: amount,
          chain_id: item.chainId,
          coin: item.name,
          address: address,
        },
      })

      if (response.result && response.data && response.data.hash) {
        setBlockExplorerLink(GetBlockchainTxUrlByChainIds(false, item.chainId, response.data.hash))
        setPage(2)
      } else {
        showSnack('error', 'Can not get it, please try it again')
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  return (
    <div className="mt-4">
      <div className="mx-auto max-w-screen-lg px-4">
        <h1 className="text-center text-3xl font-bold tracking-tight">Get Testnet Coin</h1>

        <div className="mt-12">
          {page === 1 && (
            <FreeCoinSelectChainAndCryptoCard
              network={2}
              amount={0}
              currency={''}
              onClickCoin={onClickCoin}
            />
          )}

          {page === 2 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <CheckCircle2 className="h-20 w-20 text-green-500" strokeWidth={1.5} />

              <p className="mt-4 text-xl font-bold">Payment Sent</p>
              <p className="mt-2 text-muted-foreground">Request sending successfully</p>

              <Link
                href={blockExplorerLink}
                target="_blank"
                className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
                <span>View on Block Explorer</span>
              </Link>

              <Button
                size="lg"
                className="mt-16 w-full max-w-[500px]"
                onClick={() => {
                  setPage(1)
                }}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FreeCoin
