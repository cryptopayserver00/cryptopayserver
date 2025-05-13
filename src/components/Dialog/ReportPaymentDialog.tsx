import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore } from 'lib/store';
import { WALLET } from 'packages/constants';
import { CHAINNAMES } from 'packages/constants/blockchain';
import { useState } from 'react';

type DialogType = {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
};

export default function ReportPaymentDialog(props: DialogType) {
  const [issueWallet, setIssueWallet] = useState<typeof WALLET>();
  const [issuePaymentMethod, setIssuePaymentMethod] = useState<CHAINNAMES>();
  const [issueMessage, setIssueMessage] = useState<string>('');

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

  const handleDialogClose = () => {
    setIssueWallet(undefined);
    setIssuePaymentMethod(undefined);
    setIssueMessage('');

    props.setOpenDialog(false);
  };

  const onClickSubmitIssue = async () => {
    try {
      setSnackSeverity('success');
      setSnackMessage('report issue success!');
      setSnackOpen(true);

      props.setOpenDialog(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog
      open={props.openDialog}
      onClose={handleDialogClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">Report An Issue</DialogTitle>
      <DialogContent>
        <Typography fontWeight={'bold'}>I have an issue in making payment</Typography>

        <Typography mt={2} mb={1}>
          Select wallet which you have used
        </Typography>
        <Box mb={2}>
          <FormControl variant="outlined" fullWidth size={'small'}>
            <Select
              size={'small'}
              inputProps={{ 'aria-label': 'Without label' }}
              onChange={(e: any) => {
                setIssueWallet(e.target.value);
              }}
              value={issueWallet}
              placeholder="Select wallet"
            >
              {WALLET &&
                WALLET.length > 0 &&
                WALLET.map((item, index) => (
                  <MenuItem value={item} key={index}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <Typography mb={1}>Select payment method which you have used</Typography>
        <Box mb={2}>
          <FormControl variant="outlined" fullWidth size={'small'}>
            <Select
              size={'small'}
              inputProps={{ 'aria-label': 'Without label' }}
              onChange={(e) => {
                setIssuePaymentMethod(e.target.value as CHAINNAMES);
              }}
              value={issuePaymentMethod}
            >
              {CHAINNAMES &&
                Object.entries(CHAINNAMES).length > 0 &&
                Object.entries(CHAINNAMES).map((item, index) => (
                  <MenuItem value={item[1]} key={index}>
                    {item[1]}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <Typography mb={1}>Provide more information like error message, failure etc</Typography>
        <Box mb={2}>
          <FormControl variant="outlined" fullWidth size={'small'}>
            <TextField
              fullWidth
              hiddenLabel
              multiline
              minRows={4}
              value={issueMessage}
              onChange={(e: any) => {
                setIssueMessage(e.target.value);
              }}
              placeholder="Type a reason..."
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant={'contained'} onClick={handleDialogClose}>
          Close
        </Button>
        <Button
          variant={'contained'}
          onClick={async () => {
            await onClickSubmitIssue();
          }}
          color="success"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
