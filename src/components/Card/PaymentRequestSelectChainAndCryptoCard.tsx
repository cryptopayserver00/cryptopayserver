// import { ExpandMore } from '@mui/icons-material';
// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore } from '@/lib/store';
// import Image from 'next/image';
// import { COINGECKO_IDS } from '@/packages/constants';
// import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import { BigDiv } from '@/utils/number';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import CreateInvoiceDialog from '@/components/Dialog/CreateInvoiceDialog';

// type SelectType = {
//   storeId: number;
//   network: number;
//   amount: number;
//   currency: string;
//   onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
// };

// export default function PaymentRequestSelectChainAndCryptoCard(props: SelectType) {
//   const [expanded, setExpanded] = useState<string | false>(false);
//   const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>([]);
//   const [selectCoinItem, setSelectCoinItem] = useState<COIN>();

//   const [openDialog, setOpenDialog] = useState<boolean>(false);
//   const [rate, setRate] = useState<number>(0);
//   const [cryptoAmount, setCryptoAmount] = useState<string>('');

//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
//     setExpanded(isExpanded ? panel : false);
//   };

//   const getBlockchain = async (storeId: number, network: number) => {
//     try {
//       const response: any = await axios.get(Http.find_wallet_coin_enables, {
//         params: {
//           store_id: storeId,
//           network: network,
//         },
//       });
//       if (response.result) {
//         const respCoins = response.data;

//         const blockchains = BLOCKCHAINNAMES.filter((item: any) =>
//           props.network === 1 ? item.isMainnet : !item.isMainnet,
//         );

//         const newBlockchains: BLOCKCHAIN[] = [];

//         for (const item of blockchains) {
//           const newItem: BLOCKCHAIN = { ...item, coins: [...item.coins] };

//           if (respCoins && respCoins.length > 0) {
//             newItem.coins = newItem.coins.filter((coin: COIN) => {
//               const matchingCoin = respCoins.find(
//                 (respCoin: any) => respCoin.chain_id === coin.chainId && respCoin.name === coin.name,
//               );
//               return !matchingCoin || matchingCoin.enabled !== 2;
//             });

//             if (newItem.coins.length > 0) {
//               newBlockchains.push(newItem);
//             }
//           } else {
//             newBlockchains.push(newItem);
//           }
//         }

//         setBlockchains(newBlockchains);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     getBlockchain(props.storeId, props.network);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [props.storeId, props.network]);

//   const handleClose = () => {
//     setRate(0);
//     setCryptoAmount('');
//     setSelectCoinItem(undefined);

//     setOpenDialog(false);
//   };

//   const updateRate = async (selectName: COIN, currency: string, amount: number) => {
//     try {
//       if (!selectName || !currency || !amount) {
//         return;
//       }

//       const ids = COINGECKO_IDS[selectName.name];
//       const response: any = await axios.get(Http.find_crypto_price, {
//         params: {
//           ids: ids,
//           currency: currency,
//         },
//       });
//       if (response.result) {
//         const rate = response.data[ids][currency.toLowerCase()];
//         setRate(rate);
//         const totalPrice = parseFloat(BigDiv(amount.toString(), rate)).toFixed(selectName.decimals);
//         setCryptoAmount(totalPrice);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   return (
//     <Box>
//       <Card>
//         <CardContent>
//           <Typography variant={'h5'} textAlign={'center'} mt={1}>
//             Select Chain and Crypto
//           </Typography>
//         </CardContent>
//       </Card>
//       <Box mt={2}>
//         {blockchains &&
//           blockchains.length > 0 &&
//           blockchains.map((item, index) => (
//             <Accordion expanded={expanded === item.name} onChange={handleChange(item.name)} key={index}>
//               <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1bh-content">
//                 <Typography sx={{ width: '33%', flexShrink: 0 }} fontWeight={'bold'}>
//                   {item.name.toUpperCase()}
//                 </Typography>
//                 <Typography sx={{ color: 'text.secondary' }}>{item.desc}</Typography>
//               </AccordionSummary>
//               {item.coins &&
//                 item.coins.length > 0 &&
//                 item.coins.map((coinItem: COIN, coinIndex) => (
//                   <AccordionDetails key={coinIndex}>
//                     <Button
//                       fullWidth
//                       onClick={async () => {
//                         setSelectCoinItem(coinItem);
//                         await updateRate(coinItem, props.currency, props.amount);
//                         setOpenDialog(true);
//                       }}
//                     >
//                       <Image src={coinItem.icon} alt="icon" width={50} height={50} />
//                       <Typography ml={2}>{coinItem.name}</Typography>
//                     </Button>
//                   </AccordionDetails>
//                 ))}
//             </Accordion>
//           ))}
//       </Box>

//       <CreateInvoiceDialog
//         selectCoinItem={selectCoinItem as COIN}
//         currency={props.currency}
//         amount={props.amount}
//         cryptoAmount={cryptoAmount}
//         rate={rate}
//         openDialog={openDialog}
//         setOpenDialog={setOpenDialog}
//         handleClose={handleClose}
//         onClickCoin={props.onClickCoin}
//       />
//     </Box>
//   );
// }

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { useSnackPresistStore } from '@/lib/store'
import { COINGECKO_IDS } from '@/packages/constants'
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from '@/packages/constants/blockchain'
import { BigDiv } from '@/utils/number'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import CreateInvoiceDialog from '@/components/Dialog/CreateInvoiceDialog'

type SelectType = {
  storeId: number
  network: number
  amount: number
  currency: string
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>
}

export default function PaymentRequestSelectChainAndCryptoCard(props: SelectType) {
  const [blockchains, setBlockchains] = useState<BLOCKCHAIN[]>([])
  const [selectCoinItem, setSelectCoinItem] = useState<COIN>()
  const [openDialog, setOpenDialog] = useState(false)
  const [rate, setRate] = useState(0)
  const [cryptoAmount, setCryptoAmount] = useState('')

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)

  const getBlockchain = async (storeId: number, network: number) => {
    try {
      const response: any = await axios.get(Http.find_wallet_coin_enables, {
        params: {
          store_id: storeId,
          network: network,
        },
      })

      if (response.result) {
        const respCoins = response.data

        const chains = BLOCKCHAINNAMES.filter((item: any) =>
          props.network === 1 ? item.isMainnet : !item.isMainnet
        )

        const newBlockchains: BLOCKCHAIN[] = []

        for (const item of chains) {
          const newItem: BLOCKCHAIN = { ...item, coins: [...item.coins] }

          if (respCoins && respCoins.length > 0) {
            newItem.coins = newItem.coins.filter((coin: COIN) => {
              const matchingCoin = respCoins.find(
                (respCoin: any) => respCoin.chain_id === coin.chainId && respCoin.name === coin.name
              )
              return !matchingCoin || matchingCoin.enabled !== 2
            })

            if (newItem.coins.length > 0) {
              newBlockchains.push(newItem)
            }
          } else {
            newBlockchains.push(newItem)
          }
        }

        setBlockchains(newBlockchains)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    getBlockchain(props.storeId, props.network)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.storeId, props.network])

  const handleClose = () => {
    setRate(0)
    setCryptoAmount('')
    setSelectCoinItem(undefined)
    setOpenDialog(false)
  }

  const updateRate = async (selectName: COIN, currency: string, amount: number) => {
    try {
      if (!selectName || !currency || !amount) return

      const ids = COINGECKO_IDS[selectName.name]
      const response: any = await axios.get(Http.find_crypto_price, {
        params: {
          ids: ids,
          currency: currency,
        },
      })

      if (response.result) {
        const rate = response.data[ids][currency.toLowerCase()]
        setRate(rate)
        const totalPrice = parseFloat(BigDiv(amount.toString(), rate)).toFixed(selectName.decimals)
        setCryptoAmount(totalPrice)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">Select Chain and Crypto</CardTitle>
        </CardHeader>
      </Card>

      {/* Chain Accordion */}
      <Accordion type="single" collapsible className="w-full space-y-2">
        {blockchains?.map((item) => (
          <AccordionItem key={item.name} value={item.name} className="rounded-lg border px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-4 text-left">
                <span className="font-semibold uppercase tracking-wide min-w-[100px]">
                  {item.name}
                </span>
                <span className="text-sm text-muted-foreground font-normal">{item.desc}</span>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="grid gap-1 pb-2">
                {item.coins?.map((coinItem: COIN) => (
                  <button
                    key={coinItem.name}
                    type="button"
                    onClick={async () => {
                      setSelectCoinItem(coinItem)
                      await updateRate(coinItem, props.currency, props.amount)
                      setOpenDialog(true)
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <Image
                      src={coinItem.icon}
                      alt={coinItem.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium">{coinItem.name}</span>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <CreateInvoiceDialog
        selectCoinItem={selectCoinItem as COIN}
        currency={props.currency}
        amount={props.amount}
        cryptoAmount={cryptoAmount}
        rate={rate}
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        handleClose={handleClose}
        onClickCoin={props.onClickCoin}
      />
    </div>
  )
}
