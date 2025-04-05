import { ReportGmailerrorred } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Container,
  FormControl,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import TransactionDataGrid from '../../DataList/TransactionDataGrid';
import { CHAINNAMES } from 'packages/constants/blockchain';
import { FindChainIdsByChainNames } from 'utils/web3';
import { useUserPresistStore } from 'lib/store';

const PaymentTransactions = () => {
  const ALL_CHAINS = 'All Chains' as const;

  const [openExplain, setOpenExplain] = useState<boolean>(false);
  const [address, setAddress] = useState<string>('');
  const [txChain, setTxChain] = useState<CHAINNAMES | typeof ALL_CHAINS>(ALL_CHAINS);

  const { getNetwork } = useUserPresistStore((state) => state);

  return (
    <Box>
      <Container>
        <Box>
          <Stack direction={'row'} alignItems={'center'} pt={5}>
            <Typography variant="h6">Transactions</Typography>
            <IconButton
              onClick={() => {
                setOpenExplain(!openExplain);
              }}
            >
              <ReportGmailerrorred />
            </IconButton>
          </Stack>

          {openExplain && (
            <Alert severity="info">
              <AlertTitle>Info</AlertTitle>
              The transaction data here is related to the address used by your store and all comes from a third-party
              quick-scan platform.
              <br />
              You can search for all transactions associated with the address you use, filtering by conditions to find
              different blockchains, times, and more.
            </Alert>
          )}

          <Stack mt={5} direction={'row'} gap={2}>
            <FormControl sx={{ width: 500 }} variant="outlined">
              <OutlinedInput
                size={'small'}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                placeholder="Search address ..."
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
              />
            </FormControl>
            <FormControl>
              <Select
                size={'small'}
                inputProps={{ 'aria-label': 'Without label' }}
                value={txChain}
                onChange={(e: any) => {
                  setTxChain((e.target.value as CHAINNAMES) || ALL_CHAINS);
                }}
              >
                <MenuItem value={'All Chains'}>All Chains</MenuItem>
                {CHAINNAMES &&
                  Object.entries(CHAINNAMES).map((item, index) => (
                    <MenuItem value={item[1]} key={index}>
                      {item[1]}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Stack>

          <Box mt={2}>
            <TransactionDataGrid
              source="none"
              chain={txChain === ALL_CHAINS ? undefined : FindChainIdsByChainNames(txChain)}
              network={getNetwork()}
              address={address}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentTransactions;
