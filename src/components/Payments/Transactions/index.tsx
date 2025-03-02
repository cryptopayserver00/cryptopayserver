import { ReportGmailerrorred } from '@mui/icons-material';
import {
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
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { CHAINNAMES } from 'packages/constants/blockchain';
import { FindChainIdsByChainNames } from 'utils/web3';

const PaymentTransactions = () => {
  const ALL_CHAINS = 'All Chains' as const;

  const [search, setSearch] = useState<string>('');
  const [txChain, setTxChain] = useState<CHAINNAMES | typeof ALL_CHAINS>(ALL_CHAINS);

  return (
    <Box>
      <Container>
        <Box>
          <Stack direction={'row'} alignItems={'center'} pt={5}>
            <Typography variant="h6">Transactions</Typography>
            <IconButton
              onClick={() => {
                // setOpenInvoiceReport(!openInvoiceReport);
              }}
            >
              <ReportGmailerrorred />
            </IconButton>
          </Stack>

          <Stack mt={5} direction={'row'} gap={2}>
            <FormControl sx={{ width: 500 }} variant="outlined">
              <OutlinedInput
                size={'small'}
                aria-describedby="outlined-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
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
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PaymentTransactions;
