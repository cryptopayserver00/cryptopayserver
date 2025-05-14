import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import lightningPayReq, { PaymentRequestObject } from 'bolt11';
import { SatoshisToBtc } from 'utils/number';

type DialogType = {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  onClickSendLightningAssets: (value: string) => Promise<void>;
};

export default function SendLightningAssetsDialog(props: DialogType) {
  const [invoice, setInvoice] = useState<string>('');
  const [decodeInfo, setDecodeInfo] = useState<PaymentRequestObject>();

  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const handleDialogClose = () => {
    setInvoice('');
    setDecodeInfo(undefined);
    props.setOpenDialog(false);
  };

  useEffect(() => {
    try {
      if (!invoice || invoice === '') return;

      const decodeInvoice = lightningPayReq.decode(invoice);
      setDecodeInfo(decodeInvoice);
    } catch (e) {
      console.error(e);
      setSnackSeverity('error');
      setSnackMessage('Parsing error, please try again');
      setSnackOpen(true);
    }
  }, [invoice]);

  return (
    <Dialog
      open={props.openDialog}
      onClose={handleDialogClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">Send Lightning Network Assets</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Alert severity="warning">
            <AlertTitle>Note</AlertTitle>
            <Typography>Limit exeeded. Please configure your wallet.</Typography>
          </Alert>
        </Box>
        <Box mb={2}>
          <Typography mb={1} variant="h6">
            Request String:
          </Typography>
          <FormControl variant="outlined" fullWidth size={'small'}>
            <OutlinedInput
              multiline
              minRows={4}
              type="text"
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              value={invoice}
              onChange={(e: any) => {
                setInvoice(e.target.value);
              }}
              placeholder="Enter request String"
            />
          </FormControl>
        </Box>

        {decodeInfo && (
          <Box mb={2}>
            <Typography mb={1} variant="h6">
              Payment Info:
            </Typography>

            <Stack direction={'row'} alignItems={'center'}>
              <Box minWidth={140}>
                <Typography fontWeight={'bold'}>Network</Typography>
                <Typography fontWeight={'bold'}>Amount</Typography>
                <Typography fontWeight={'bold'}>Date</Typography>
                <Typography fontWeight={'bold'}>Payment Hash</Typography>
                <Typography fontWeight={'bold'}>Description</Typography>
              </Box>

              <Box>
                <Typography>{decodeInfo?.network?.bech32 === 'bc' ? 'bitcoin mainnet' : 'bitcoin testnet'}</Typography>
                <Typography>{SatoshisToBtc(Number(decodeInfo?.satoshis)).toFixed(8)} BTC</Typography>
                <Typography>{new Date(Number(decodeInfo?.timestamp) * 1000).toLocaleString()}</Typography>
                <Typography>
                  {decodeInfo?.tags.find((item) => item.tagName === 'payment_hash')?.data.toString() || 'None'}
                </Typography>
                <Typography>
                  {decodeInfo?.tags.find((item) => item.tagName === 'description')?.data.toString() || 'None'}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant={'contained'} onClick={handleDialogClose}>
          Close
        </Button>
        <Button
          variant={'contained'}
          onClick={async () => {
            await props.onClickSendLightningAssets(invoice);
            handleDialogClose();
          }}
          color={'success'}
          disabled={decodeInfo ? false : true}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
