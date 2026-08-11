// import { ChevronRight, ExpandMore } from '@mui/icons-material';
// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Alert,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Checkbox,
//   Container,
//   FormControlLabel,
//   FormGroup,
//   IconButton,
//   Stack,
//   Switch,
//   TextField,
//   Typography,
// } from '@mui/material';
// import SendLightningAssetsDialog from '@/components/Dialog/SendLightningAssetsDialog';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import lightningPayReq from 'bolt11';
// import { BtcToSatoshis } from '@/utils/number';

// type RowType = {
//   id: number;
//   balance: string;
//   text: string;
//   kind: string;
//   server: string;
//   accessToken: string;
//   refreshToken: string;
//   enabled: boolean;
//   showAmountSatoshis: boolean;
//   showHopHint: boolean;
//   showUnifyUrlAndQrcode: boolean;
//   showLnurl: boolean;
//   showLnurlClassicMode: boolean;
//   showAllowPayeePassComment: boolean;
// };

// const Lightning = () => {
//   const [rows, setRows] = useState<RowType[]>([]);
//   const [currentRow, setCurrentRow] = useState<RowType>({
//     id: 0,
//     balance: '',
//     text: '',
//     kind: '',
//     server: '',
//     accessToken: '',
//     refreshToken: '',
//     enabled: false,
//     showAmountSatoshis: false,
//     showHopHint: false,
//     showUnifyUrlAndQrcode: false,
//     showLnurl: false,
//     showLnurlClassicMode: false,
//     showAllowPayeePassComment: false,
//   });
//   const [page, setPage] = useState<number>(1);
//   const [text, setText] = useState<string>('');

//   const [openDialog, setOpenDialog] = useState<boolean>(false);

//   const { getNetwork, getUserId } = useUserPresistStore((state) => state);
//   const { getStoreId } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const onClickTestConnection = async () => {
//     try {
//       if (!text || text === '') return;

//       const response: any = await axios.get(Http.test_connection, {
//         params: {
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//           store_id: getStoreId(),
//           text: text,
//         },
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Test successfully');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Test failed, please try again');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickSave = async () => {
//     try {
//       if (!text || text === '') return;

//       const response: any = await axios.post(Http.create_lightning_network, {
//         user_id: getUserId(),
//         network: getNetwork() === 'mainnet' ? 1 : 2,
//         store_id: getStoreId(),
//         text: text,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Save successful!');
//         setSnackOpen(true);

//         await init();
//         setText('');
//         setPage(2);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Save failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const onClickSaveSetting = async () => {
//     try {
//       if (!currentRow || !currentRow.id) {
//         return;
//       }

//       const response: any = await axios.put(Http.update_lightning_network_setting_by_id, {
//         id: currentRow.id,
//         enabled: currentRow.enabled ? 1 : 2,
//         show_amount_satoshis: currentRow.showAmountSatoshis ? 1 : 2,
//         show_hop_hint: currentRow.showHopHint ? 1 : 2,
//         show_unify_url_and_qrcode: currentRow.showUnifyUrlAndQrcode ? 1 : 2,
//         show_lnurl: currentRow.showLnurl ? 1 : 2,
//         show_lnurl_classic_mode: currentRow.showLnurlClassicMode ? 1 : 2,
//         show_allow_payee_pass_comment: currentRow.showAllowPayeePassComment ? 1 : 2,
//       });

//       if (response.result) {
//         await init();
//         setPage(2);

//         setSnackSeverity('success');
//         setSnackMessage('Update successful!');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Update failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   async function init() {
//     try {
//       const response: any = await axios.get(Http.find_lightning_network, {
//         params: {
//           user_id: getUserId(),
//           store_id: getStoreId(),
//           network: getNetwork() === 'mainnet' ? 1 : 2,
//         },
//       });

//       if (response.result) {
//         if (response.data.length > 0) {
//           let rt: RowType[] = [];
//           response.data.forEach(async (item: any, index: number) => {
//             rt.push({
//               id: item.id,
//               balance: item.balance,
//               text: item.text,
//               kind: item.kind,
//               server: item.server,
//               accessToken: item.access_token,
//               refreshToken: item.refresh_token,
//               enabled: item.enabled === 1 ? true : false,
//               showAmountSatoshis: item.show_amount_satoshis === 1 ? true : false,
//               showHopHint: item.show_hop_hint === 1 ? true : false,
//               showUnifyUrlAndQrcode: item.show_unify_url_and_qrcode === 1 ? true : false,
//               showLnurl: item.show_lnurl === 1 ? true : false,
//               showLnurlClassicMode: item.show_lnurl_classic_mode === 1 ? true : false,
//               showAllowPayeePassComment: item.show_allow_payee_pass_comment === 1 ? true : false,
//             });
//           });
//           setRows(rt);
//           setCurrentRow(rt[0]);
//           setPage(2);
//         } else {
//           setRows([]);
//         }
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   }

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const onClickSendLightningAssets = async (invoice: string) => {
//     try {
//       if (!currentRow || !currentRow.id) {
//         return;
//       }

//       if (!invoice || invoice === '') return;

//       const decodeInvoice = lightningPayReq.decode(invoice);
//       if (Number(decodeInvoice.satoshis) >= BtcToSatoshis(Number(currentRow?.balance))) {
//         setSnackSeverity('error');
//         setSnackMessage('Insufficient balance, please try again');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.post(Http.send_lightning_network_transaction, {
//         lightning_id: currentRow.id,
//         invoice: invoice,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Send successful!');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Send failed!');
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
//     <Box>
//       <Container>
//         <Box pt={10}>
//           {page === 1 && (
//             <Box>
//               <Typography variant="h4" fontWeight={'bold'} textAlign={'center'}>
//                 Connect to a Lightning node
//               </Typography>
//               <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} gap={2} mt={5}>
//                 <Button variant={'contained'} disabled>
//                   Use internal node
//                 </Button>
//                 <Button variant={'contained'}>Use custom node</Button>
//               </Stack>

//               <Box mt={5}>
//                 <Typography>Connection configuration for your custom Lightning node:</Typography>
//                 <Stack direction={'row'} alignItems={'center'} gap={2} mt={1}>
//                   <TextField
//                     fullWidth
//                     hiddenLabel
//                     size="small"
//                     placeholder="type=...;server=...;"
//                     value={text}
//                     onChange={(e: any) => {
//                       setText(e.target.value);
//                     }}
//                   />
//                   <Button variant={'outlined'} style={{ width: 250 }} size={'large'} onClick={onClickTestConnection}>
//                     Test connection
//                   </Button>
//                 </Stack>
//               </Box>

//               <Box mt={5}>
//                 <Typography>CryptoPay Server currently supports:</Typography>
//               </Box>

//               <Box mt={3}>
//                 <Accordion>
//                   <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
//                     <Typography fontWeight={'bold'} pr={1}>
//                       <Link href={'https://github.com/ElementsProject/lightning'} target="_blank">
//                         Core Lightning
//                       </Link>
//                     </Typography>
//                     via HTTPS
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Stack gap={1}>
//                       <Alert icon={false}>
//                         type=clightning;server=https://cln-regtest-demo.blockstream.com/;rune=YuJqHOZLvCCiL0bY3mT75...
//                       </Alert>
//                     </Stack>
//                   </AccordionDetails>
//                 </Accordion>
//                 <Accordion>
//                   <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel2-content">
//                     <Typography fontWeight={'bold'} pr={1}>
//                       <Link href={'https://github.com/ElementsProject/lightning-charge'} target="_blank">
//                         Lightning Charge
//                       </Link>
//                     </Typography>
//                     via HTTPS (coming soon)
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Alert icon={false}>type=charge;server=https://charge:8080/;api-token=myapitoken...</Alert>
//                   </AccordionDetails>
//                 </Accordion>
//                 <Accordion>
//                   <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel3-content">
//                     <Typography fontWeight={'bold'} pr={1}>
//                       <Link href={'https://github.com/ACINQ/eclair'} target="_blank">
//                         Eclair
//                       </Link>
//                     </Typography>
//                     via HTTPS (coming soon)
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Stack gap={1}>
//                       <Alert icon={false}>type=eclair;server=https://eclair:8080/;password=eclairpassword...</Alert>
//                       <Typography>
//                         Note that bitcoin-host and bitcoin-auth are optional, only useful if you want to use
//                         GetDepositAddress on Eclair:
//                       </Typography>
//                       <Alert icon={false}>
//                         type=eclair;server=https://eclair:8080/;password=eclairpassword;bitcoin-host=bitcoin.host;bitcoin-auth=btcpass
//                       </Alert>
//                     </Stack>
//                   </AccordionDetails>
//                 </Accordion>
//                 <Accordion>
//                   <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel3-content">
//                     <Typography fontWeight={'bold'} pr={1}>
//                       <Link href={'https://docs.lightning.engineering/'} target="_blank">
//                         LND
//                       </Link>
//                     </Typography>
//                     via the REST API
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Stack gap={1}>
//                       <Alert icon={false}>type=lnd;server=https://mylnd:8080/;macaroon=abef263adfe...</Alert>
//                       <Alert icon={false}>
//                         type=lnd;server=https://mylnd:8080/;macaroon=abef263adfe...;certthumbprint=abef263adfe...
//                       </Alert>
//                       <Typography>
//                         For the macaroon options you need to provide a macaroon with the invoices:write permission (e.g.
//                         invoice.macaroon. If you want to display the node connection details, it also needs the
//                         info:read permission. The path to the LND data directory may vary, the following examples assume
//                         /root/.lnd.
//                       </Typography>
//                       <Typography>
//                         The macaroon parameter expects the HEX value, it can be obtained using this command:
//                       </Typography>
//                       <Alert icon={false}>
//                         xxd -p -c 256 /root/.lnd/data/chain/bitcoin/mainnet/invoice.macaroon | tr -d &apos;\n&apos;
//                       </Alert>
//                       <Typography>
//                         You can omit certthumbprint if the certificate is trusted by your machine. The certthumbprint
//                         can be obtained using this command:
//                       </Typography>
//                       <Alert icon={false}>
//                         openssl x509 -noout -fingerprint -sha256 -in /root/.lnd/tls.cert | sed -e &apos;s/.*=//;s/://g&apos;
//                       </Alert>
//                       <Typography>
//                         If your LND REST server is using HTTP or HTTPS with an untrusted certificate, you can set
//                         allowinsecure=true as a fallback.
//                       </Typography>
//                     </Stack>
//                   </AccordionDetails>
//                 </Accordion>
//                 <Accordion>
//                   <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel3-content">
//                     <Typography fontWeight={'bold'} pr={1}>
//                       <Link href={'https://bluewallet.io/lndhub/'} target="_blank">
//                         LNDhub
//                       </Link>
//                     </Typography>
//                     via the REST API
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Stack gap={1}>
//                       <Alert icon={false}>type=lndhub;server=https://login:password@lndhub.io</Alert>
//                       <Typography>
//                         The credentials and server address are shown as a lndhub:// URL on the &quot;Export/Backup&quot; screen in
//                         BlueWallet.
//                       </Typography>
//                       <Typography>
//                         You can also use this LNDhub-URL as the connection string and CryptoPay Server converts it into
//                         the expected type=lndhub connection string format:
//                       </Typography>
//                       <Alert icon={false}>lndhub://login:password@https://lndhub.io</Alert>
//                     </Stack>
//                   </AccordionDetails>
//                 </Accordion>
//               </Box>

//               <Box mt={5}>
//                 <Button variant={'contained'} size={'large'} color="success" onClick={onClickSave}>
//                   Save
//                 </Button>
//               </Box>
//             </Box>
//           )}

//           {page === 2 && (
//             <Box>
//               <Typography variant="h4" fontWeight={'bold'}>
//                 BTC Lightning
//               </Typography>
//               <Stack gap={2} mt={4}>
//                 {rows &&
//                   rows.length > 0 &&
//                   rows.map((item, index) => (
//                     <Card key={index}>
//                       <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} p={2}>
//                         <Typography>Custom Node</Typography>
//                         <Typography fontWeight={'bold'}>{item.kind}</Typography>
//                         <Typography fontWeight={'bold'}>{item.balance}</Typography>
//                         {item.enabled ? (
//                           <Typography color={'green'}>ENABLED</Typography>
//                         ) : (
//                           <Typography color={'red'}>DISABLED</Typography>
//                         )}
//                         <IconButton
//                           onClick={() => {
//                             setCurrentRow(item);
//                             setPage(3);
//                           }}
//                         >
//                           <ChevronRight />
//                         </IconButton>
//                       </Stack>
//                     </Card>
//                   ))}
//               </Stack>
//             </Box>
//           )}

//           {page === 3 && (
//             <Box>
//               <Typography variant="h4" fontWeight={'bold'}>
//                 BTC Lightning Settings
//               </Typography>
//               <Stack mt={4}>
//                 <Stack direction={'row'} alignItems={'center'} gap={4}>
//                   <Typography>Custom Node</Typography>
//                   <Typography fontWeight={'bold'}>{currentRow?.kind}</Typography>
//                   <Button variant={'contained'}>Public Node Info</Button>
//                   <Button
//                     variant={'contained'}
//                     color={'secondary'}
//                     onClick={() => {
//                       setText(currentRow.text);
//                       setPage(1);
//                     }}
//                   >
//                     Change connection
//                   </Button>
//                   <Button
//                     variant={'contained'}
//                     color="success"
//                     onClick={() => {
//                       setOpenDialog(true);
//                     }}
//                   >
//                     Send Lightning Assets
//                   </Button>
//                 </Stack>

//                 <Stack direction={'row'} gap={1} mt={2}>
//                   <Typography>Balance:</Typography>
//                   <Typography fontWeight={'bold'}>{currentRow.balance}</Typography>
//                 </Stack>

//                 <Stack direction={'row'} alignItems={'center'} gap={1} mt={2}>
//                   <Switch
//                     checked={currentRow.enabled}
//                     onChange={() => {
//                       setCurrentRow({
//                         ...currentRow,
//                         enabled: !currentRow.enabled,
//                       });
//                     }}
//                   />

//                   {currentRow.enabled ? (
//                     <Typography color={'green'}>ENABLED</Typography>
//                   ) : (
//                     <Typography color={'red'}>DISABLED</Typography>
//                   )}
//                 </Stack>
//               </Stack>

//               <Typography variant="h6" fontWeight={'bold'} mt={4}>
//                 Payment
//               </Typography>
//               <Box mt={2}>
//                 <FormGroup>
//                   <FormControlLabel
//                     control={<Checkbox checked={currentRow.showAmountSatoshis} />}
//                     label="Display Lightning payment amounts in Satoshis"
//                     onChange={() => {
//                       setCurrentRow({
//                         ...currentRow,
//                         showAmountSatoshis: !currentRow.showAmountSatoshis,
//                       });
//                     }}
//                   />
//                   <FormControlLabel
//                     control={<Checkbox checked={currentRow.showHopHint} />}
//                     label="Add hop hints for private channels to the Lightning invoice"
//                     onChange={() => {
//                       setCurrentRow({
//                         ...currentRow,
//                         showHopHint: !currentRow.showHopHint,
//                       });
//                     }}
//                   />
//                   <FormControlLabel
//                     control={<Checkbox checked={currentRow.showUnifyUrlAndQrcode} />}
//                     label="Unify on-chain and lightning payment URL/QR code"
//                     onChange={() => {
//                       setCurrentRow({
//                         ...currentRow,
//                         showUnifyUrlAndQrcode: !currentRow.showUnifyUrlAndQrcode,
//                       });
//                     }}
//                   />
//                 </FormGroup>
//               </Box>

//               <Typography variant="h6" fontWeight={'bold'} mt={4}>
//                 LNURL
//               </Typography>
//               <Box mt={2}>
//                 <FormGroup>
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={currentRow.showLnurl}
//                         onChange={() => {
//                           setCurrentRow({
//                             ...currentRow,
//                             showLnurl: !currentRow.showLnurl,
//                           });
//                         }}
//                       />
//                     }
//                     label="Enable LNURL"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={currentRow.showLnurlClassicMode}
//                         onChange={() => {
//                           setCurrentRow({
//                             ...currentRow,
//                             showLnurlClassicMode: !currentRow.showLnurlClassicMode,
//                           });
//                         }}
//                       />
//                     }
//                     label="LNURL Classic Mode"
//                   />
//                   <FormControlLabel
//                     control={
//                       <Switch
//                         checked={currentRow.showAllowPayeePassComment}
//                         onChange={() => {
//                           setCurrentRow({
//                             ...currentRow,
//                             showAllowPayeePassComment: !currentRow.showAllowPayeePassComment,
//                           });
//                         }}
//                       />
//                     }
//                     label="Allow payee to pass a comment"
//                   />
//                 </FormGroup>
//               </Box>

//               <Stack gap={2} mt={5} direction={'row'}>
//                 <Button variant={'contained'} size={'large'} color="success" onClick={onClickSaveSetting}>
//                   Save
//                 </Button>
//                 <Button
//                   variant={'contained'}
//                   color={'primary'}
//                   size={'large'}
//                   onClick={() => {
//                     setPage(2);
//                   }}
//                 >
//                   Back
//                 </Button>
//               </Stack>
//             </Box>
//           )}
//         </Box>

//         <SendLightningAssetsDialog
//           openDialog={openDialog}
//           setOpenDialog={setOpenDialog}
//           onClickSendLightningAssets={onClickSendLightningAssets}
//         />
//       </Container>
//     </Box>
//   );
// };

// export default Lightning;

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import SendLightningAssetsDialog from '@/components/Dialog/SendLightningAssetsDialog'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import lightningPayReq from 'bolt11'
import { BtcToSatoshis } from '@/utils/number'

type RowType = {
  id: number
  balance: string
  text: string
  kind: string
  server: string
  accessToken: string
  refreshToken: string
  enabled: boolean
  showAmountSatoshis: boolean
  showHopHint: boolean
  showUnifyUrlAndQrcode: boolean
  showLnurl: boolean
  showLnurlClassicMode: boolean
  showAllowPayeePassComment: boolean
}

const CODE_SNIPPETS: Record<string, string> = {
  clightning:
    'type=clightning;server=https://cln-regtest-demo.blockstream.com/;rune=YuJqHOZLvCCiL0bY3mT75...',
  charge: 'type=charge;server=https://charge:8080/;api-token=myapitoken...',
  eclair1: 'type=eclair;server=https://eclair:8080/;password=eclairpassword...',
  eclair2:
    'type=eclair;server=https://eclair:8080/;password=eclairpassword;bitcoin-host=bitcoin.host;bitcoin-auth=btcpass',
  lnd1: 'type=lnd;server=https://mylnd:8080/;macaroon=abef263adfe...',
  lnd2: 'type=lnd;server=https://mylnd:8080/;macaroon=abef263adfe...;certthumbprint=abef263adfe...',
  lndMacaroon: "xxd -p -c 256 /root/.lnd/data/chain/bitcoin/mainnet/invoice.macaroon | tr -d '\\n'",
  lndThumbprint:
    "openssl x509 -noout -fingerprint -sha256 -in /root/.lnd/tls.cert | sed -e 's/.*=//;s/://g'",
  lndhub: 'type=lndhub;server=https://login:password@lndhub.io',
  lndhubUrl: 'lndhub://login:password@https://lndhub.io',
}

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-md border bg-muted px-3 py-2 text-xs">{children}</pre>
)

const Lightning = () => {
  const [rows, setRows] = useState<RowType[]>([])
  const [currentRow, setCurrentRow] = useState<RowType>({
    id: 0,
    balance: '',
    text: '',
    kind: '',
    server: '',
    accessToken: '',
    refreshToken: '',
    enabled: false,
    showAmountSatoshis: false,
    showHopHint: false,
    showUnifyUrlAndQrcode: false,
    showLnurl: false,
    showLnurlClassicMode: false,
    showAllowPayeePassComment: false,
  })
  const [page, setPage] = useState<number>(1)
  const [text, setText] = useState<string>('')
  const [openDialog, setOpenDialog] = useState<boolean>(false)

  const { getNetwork, getUserId } = useUserPresistStore((state) => state)
  const { getStoreId } = useStorePresistStore((state) => state)
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

  const onClickTestConnection = async () => {
    try {
      if (!text) return

      const response: any = await axios.get(Http.test_connection, {
        params: { network: getNetwork() === 'mainnet' ? 1 : 2, store_id: getStoreId(), text },
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Test successfully')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Test failed, please try again')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickSave = async () => {
    try {
      if (!text) return

      const response: any = await axios.post(Http.create_lightning_network, {
        user_id: getUserId(),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        store_id: getStoreId(),
        text,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Save successful!')
        setSnackOpen(true)
        await init()
        setText('')
        setPage(2)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Save failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  const onClickSaveSetting = async () => {
    try {
      if (!currentRow?.id) return

      const response: any = await axios.put(Http.update_lightning_network_setting_by_id, {
        id: currentRow.id,
        enabled: currentRow.enabled ? 1 : 2,
        show_amount_satoshis: currentRow.showAmountSatoshis ? 1 : 2,
        show_hop_hint: currentRow.showHopHint ? 1 : 2,
        show_unify_url_and_qrcode: currentRow.showUnifyUrlAndQrcode ? 1 : 2,
        show_lnurl: currentRow.showLnurl ? 1 : 2,
        show_lnurl_classic_mode: currentRow.showLnurlClassicMode ? 1 : 2,
        show_allow_payee_pass_comment: currentRow.showAllowPayeePassComment ? 1 : 2,
      })

      if (response.result) {
        await init()
        setPage(2)
        setSnackSeverity('success')
        setSnackMessage('Update successful!')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  async function init() {
    try {
      const response: any = await axios.get(Http.find_lightning_network, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      })

      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = []
          response.data.forEach((item: any) => {
            rt.push({
              id: item.id,
              balance: item.balance,
              text: item.text,
              kind: item.kind,
              server: item.server,
              accessToken: item.access_token,
              refreshToken: item.refresh_token,
              enabled: item.enabled === 1,
              showAmountSatoshis: item.show_amount_satoshis === 1,
              showHopHint: item.show_hop_hint === 1,
              showUnifyUrlAndQrcode: item.show_unify_url_and_qrcode === 1,
              showLnurl: item.show_lnurl === 1,
              showLnurlClassicMode: item.show_lnurl_classic_mode === 1,
              showAllowPayeePassComment: item.show_allow_payee_pass_comment === 1,
            })
          })
          setRows(rt)
          setCurrentRow(rt[0])
          setPage(2)
        } else {
          setRows([])
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onClickSendLightningAssets = async (invoice: string) => {
    try {
      if (!currentRow?.id || !invoice) return

      const decodeInvoice = lightningPayReq.decode(invoice)
      if (Number(decodeInvoice.satoshis) >= BtcToSatoshis(Number(currentRow?.balance))) {
        setSnackSeverity('error')
        setSnackMessage('Insufficient balance, please try again')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.post(Http.send_lightning_network_transaction, {
        lightning_id: currentRow.id,
        invoice,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Send successful!')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Send failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      {page === 1 && (
        <div>
          <h1 className="text-center text-3xl font-bold">Connect to a Lightning node</h1>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button disabled>Use internal node</Button>
            <Button>Use custom node</Button>
          </div>

          <div className="mt-8">
            <Label>Connection configuration for your custom Lightning node:</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                placeholder="type=...;server=...;"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button
                variant="outline"
                className="w-[220px]"
                size="lg"
                onClick={onClickTestConnection}
              >
                Test connection
              </Button>
            </div>
          </div>

          <p className="mt-8 font-medium">CryptoPay Server currently supports:</p>

          <Accordion type="single" collapsible className="mt-3">
            <AccordionItem value="clightning">
              <AccordionTrigger>
                <span className="font-bold">
                  <Link
                    href="https://github.com/ElementsProject/lightning"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Core Lightning
                  </Link>
                </span>
                <span className="ml-2 font-normal text-muted-foreground">via HTTPS</span>
              </AccordionTrigger>
              <AccordionContent>
                <CodeBlock>{CODE_SNIPPETS.clightning}</CodeBlock>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="charge">
              <AccordionTrigger>
                <span className="font-bold">
                  <Link
                    href="https://github.com/ElementsProject/lightning-charge"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Lightning Charge
                  </Link>
                </span>
                <span className="ml-2 font-normal text-muted-foreground">
                  via HTTPS (coming soon)
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CodeBlock>{CODE_SNIPPETS.charge}</CodeBlock>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="eclair">
              <AccordionTrigger>
                <span className="font-bold">
                  <Link
                    href="https://github.com/ACINQ/eclair"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    Eclair
                  </Link>
                </span>
                <span className="ml-2 font-normal text-muted-foreground">
                  via HTTPS (coming soon)
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <CodeBlock>{CODE_SNIPPETS.eclair1}</CodeBlock>
                <p className="text-sm text-muted-foreground">
                  Note that bitcoin-host and bitcoin-auth are optional, only useful if you want to
                  use GetDepositAddress on Eclair:
                </p>
                <CodeBlock>{CODE_SNIPPETS.eclair2}</CodeBlock>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lnd">
              <AccordionTrigger>
                <span className="font-bold">
                  <Link
                    href="https://docs.lightning.engineering/"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    LND
                  </Link>
                </span>
                <span className="ml-2 font-normal text-muted-foreground">via the REST API</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <CodeBlock>{CODE_SNIPPETS.lnd1}</CodeBlock>
                <CodeBlock>{CODE_SNIPPETS.lnd2}</CodeBlock>
                <p className="text-sm text-muted-foreground">
                  For the macaroon options you need to provide a macaroon with the invoices:write
                  permission (e.g. invoice.macaroon). If you want to display the node connection
                  details, it also needs the info:read permission. The path to the LND data
                  directory may vary, the following examples assume /root/.lnd.
                </p>
                <p className="text-sm text-muted-foreground">
                  The macaroon parameter expects the HEX value, it can be obtained using this
                  command:
                </p>
                <CodeBlock>{CODE_SNIPPETS.lndMacaroon}</CodeBlock>
                <p className="text-sm text-muted-foreground">
                  You can omit certthumbprint if the certificate is trusted by your machine. The
                  certthumbprint can be obtained using this command:
                </p>
                <CodeBlock>{CODE_SNIPPETS.lndThumbprint}</CodeBlock>
                <p className="text-sm text-muted-foreground">
                  If your LND REST server is using HTTP or HTTPS with an untrusted certificate, you
                  can set allowinsecure=true as a fallback.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lndhub">
              <AccordionTrigger>
                <span className="font-bold">
                  <Link
                    href="https://bluewallet.io/lndhub/"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    LNDhub
                  </Link>
                </span>
                <span className="ml-2 font-normal text-muted-foreground">via the REST API</span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <CodeBlock>{CODE_SNIPPETS.lndhub}</CodeBlock>
                <p className="text-sm text-muted-foreground">
                  The credentials and server address are shown as a lndhub:// URL on the
                  &quot;Export/Backup&quot; screen in BlueWallet.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can also use this LNDhub-URL as the connection string and CryptoPay Server
                  converts it into the expected type=lndhub connection string format:
                </p>
                <CodeBlock>{CODE_SNIPPETS.lndhubUrl}</CodeBlock>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            size="lg"
            className="mt-8 bg-emerald-600 hover:bg-emerald-500"
            onClick={onClickSave}
          >
            Save
          </Button>
        </div>
      )}

      {page === 2 && (
        <div>
          <h1 className="text-3xl font-bold">BTC Lightning</h1>
          <div className="mt-6 flex flex-col gap-3">
            {rows.map((item, index) => (
              <Card key={index} className="flex items-center justify-between gap-4 p-4">
                <span>Custom Node</span>
                <span className="font-bold">{item.kind}</span>
                <span className="font-bold">{item.balance}</span>
                <span className={item.enabled ? 'text-emerald-500' : 'text-red-500'}>
                  {item.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setCurrentRow(item)
                    setPage(3)
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {page === 3 && (
        <div>
          <h1 className="text-3xl font-bold">BTC Lightning Settings</h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span>Custom Node</span>
            <span className="font-bold">{currentRow?.kind}</span>
            <Button>Public Node Info</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setText(currentRow.text)
                setPage(1)
              }}
            >
              Change connection
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500"
              onClick={() => setOpenDialog(true)}
            >
              Send Lightning Assets
            </Button>
          </div>

          <p className="mt-3">
            Balance: <span className="font-bold">{currentRow.balance}</span>
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Switch
              checked={currentRow.enabled}
              onCheckedChange={() => setCurrentRow({ ...currentRow, enabled: !currentRow.enabled })}
            />
            <span className={currentRow.enabled ? 'text-emerald-500' : 'text-red-500'}>
              {currentRow.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
          </div>

          <h2 className="mt-8 text-lg font-bold">Payment</h2>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={currentRow.showAmountSatoshis}
                onCheckedChange={() =>
                  setCurrentRow({
                    ...currentRow,
                    showAmountSatoshis: !currentRow.showAmountSatoshis,
                  })
                }
              />
              Display Lightning payment amounts in Satoshis
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={currentRow.showHopHint}
                onCheckedChange={() =>
                  setCurrentRow({ ...currentRow, showHopHint: !currentRow.showHopHint })
                }
              />
              Add hop hints for private channels to the Lightning invoice
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={currentRow.showUnifyUrlAndQrcode}
                onCheckedChange={() =>
                  setCurrentRow({
                    ...currentRow,
                    showUnifyUrlAndQrcode: !currentRow.showUnifyUrlAndQrcode,
                  })
                }
              />
              Unify on-chain and lightning payment URL/QR code
            </label>
          </div>

          <h2 className="mt-8 text-lg font-bold">LNURL</h2>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2">
              <Switch
                checked={currentRow.showLnurl}
                onCheckedChange={() =>
                  setCurrentRow({ ...currentRow, showLnurl: !currentRow.showLnurl })
                }
              />
              Enable LNURL
            </label>
            <label className="flex items-center gap-2">
              <Switch
                checked={currentRow.showLnurlClassicMode}
                onCheckedChange={() =>
                  setCurrentRow({
                    ...currentRow,
                    showLnurlClassicMode: !currentRow.showLnurlClassicMode,
                  })
                }
              />
              LNURL Classic Mode
            </label>
            <label className="flex items-center gap-2">
              <Switch
                checked={currentRow.showAllowPayeePassComment}
                onCheckedChange={() =>
                  setCurrentRow({
                    ...currentRow,
                    showAllowPayeePassComment: !currentRow.showAllowPayeePassComment,
                  })
                }
              />
              Allow payee to pass a comment
            </label>
          </div>

          <div className="mt-8 flex gap-2">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500"
              onClick={onClickSaveSetting}
            >
              Save
            </Button>
            <Button size="lg" onClick={() => setPage(2)}>
              Back
            </Button>
          </div>
        </div>
      )}

      <SendLightningAssetsDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        onClickSendLightningAssets={onClickSendLightningAssets}
      />
    </div>
  )
}

export default Lightning
