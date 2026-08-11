// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   FormControl,
//   Icon,
//   MenuItem,
//   Select,
//   Stack,
//   Tab,
//   Tabs,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store';
// import { CHAINNAMES } from '@/packages/constants/blockchain';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { FindChainIdsByChainNames } from '@/utils/web3';

// const ImportPrivateKey = () => {
//   const [network, setNetwork] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN);
//   const [privateKey, setPrivateKey] = useState<string>('');

//   const { getUserId, getNetwork } = useUserPresistStore((state) => state);
//   const { getStoreId, getIsStore } = useStorePresistStore((state) => state);
//   const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state);

//   const onClickBatchImport = () => {
//     setSnackMessage('No support right now');
//     setSnackSeverity('error');
//     setSnackOpen(true);
//   };

//   const handleButtonClick = async () => {
//     try {
//       if (!privateKey || privateKey === '') {
//         setSnackSeverity('error');
//         setSnackMessage('The privateKey cannot be empty');
//         setSnackOpen(true);
//         return;
//       }

//       if (!network || !Object.values(CHAINNAMES).includes(network)) {
//         setSnackSeverity('error');
//         setSnackMessage('The network cannot be empty');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.post(Http.save_wallet_by_private_key, {
//         user_id: getUserId(),
//         store_id: getStoreId(),
//         chain_id: FindChainIdsByChainNames(network),
//         network: getNetwork() === 'mainnet' ? 1 : 2,
//         private_key: privateKey,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful creation!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     if (!getIsStore()) {
//       window.location.href = '/stores/create';
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box width={420}>
//       <FormControl fullWidth>
//         <Select
//           size={'small'}
//           inputProps={{ 'aria-label': 'Without label' }}
//           onChange={(e) => {
//             setNetwork(e.target.value as CHAINNAMES);
//           }}
//           value={network}
//         >
//           {CHAINNAMES &&
//             Object.entries(CHAINNAMES).length > 0 &&
//             Object.entries(CHAINNAMES).map((item, index) => (
//               <MenuItem value={item[1]} key={index}>
//                 {item[1]}
//               </MenuItem>
//             ))}
//         </Select>
//       </FormControl>

//       <Box mt={2}>
//         <TextField
//           label="Private key"
//           fullWidth
//           multiline
//           rows={10}
//           value={privateKey}
//           onChange={(e) => {
//             setPrivateKey(e.target.value);
//           }}
//         />
//       </Box>

//       <Box mt={5}>
//         <Button size="large" fullWidth variant={'contained'} onClick={handleButtonClick}>
//           Confirm
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default ImportPrivateKey;

import { useEffect, useState } from 'react'
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from '@/lib/store'
import { CHAINNAMES } from '@/packages/constants/blockchain'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { FindChainIdsByChainNames } from '@/utils/web3'

const ImportPrivateKey = () => {
  const [network, setNetwork] = useState<CHAINNAMES>(CHAINNAMES.BITCOIN)
  const [privateKey, setPrivateKey] = useState<string>('')

  const { getUserId, getNetwork } = useUserPresistStore((state) => state)
  const { getStoreId, getIsStore } = useStorePresistStore((state) => state)
  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore((state) => state)

  const onClickBatchImport = () => {
    setSnackMessage('No support right now')
    setSnackSeverity('error')
    setSnackOpen(true)
  }

  const handleButtonClick = async () => {
    try {
      if (!privateKey || privateKey === '') {
        setSnackSeverity('error')
        setSnackMessage('The privateKey cannot be empty')
        setSnackOpen(true)
        return
      }

      if (!network || !Object.values(CHAINNAMES).includes(network)) {
        setSnackSeverity('error')
        setSnackMessage('The network cannot be empty')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.post(Http.save_wallet_by_private_key, {
        user_id: getUserId(),
        store_id: getStoreId(),
        chain_id: FindChainIdsByChainNames(network),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        private_key: privateKey,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    if (!getIsStore()) {
      window.location.href = '/stores/create'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full max-w-[420px]">
      {/* Network Select Dropdown */}
      <div className="w-full">
        <label className="sr-only">Select Network</label>
        <select
          aria-label="Without label"
          value={network}
          onChange={(e) => setNetwork(e.target.value as CHAINNAMES)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
        >
          {CHAINNAMES &&
            Object.entries(CHAINNAMES).length > 0 &&
            Object.entries(CHAINNAMES).map((item, index) => (
              <option value={item[1]} key={index}>
                {item[1]}
              </option>
            ))}
        </select>
      </div>

      {/* Private Key Textarea */}
      <div className="mt-4">
        <label htmlFor="private-key-input" className="block text-sm font-medium text-gray-700 mb-1">
          Private key
        </label>
        <textarea
          id="private-key-input"
          rows={10}
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          placeholder="Enter your private key"
        />
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleButtonClick}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

export default ImportPrivateKey
