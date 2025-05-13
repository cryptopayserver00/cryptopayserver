import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  OutlinedInput,
} from '@mui/material';
import { CHAINS, COIN } from 'packages/constants/blockchain';
import { useState } from 'react';
import { FindChainNamesByChains } from 'utils/web3';

type DialogType = {
  currency: string;
  selectCoinItem: COIN;
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
};

export default function CreateFundsDialog(props: DialogType) {
  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const handleClose = () => {
    setAddress('');
    setAmount(0);

    props.setOpenDialog(false);
  };

  return (
    <Dialog
      open={props.openDialog}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">Claim Funds</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <FormControl variant="outlined" fullWidth size={'small'}>
            <OutlinedInput
              type="text"
              endAdornment={
                <InputAdornment position="end">
                  {FindChainNamesByChains(props.selectCoinItem?.chainId as CHAINS)}
                </InputAdornment>
              }
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              value={address}
              onChange={(e: any) => {
                setAddress(e.target.value);
              }}
              placeholder="Enter your address"
            />
          </FormControl>
        </Box>

        <Box mb={2}>
          <FormControl variant="outlined" fullWidth size={'small'}>
            <OutlinedInput
              type="number"
              endAdornment={<InputAdornment position="end">{props.currency}</InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
              }}
              value={amount}
              onChange={(e: any) => {
                setAmount(e.target.value);
              }}
              placeholder="Enter you amount"
            />
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant={'contained'} onClick={handleClose}>
          Close
        </Button>
        <Button
          color="success"
          variant={'contained'}
          onClick={async () => {
            await props.onClickCoin(props.selectCoinItem as COIN, address, amount);
            handleClose();
          }}
        >
          Claim Funds
        </Button>
      </DialogActions>
    </Dialog>
  );
}
