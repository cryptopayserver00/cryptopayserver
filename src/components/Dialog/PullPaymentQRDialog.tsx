import { CopyAll } from '@mui/icons-material';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { QRCodeSVG } from 'qrcode.react';
import { OmitMiddleString } from 'utils/strings';

type DialogType = {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  websiteUrl: string;
};

export default function PullPaymentQRDialog(props: DialogType) {
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  return (
    <Dialog
      onClose={() => {
        props.setOpenDialog(false);
      }}
      open={props.openDialog}
      fullWidth
    >
      <DialogTitle>Pull Payment QR</DialogTitle>
      <DialogContent>
        <Box mt={2} textAlign={'center'}>
          <QRCodeSVG
            value={props.websiteUrl}
            width={250}
            height={250}
            imageSettings={{
              src: '',
              width: 35,
              height: 35,
              excavate: false,
            }}
          />
        </Box>

        <Box mt={4}>
          <Typography>PULL PAYMENT QR</Typography>
          <Stack direction={'row'} alignItems={'center'}>
            <Typography mr={1}>{OmitMiddleString(props.websiteUrl, 20)}</Typography>
            <IconButton
              onClick={async () => {
                await navigator.clipboard.writeText(props.websiteUrl);

                setSnackMessage('Successfully copy');
                setSnackSeverity('success');
                setSnackOpen(true);
              }}
            >
              <CopyAll />
            </IconButton>
          </Stack>
        </Box>

        <Box mt={4}>
          <Typography>Scan this QR code to open this page on your mobile device.</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
