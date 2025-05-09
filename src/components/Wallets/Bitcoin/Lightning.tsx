import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import Link from 'next/link';
import { useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Lightning = () => {
  const [text, setText] = useState<string>('');

  const { getNetwork, getUserId } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const onClickTestConnection = async () => {
    try {
      if (!text || text === '') return;

      const response: any = await axios.get(Http.test_connection, {
        params: {
          network: getNetwork() === 'mainnet' ? 1 : 2,
          store_id: getStoreId(),
          text: text,
        },
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Test successfully');
        setSnackOpen(true);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Test failed, please try again');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickSave = async () => {
    try {
      if (!text || text === '') return;

      const response: any = await axios.post(Http.create_lightning_network, {
        user_id: getUserId(),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        store_id: getStoreId(),
        text: text,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Save successful!');
        setSnackOpen(true);

        setText('');
      } else {
        setSnackSeverity('error');
        setSnackMessage('Save failed!');
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
    <Box>
      <Container>
        <Box pt={10}>
          <Typography variant="h4" fontWeight={'bold'} textAlign={'center'}>
            Connect to a Lightning node
          </Typography>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'center'} gap={2} mt={5}>
            <Button variant={'contained'} disabled>
              Use internal node
            </Button>
            <Button variant={'contained'}>Use custom node</Button>
          </Stack>

          <Box mt={5}>
            <Typography>Connection configuration for your custom Lightning node:</Typography>
            <Stack direction={'row'} alignItems={'center'} gap={2} mt={1}>
              <TextField
                fullWidth
                hiddenLabel
                defaultValue=""
                size="small"
                placeholder="type=...;server=...;"
                value={text}
                onChange={(e: any) => {
                  setText(e.target.value);
                }}
              />
              <Button variant={'outlined'} style={{ width: 250 }} size={'large'} onClick={onClickTestConnection}>
                Test connection
              </Button>
            </Stack>
          </Box>

          <Box mt={5}>
            <Typography>CryptoPay Server currently supports:</Typography>
          </Box>

          <Box mt={3}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
                <Typography fontWeight={'bold'} pr={1}>
                  <Link href={'https://github.com/ElementsProject/lightning'} target="_blank">
                    Core Lightning
                  </Link>
                </Typography>
                via TCP or unix domain socket connection
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1}>
                  <Alert icon={false}>type=clightning;server=unix://root/.lightning/lightning-rpc</Alert>
                  <Alert icon={false}>type=clightning;server=tcp://1.1.1.1:27743/</Alert>
                </Stack>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel2-content">
                <Typography fontWeight={'bold'} pr={1}>
                  <Link href={'https://github.com/ElementsProject/lightning-charge'} target="_blank">
                    Lightning Charge
                  </Link>
                </Typography>
                via HTTPS
              </AccordionSummary>
              <AccordionDetails>
                <Alert icon={false}>type=charge;server=https://charge:8080/;api-token=myapitoken...</Alert>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel3-content">
                <Typography fontWeight={'bold'} pr={1}>
                  <Link href={'https://github.com/ACINQ/eclair'} target="_blank">
                    Eclair
                  </Link>
                </Typography>
                via HTTPS
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1}>
                  <Alert icon={false}>type=eclair;server=https://eclair:8080/;password=eclairpassword...</Alert>
                  <Typography>
                    Note that bitcoin-host and bitcoin-auth are optional, only useful if you want to use
                    GetDepositAddress on Eclair:
                  </Typography>
                  <Alert icon={false}>
                    type=eclair;server=https://eclair:8080/;password=eclairpassword;bitcoin-host=bitcoin.host;bitcoin-auth=btcpass
                  </Alert>
                </Stack>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel3-content">
                <Typography fontWeight={'bold'} pr={1}>
                  <Link href={'https://docs.lightning.engineering/'} target="_blank">
                    LND
                  </Link>
                </Typography>
                via the REST API
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1}>
                  <Alert icon={false}>type=lnd-rest;server=https://mylnd:8080/;macaroon=abef263adfe...</Alert>
                  <Alert icon={false}>
                    type=lnd-rest;server=https://mylnd:8080/;macaroon=abef263adfe...;certthumbprint=abef263adfe...
                  </Alert>
                  <Typography>
                    For the macaroon options you need to provide a macaroon with the invoices:write permission (e.g.
                    invoice.macaroon. If you want to display the node connection details, it also needs the info:read
                    permission. The path to the LND data directory may vary, the following examples assume /root/.lnd.
                  </Typography>
                  <Typography>
                    The macaroon parameter expects the HEX value, it can be obtained using this command:
                  </Typography>
                  <Alert icon={false}>
                    xxd -p -c 256 /root/.lnd/data/chain/bitcoin/mainnet/invoice.macaroon | tr -d '\n'
                  </Alert>
                  <Typography>
                    You can omit certthumbprint if the certificate is trusted by your machine. The certthumbprint can be
                    obtained using this command:
                  </Typography>
                  <Alert icon={false}>
                    openssl x509 -noout -fingerprint -sha256 -in /root/.lnd/tls.cert | sed -e 's/.*=//;s/://g'
                  </Alert>
                  <Typography>
                    If your LND REST server is using HTTP or HTTPS with an untrusted certificate, you can set
                    allowinsecure=true as a fallback.
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel3-content">
                <Typography fontWeight={'bold'} pr={1}>
                  <Link href={'https://bluewallet.io/lndhub/'} target="_blank">
                    LNDhub
                  </Link>
                </Typography>
                via the REST API
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={1}>
                  <Alert icon={false}>type=lndhub;server=https://login:password@lndhub.io</Alert>
                  <Typography>
                    The credentials and server address are shown as a lndhub:// URL on the "Export/Backup" screen in
                    BlueWallet.
                  </Typography>
                  <Typography>
                    You can also use this LNDhub-URL as the connection string and CryptoPay Server converts it into the
                    expected type=lndhub connection string format:
                  </Typography>
                  <Alert icon={false}>lndhub://login:password@https://lndhub.io</Alert>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box mt={5}>
            <Button variant={'contained'} size={'large'} color="success" onClick={onClickSave}>
              Save
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Lightning;
