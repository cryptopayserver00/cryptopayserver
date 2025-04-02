import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Link from 'next/link';
import { EthereumTransactionDetail } from 'packages/web3/types';
import { useUserPresistStore } from 'lib/store';
import { FindChainNamesByChains, GetBlockchainTxUrlByChainIds } from 'utils/web3';

export default function TransactionsTab({ rows }: { rows: EthereumTransactionDetail[] }) {
  const { getNetwork } = useUserPresistStore((state) => state);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {/* <TableCell>Chain</TableCell> */}
            <TableCell>Hash</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Asset</TableCell>
            <TableCell>Type</TableCell>
            {/* <TableCell>Contract Address</TableCell> */}
            <TableCell>Block Timestamp</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row, index) => (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  {/* <TableCell>{FindChainNamesByChains(row.chainId)}</TableCell> */}
                  <TableCell component="th" scope="row">
                    <Link
                      href={GetBlockchainTxUrlByChainIds(
                        getNetwork() === 'mainnet' ? true : false,
                        row.chainId,
                        row.hash,
                      )}
                      target={'_blank'}
                    >
                      {row.hash}
                    </Link>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell>{row.asset}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  {/* <TableCell>{row.contractAddress}</TableCell> */}
                  <TableCell>{new Date(row.blockTimestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Typography fontWeight={'bold'}>{row.status}</Typography>
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
