import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { CURRENCY_SYMBOLS } from 'packages/constants';
import { CHAINS, COIN } from 'packages/constants/blockchain';
import { FindChainNamesByChains } from 'utils/web3';

type DialogType = {
  selectCoinItem: COIN;
  currency: string;
  amount: number;
  cryptoAmount: string;
  rate: number;
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  handleClose: () => void;
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
};

export default function CreateInvoiceDialog(props: DialogType) {
  return (
    <Dialog
      open={props.openDialog}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">Create Invoice</DialogTitle>
      <DialogContent>
        <Image src={props.selectCoinItem?.icon} alt="icon" width={50} height={50} />

        <Stack direction={'row'} mt={2}>
          <Box>
            <Typography>Select Chain</Typography>
            <Typography mt={1}>Select Coin</Typography>
            <Typography mt={1}>Crypto Rate</Typography>
            <Typography mt={1}>You Will Pay</Typography>
          </Box>
          <Box ml={6}>
            <Typography>{FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)}</Typography>
            <Box mt={1}>{props.selectCoinItem?.name}</Box>
            <Typography mt={1}>
              1 {props.selectCoinItem?.name} = {CURRENCY_SYMBOLS[props.currency]}
              {props.rate}
            </Typography>
            <Typography mt={1}>
              {props.cryptoAmount} {props.selectCoinItem?.name}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant={'outlined'} onClick={props.handleClose}>
          Close
        </Button>
        <Button
          color="success"
          variant={'contained'}
          onClick={async () => {
            props.selectCoinItem && (await props.onClickCoin(props.selectCoinItem, props.cryptoAmount, props.rate));
            props.handleClose();
          }}
        >
          Create Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
}
