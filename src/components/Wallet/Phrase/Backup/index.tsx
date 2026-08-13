// import { Box, Button, Card, CardContent, Chip, Container, Icon, Skeleton, Stack, Typography } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useSnackPresistStore } from '@/lib/store/snack';
// import { useStorePresistStore, useWalletPresistStore } from '@/lib/store';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
// const PhraseBackup = () => {
//   const [isDisable, setIsDisable] = useState<boolean>(true);
//   const [isView, setIsView] = useState<boolean>(false);
//   const [phrase, setPhrase] = useState<string[]>([]);

//   const { getIsStore } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
//   const { getIsWallet, getWalletId } = useWalletPresistStore((state) => state);

//   const onClickReConfirm = () => {
//     window.location.href = '/wallet/phrase/backup/confirm';
//   };

//   const groupSize = 2;
//   const groupedArray = Array.from({ length: Math.ceil(phrase.length / groupSize) }, (_, index) =>
//     phrase.slice(index * groupSize, index * groupSize + groupSize),
//   );

//   const init = async () => {
//     try {
//       if (getIsWallet()) {
//         const response: any = await axios.get(Http.find_wallet_by_id, {
//           params: {
//             id: getWalletId(),
//           },
//         });

//         if (response.result) {
//           setPhrase(response.data.mnemonic.split(' '));
//         } else {
//           setSnackSeverity('error');
//           setSnackMessage("Cannot find the wallet, please try again later.");
//           setSnackOpen(true);
//         }
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
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       <Container>
//         <Stack mt={20}>
//           <Typography variant="h4">Please record the following mnemonic phrase.</Typography>
//           <Typography mt={5}>
//             Connected devices may leak information. It is strongly recommended that you transcribe and securely store
//             your mnemonic phrase as a backup.
//           </Typography>

//           <Box mt={5} width={500}>
//             {!isView && (
//               <div
//                 style={{
//                   position: 'absolute',
//                   width: 500,
//                   height: 282,
//                   backgroundColor: 'rgba(0, 0, 0, 0.9)',
//                   boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
//                   textAlign: 'center',
//                   color: '#fff',
//                 }}
//                 onClick={() => {
//                   setIsView(true);
//                   setIsDisable(false);
//                 }}
//               >
//                 <Box mt={10}>
//                   <Icon component={VisibilityOffIcon} fontSize={'large'} />
//                   <Typography mt={4}>Click to view mnemonic phrase</Typography>
//                   <Typography mt={1}>Please make sure no one can view your screen</Typography>
//                 </Box>
//               </div>
//             )}
//             <Box
//               onClick={() => {
//                 setIsView(false);
//               }}
//             >
//               <Card variant="outlined">
//                 <CardContent>
//                   {groupedArray.map((group, groupIndex) => (
//                     <Box key={groupIndex} display="flex" mb={1}>
//                       {group.map((item, itemIndex) => (
//                         <Box key={itemIndex} mr={2}>
//                           <Chip label={`${groupIndex * groupSize + itemIndex + 1}. ${item}`} style={{ width: 220 }} />
//                         </Box>
//                       ))}
//                     </Box>
//                   ))}
//                 </CardContent>
//               </Card>
//             </Box>
//           </Box>

//           <Box mt={16}>
//             <Button variant={'contained'} size={'large'} onClick={onClickReConfirm} disabled={isDisable}>
//               I have finished recording.
//             </Button>
//           </Box>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default PhraseBackup;

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useShallow } from 'zustand/react/shallow'

const PhraseBackup = () => {
  const router = useRouter()
  const [isDisable, setIsDisable] = useState<boolean>(true)
  const [isView, setIsView] = useState<boolean>(false)
  const [phrase, setPhrase] = useState<string[]>([])

  const { walletId, isWallet } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
      isWallet: state.isWallet,
    }))
  )

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

  const onClickReConfirm = () => {
    router.push('/wallet/phrase/backup/confirm')
  }

  const groupSize = 2
  const groupedArray = Array.from({ length: Math.ceil(phrase.length / groupSize) }, (_, index) =>
    phrase.slice(index * groupSize, index * groupSize + groupSize)
  )

  const init = async (isWallet: boolean, walletId: number) => {
    try {
      if (isWallet) {
        const response: any = await axios.get(Http.find_wallet_by_id, {
          params: { id: walletId },
        })

        if (response.result) {
          setPhrase(response.data.mnemonic.split(' '))
        } else {
          setSnackSeverity('error')
          setSnackMessage('Cannot find the wallet, please try again later.')
          setSnackOpen(true)
        }
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    if (!isStore) {
      router.push('/stores/create')
      return
    }
    init(isWallet, walletId)
  }, [isStore, isWallet, walletId])

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6 pt-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Please record the following mnemonic phrase.
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Connected devices may leak information. It is strongly recommended that you transcribe and
          securely store your mnemonic phrase as a backup.
        </p>

        <div className="relative w-full max-w-lg mt-6">
          {/* Overlay Mask */}
          {!isView && (
            <div
              onClick={() => {
                setIsView(true)
                setIsDisable(false)
              }}
              className="absolute inset-0 z-10 bg-gray-900/90 rounded-xl shadow-lg flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200 hover:bg-gray-900/95"
            >
              <svg
                className="w-10 h-10 mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.16 19.16 0 012.355-3.693M6.205 6.205A9.957 9.957 0 0112 5c7 0 10 7 10 7a19.14 19.14 0 01-2.35 3.68M3 3l18 18"
                />
              </svg>
              <p className="text-base font-semibold">Click to view mnemonic phrase</p>
              <p className="text-xs text-gray-300 mt-1">
                Please make sure no one can view your screen
              </p>
            </div>
          )}

          {/* Mnemonic Display Box */}
          <div
            onClick={() => setIsView(false)}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm cursor-pointer"
          >
            <div className="space-y-3">
              {groupedArray.map((group, groupIndex) => (
                <div key={groupIndex} className="flex gap-4">
                  {group.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="w-[220px] px-3 py-2 bg-gray-100 rounded-full text-center text-sm font-medium text-gray-700"
                    >
                      {`${groupIndex * groupSize + itemIndex + 1}. ${item}`}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-10">
          <button
            type="button"
            onClick={onClickReConfirm}
            disabled={isDisable}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
              isDisable
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md'
            }`}
          >
            I have finished recording.
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhraseBackup
