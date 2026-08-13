// import { Box, Button, Card, CardContent, Container, Icon, Stack, Typography } from '@mui/material'
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
// import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
// import { useSnackPresistStore, useStorePresistStore } from '@/lib/store'
// import { useEffect } from 'react'

// const WalletImport = () => {
//   const { getIsStore } = useStorePresistStore((state) => state)
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

//   const onClickImportWalletFile = () => {}

//   const onClickEnterExtendedPublicKey = () => {}

//   const onClickScanWalletQRCode = () => {}

//   const onClickConnectEnterWalletSeed = () => {}

//   const onClickHardwareWallet = () => {
//     setSnackMessage('Not supported.')
//     setSnackSeverity('warning')
//     setSnackOpen(true)
//   }

//   const onClickMnemonicPhraseAndPrivateKey = () => {
//     window.location.href = '/wallet/import/mnemonicphrase'
//   }

//   const onClickNoPrivateKeyWallet = () => {
//     setSnackMessage('Not supported.')
//     setSnackSeverity('warning')
//     setSnackOpen(true)
//   }

//   useEffect(() => {
//     if (!getIsStore()) {
//       window.location.href = '/stores/create'
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   return (
//     <Box>
//       <Container>
//         <Stack alignItems={'center'} mt={20}>
//           <Typography variant="h4">Choose your import method</Typography>
//           <Typography variant="h6" mt={4}>
//             The following methods assume that you already have an existing wallet created and backed
//             up.
//           </Typography>
//           <Box mt={8}>
//             <Button onClick={onClickMnemonicPhraseAndPrivateKey}>
//               <Card sx={{ width: 750, padding: 2 }}>
//                 <CardContent>
//                   <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                     <Stack direction={'row'} alignItems={'center'}>
//                       <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
//                       <Typography variant="h5" ml={5}>
//                         Mnemonic phrase or private keys
//                       </Typography>
//                     </Stack>
//                     <Icon component={ChevronRightIcon} fontSize={'large'} />
//                   </Stack>
//                 </CardContent>
//               </Card>
//             </Button>
//           </Box>

//           <Box mt={4}>
//             <Button onClick={onClickNoPrivateKeyWallet}>
//               <Card sx={{ width: 750, padding: 2 }}>
//                 <CardContent>
//                   <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                     <Stack direction={'row'} alignItems={'center'}>
//                       <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
//                       <Typography variant="h5" ml={5}>
//                         No private key wallet
//                       </Typography>
//                     </Stack>
//                     <Icon component={ChevronRightIcon} fontSize={'large'} />
//                   </Stack>
//                 </CardContent>
//               </Card>
//             </Button>
//           </Box>

//           <Box mt={4}>
//             <Button onClick={onClickHardwareWallet}>
//               <Card sx={{ width: 750, padding: 2 }}>
//                 <CardContent>
//                   <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                     <Stack direction={'row'} alignItems={'center'}>
//                       <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
//                       <Typography variant="h5" ml={5}>
//                         Hardware wallet
//                       </Typography>
//                     </Stack>
//                     <Icon component={ChevronRightIcon} fontSize={'large'} />
//                   </Stack>
//                 </CardContent>
//               </Card>
//             </Button>
//           </Box>
//         </Stack>
//       </Container>
//     </Box>
//   )
// }

// export default WalletImport

import { useEffect } from 'react'
import { useSnackPresistStore, useStorePresistStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'

const WalletImport = () => {
  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const onClickHardwareWallet = () => {
    setSnackMessage('Not supported.')
    setSnackSeverity('warning')
    setSnackOpen(true)
  }

  const onClickMnemonicPhraseAndPrivateKey = () => {
    window.location.href = '/wallet/import/mnemonicphrase'
  }

  const onClickNoPrivateKeyWallet = () => {
    setSnackMessage('Not supported.')
    setSnackSeverity('warning')
    setSnackOpen(true)
  }

  useEffect(() => {
    if (!isStore) {
      window.location.href = '/stores/create'
    }
  }, [isStore])

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Choose your import method</h1>
        <p className="text-lg text-gray-600 mt-4 text-center max-w-xl">
          The following methods assume that you already have an existing wallet created and backed
          up.
        </p>

        <div className="w-full max-w-[750px] mt-12 space-y-4">
          {/* Option 1: Mnemonic phrase or private keys */}
          <button
            type="button"
            onClick={onClickMnemonicPhraseAndPrivateKey}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9"
                  />
                </svg>
                <span className="text-xl font-semibold text-gray-900">
                  Mnemonic phrase or private keys
                </span>
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>

          {/* Option 2: No private key wallet */}
          <button
            type="button"
            onClick={onClickNoPrivateKeyWallet}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9"
                  />
                </svg>
                <span className="text-xl font-semibold text-gray-900">No private key wallet</span>
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>

          {/* Option 3: Hardware wallet */}
          <button
            type="button"
            onClick={onClickHardwareWallet}
            className="w-full text-left bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-5">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9"
                  />
                </svg>
                <span className="text-xl font-semibold text-gray-900">Hardware wallet</span>
              </div>
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default WalletImport
