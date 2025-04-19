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
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { FindChainNamesByChains } from 'utils/web3';

const Payout = () => {
  const [id, setId] = useState<number>(0);
  const [isConfigure, setIsConfigure] = useState<boolean>(false);
  const [configureChain, setConfigureChain] = useState<CHAINS>(CHAINS.BITCOIN);
  const [showApprovePayoutProcess, setShowApprovePayoutProcess] = useState<boolean>();
  const [interval, setInterval] = useState<number>(0);
  const [feeBlockTarget, setFeeBlockTarget] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickSave = async () => {
    try {
      if (!id) {
        return;
      }

      const response: any = await axios.put(Http.update_payout_setting_by_id, {
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
    } finally {
      clearData();
    }
  };

  const clearData = () => {
    setId(0);
    setConfigureChain(CHAINS.BITCOIN);
    setShowApprovePayoutProcess(false);
    setInterval(0);
    setFeeBlockTarget(0);
    setThreshold(0);
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
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant="h6">{FindChainNamesByChains(configureChain)} Payout Processors</Typography>
            <Button
              variant={'contained'}
              onClick={() => {
                clearData();
                setIsConfigure(false);
              }}
            >
              back
            </Button>
          </Stack>
          <Typography mt={2}>Set a schedule for automated {FindChainNamesByChains(configureChain)} Payouts.</Typography>
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
            <Button size="large" variant={'contained'} onClick={onClickSave} color={'success'}>
              Save
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Payout;

type TableType = {
  setId: (value: number) => void;
  setIsConfigure: (value: boolean) => void;
  setConfigureChain: (value: CHAINS) => void;
  setShowApprovePayoutProcess: (value: boolean) => void;
  setInterval: (value: number) => void;
  setFeeBlockTarget: (value: number) => void;
  setThreshold: (value: number) => void;
};

type RowType = {
  id: number;
  pid: number;
  chainId: CHAINS;
  showApprovePayoutProcess: boolean;
  interval: number;
  feeBlockTarget: number;
  threshold: number;
};

function StorePayoutTable(props: TableType) {
  const [rows, setRows] = useState<RowType[]>([]);

  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);

  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickConfigure = async (row: RowType) => {
    props.setId(row.pid);
    props.setConfigureChain(row.chainId);
    props.setShowApprovePayoutProcess(row.showApprovePayoutProcess);
    props.setInterval(row.interval);
    props.setFeeBlockTarget(row.feeBlockTarget);
    props.setThreshold(row.threshold);

    props.setIsConfigure(true);
  };

  const findPayout = async () => {
    try {
      const response: any = await axios.get(Http.find_payout_setting, {
        params: {
          user_id: getUserId(),
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result) {
        if (response.data.length > 0) {
          let rt: RowType[] = [];
          response.data.forEach(async (item: any, index: number) => {
            rt.push({
              id: index + 1,
              pid: item.id,
              chainId: item.chain_id,
              showApprovePayoutProcess: item.show_approve_payout_process === 1 ? true : false,
              interval: item.interval,
              feeBlockTarget: item.fee_block_target,
              threshold: item.threshold,
            });
          });
          setRows(rt);
        } else {
          setRows([]);
        }
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    await findPayout();
  };

  useEffect(() => {
    init();
  }, []);

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
                    {FindChainNamesByChains(row.chainId)}
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
