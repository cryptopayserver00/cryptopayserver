import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { CHAINS } from 'packages/constants/blockchain';
import { useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Payout = () => {
  const [id, setId] = useState<number>(0);
  const [isConfigure, setIsConfigure] = useState<boolean>(false);
  const [configureChain, setConfigureChain] = useState<CHAINS>(CHAINS.BITCOIN);
  const [showApprovePayoutProcess, setShowApprovePayoutProcess] = useState<boolean>();
  const [interval, setInterval] = useState<number>(0);
  const [feeBlockTarget, setFeeBlockTarget] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);

  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickSave = async () => {
    try {
      const response: any = await axios.put(Http.update_payout_setting_by_network, {
        id: id,
        show_approve_payout_process: showApprovePayoutProcess ? 1 : 2,
        interval: interval,
        fee_block_target: feeBlockTarget,
        threshold: threshold,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Update successful!');
        setSnackOpen(true);

        setIsConfigure(false);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Update failed!');
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
      {!isConfigure ? (
        <Box>
          <Box>
            <Typography variant="h6">Payout Processors</Typography>
            <Typography mt={2}>
              Payout Processors allow CryptoPay Server to handle payouts in an automated way.
            </Typography>
          </Box>

          <Box mt={5}>
            <Typography variant="h6">Automated Crypto Sender</Typography>

            <Box mt={4}>
              <StorePayoutTable
                setId={setId}
                setIsConfigure={setIsConfigure}
                setConfigureChain={setConfigureChain}
                setShowApprovePayoutProcess={setShowApprovePayoutProcess}
                setInterval={setInterval}
                setFeeBlockTarget={setFeeBlockTarget}
                setThreshold={setThreshold}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography variant="h6">Payout Processors</Typography>
          <Typography mt={2}>Set a schedule for automated Payouts.</Typography>
          <Stack direction={'row'} alignItems={'center'} mt={1}>
            <Switch
              checked={showApprovePayoutProcess}
              onChange={() => {
                setShowApprovePayoutProcess(!showApprovePayoutProcess);
              }}
            />
            <Typography ml={2}>Process approved payouts instantly</Typography>
          </Stack>
          <Box mt={1}>
            <Typography>Interval*</Typography>
            <Box mt={1}>
              <FormControl sx={{ width: '25ch' }} variant="outlined">
                <OutlinedInput
                  size={'small'}
                  type="number"
                  endAdornment={<InputAdornment position="end">minutes</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={interval}
                  onChange={(e: any) => {
                    setInterval(e.target.value);
                  }}
                />
              </FormControl>
            </Box>
          </Box>
          <Box mt={2}>
            <Typography>Fee block target*</Typography>
            <Box mt={1}>
              <FormControl sx={{ width: '25ch' }} variant="outlined">
                <OutlinedInput
                  size={'small'}
                  type="number"
                  endAdornment={<InputAdornment position="end">blocks</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={feeBlockTarget}
                  onChange={(e: any) => {
                    setFeeBlockTarget(e.target.value);
                  }}
                />
              </FormControl>
            </Box>
          </Box>
          <Box mt={2}>
            <Typography>Threshold*</Typography>
            <Box mt={1}>
              <FormControl sx={{ width: '25ch' }} variant="outlined">
                <OutlinedInput
                  size={'small'}
                  type="number"
                  endAdornment={<InputAdornment position="end">USD</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    'aria-label': 'weight',
                  }}
                  value={threshold}
                  onChange={(e: any) => {
                    setThreshold(e.target.value);
                  }}
                />
              </FormControl>
            </Box>
            <Typography mt={1} fontWeight={14}>
              Only process payouts when this payout sum is reached.
            </Typography>
          </Box>

          <Box mt={5}>
            <Button size="large" variant={'contained'} onClick={onClickSave}>
              Save
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Payout;

function createData(id: number, paymentMethod: string, chain: CHAINS) {
  return { id, paymentMethod, chain };
}

const rows = [
  createData(1, 'BTC (On-Chain)', CHAINS.BITCOIN),
  createData(2, 'Ethereum', CHAINS.ETHEREUM),
  createData(3, 'Solana', CHAINS.SOLANA),
];

type TableType = {
  setId: (value: number) => void;
  setIsConfigure: (value: boolean) => void;
  setConfigureChain: (value: CHAINS) => void;
  setShowApprovePayoutProcess: (value: boolean) => void;
  setInterval: (value: number) => void;
  setFeeBlockTarget: (value: number) => void;
  setThreshold: (value: number) => void;
};

function StorePayoutTable(props: TableType) {
  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickConfigure = async (rows: any) => {
    if (rows.chain && rows.chain > 0) {
      try {
        const response: any = await axios.get(Http.find_payout_setting_by_network, {
          params: {
            store_id: getStoreId(),
            user_id: getUserId(),
            network: getNetwork() === 'mainnnet' ? 1 : 2,
            chain_id: rows.chain,
          },
        });

        if (response.result) {
          props.setId(response.data.id);
          props.setConfigureChain(response.data.chain_id);
          props.setShowApprovePayoutProcess(response.data.show_approve_payout_process === 1 ? true : false);
          props.setInterval(response.data.interval);
          props.setFeeBlockTarget(response.data.fee_block_target);
          props.setThreshold(response.data.threshold);

          props.setIsConfigure(true);
        }
      } catch (e) {
        setSnackSeverity('error');
        setSnackMessage('The network error occurred. Please try again later.');
        setSnackOpen(true);
        console.error(e);
      }
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Payment Method</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.paymentMethod}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => {
                        onClickConfigure(row);
                      }}
                    >
                      Configure
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={100} align="center">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
