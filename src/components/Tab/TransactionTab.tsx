import Link from 'next/link'
import { EthereumTransactionDetail } from '@/packages/web3/types'
import { useUserPresistStore } from '@/lib/store'
import { GetBlockchainTxUrlByChainIds } from '@/utils/web3'
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
