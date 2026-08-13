// import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
// import Link from 'next/link';
// import { EthereumTransactionDetail } from '@/packages/web3/types';
// import { useUserPresistStore } from '@/lib/store';
// import { FindChainNamesByChains, GetBlockchainTxUrlByChainIds } from '@/utils/web3';

// export default function TransactionsTab({ rows }: { rows: EthereumTransactionDetail[] }) {
//   const { getNetwork } = useUserPresistStore((state) => state);

//   return (
//     <TableContainer component={Paper}>
//       <Table aria-label="simple table">
//         <TableHead>
//           <TableRow>
//             {/* <TableCell>Chain</TableCell> */}
//             <TableCell>Hash</TableCell>
//             <TableCell>Value</TableCell>
//             <TableCell>Asset</TableCell>
//             <TableCell>Type</TableCell>
//             {/* <TableCell>Contract Address</TableCell> */}
//             <TableCell>Block Timestamp</TableCell>
//             <TableCell>Status</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {rows && rows.length > 0 ? (
//             <>
//               {rows.map((row, index) => (
//                 <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
//                   {/* <TableCell>{FindChainNamesByChains(row.chainId)}</TableCell> */}
//                   <TableCell component="th" scope="row">
//                     <Link
//                       href={GetBlockchainTxUrlByChainIds(
//                         getNetwork() === 'mainnet' ? true : false,
//                         row.chainId,
//                         row.hash,
//                       )}
//                       target={'_blank'}
//                     >
//                       {row.hash}
//                     </Link>
//                   </TableCell>
//                   <TableCell>{row.amount}</TableCell>
//                   <TableCell>{row.asset}</TableCell>
//                   <TableCell>{row.type}</TableCell>
//                   {/* <TableCell>{row.contractAddress}</TableCell> */}
//                   <TableCell>{new Date(row.blockTimestamp).toLocaleString()}</TableCell>
//                   <TableCell>
//                     <Typography fontWeight={'bold'}>{row.status}</Typography>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </>
//           ) : (
//             <TableRow>
//               <TableCell colSpan={100} align="center">
//                 No rows
//               </TableCell>
//             </TableRow>
//           )}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// }

import Link from 'next/link'
import { EthereumTransactionDetail } from '@/packages/web3/types'
import { useUserPresistStore } from '@/lib/store'
import { FindChainNamesByChains, GetBlockchainTxUrlByChainIds } from '@/utils/web3'
import { useShallow } from 'zustand/react/shallow'

export default function TransactionsTab({ rows }: { rows: EthereumTransactionDetail[] }) {
  const { network } = useUserPresistStore(
    useShallow((state) => ({
      network: state.network,
    }))
  )

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase border-b border-gray-200">
          <tr>
            {/* <th className="px-6 py-3">Chain</th> */}
            <th className="px-6 py-3">Hash</th>
            <th className="px-6 py-3">Value</th>
            <th className="px-6 py-3">Asset</th>
            <th className="px-6 py-3">Type</th>
            {/* <th className="px-6 py-3">Contract Address</th> */}
            <th className="px-6 py-3">Block Timestamp</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {rows && rows.length > 0 ? (
            rows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {/* <td className="px-6 py-4">{FindChainNamesByChains(row.chainId)}</td> */}
                <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate">
                  <Link
                    href={GetBlockchainTxUrlByChainIds(
                      network === 'mainnet',
                      row.chainId,
                      row.hash
                    )}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    {row.hash}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{row.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">{row.asset}</td>
                <td className="px-6 py-4 whitespace-nowrap">{row.type}</td>
                {/* <td className="px-6 py-4">{row.contractAddress}</td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(row.blockTimestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                  {row.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No rows
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
