import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material';
import { CHAINS, COIN } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import { OmitMiddleString } from 'utils/strings';
import { FindChainNamesByChains } from 'utils/web3';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import Image from 'next/image';

type RowType = {
  id: number;
  chainId: number;
  isMainnet: boolean;
  name: string;
  address: string;
};

type DialogType = {
  network: number;
  selectCoinItem: COIN;
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  onClickCoin: (item: COIN, cryptoAmount: string, rate: number) => Promise<void>;
};

export default function CreateFreeFundsDialog(props: DialogType) {
  const [rows, setRows] = useState<RowType[]>([]);

  const [address, setAddress] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const handleClose = () => {
    setAddress('');
    setAmount(0);
    setRows([]);

    props.setOpenDialog(false);
  };

  const initAddressBook = async (chainId: number) => {
    if (!chainId) {
      return;
    }

    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          network: props.network,
          chain_id: chainId,
        },
      });
      if (response.result && response.data.length > 0) {
        let rt: RowType[] = [];
        response.data.forEach((item: any) => {
          rt.push({
            id: item.id,
            chainId: item.chain_id,
            isMainnet: item.network === 1 ? true : false,
            name: item.name,
            address: item.address,
          });
        });

        setRows(rt);
      }
    } catch (e) {
      console.error(e);
    }

    props.setOpenDialog(true);
  };

  useEffect(() => {
    initAddressBook(props.selectCoinItem?.chainId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.selectCoinItem]);

  return (
    <Dialog
      open={props.openDialog}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">Claim Free Funds</DialogTitle>
      <DialogContent>
        <Image src={props.selectCoinItem?.icon} alt="icon" width={50} height={50} />

        <Box my={2}>
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

        {rows && rows.length > 0 && (
          <Box mb={2}>
            <Typography mb={2}>Address Books</Typography>
            <Grid container spacing={2}>
              {rows.map((item, index) => (
                <Grid item key={index}>
                  <Chip
                    label={OmitMiddleString(item.address)}
                    variant="outlined"
                    onClick={() => {
                      setAddress(item.address);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Box mb={2}>
          <FormControl variant="outlined" fullWidth size={'small'}>
            <OutlinedInput
              type="number"
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
