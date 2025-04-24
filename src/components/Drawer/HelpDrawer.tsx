import { Close, ExpandMore, HelpOutline } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';

type DrawerType = {
  openDrawer: boolean;
  setOpenDrawer: (value: boolean) => void;
};

export default function HelpDrawer(props: DrawerType) {
  const toggleDrawer = (newOpen: boolean) => () => {
    props.setOpenDrawer(newOpen);
  };

  return (
    <Drawer open={props.openDrawer} onClose={toggleDrawer(false)} anchor={'right'}>
      <Box role="presentation" width={400}>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} py={2} px={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <HelpOutline />
            <Typography variant={'h6'} ml={1}>
              Help
            </Typography>
          </Stack>
          <IconButton onClick={toggleDrawer(false)}>
            <Close />
          </IconButton>
        </Stack>

        <Divider />

        <Box mt={4} px={2}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
              What is CryptoPayServer?
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                CryptoPayServer is a leading coin payment processor. CryptoPayServer makes it possible for you to send
                and receive transactions very quickly using the crypto network.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
              What is CryptoPayServer wallet?
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                A wallet is a software program that allows you to send and receive crypto from others in the network. It
                keeps track of your balance and transaction history. Each wallet has its own address, which functions
                similarly to your bank account&apos;s account number. There are lots of wallets available. Picking the
                right one is a matter of personal preference.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
              How to make the payment?
            </AccordionSummary>
            <AccordionDetails>
              <Typography>There are many ways to pay:</Typography>
              <Typography>QR Code</Typography>
              <Typography>1. Open your onchain wallet and tap scan.</Typography>
              <Typography>2. Scan the QR code.</Typography>
              <Typography>3. Tap Pay, and you’re done!</Typography>
            </AccordionDetails>
          </Accordion>

          <Box p={2} border={1} mt={4}>
            <Typography>More Questions?</Typography>
            <Typography mt={1}>
              You can reach out to us <Link href={'#'}>here</Link> for more information
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
