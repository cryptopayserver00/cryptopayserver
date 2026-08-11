// import { Box, Button, Card, CardContent, Container, Icon, Stack, Typography } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { useEffect } from 'react';
// import { useSnackPresistStore } from '@/lib/store/snack';
// import { useStorePresistStore } from '@/lib/store';

// const PhraseIntro = () => {
//   const { getIsStore } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const onClickBackup = () => {
//     window.location.href = '/wallet/phrase/backup';
//   };

//   const onClickBackupLater = () => {
//     window.location.href = '/dashboard';
//   };

//   useEffect(() => {
//     if (!getIsStore()) {
//       window.location.href = '/stores/create';
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       <Container>
//         <Stack mt={20}>
//           <Typography variant="h4">
//             Before recording the mnemonic phrase, please remember the following security tips.
//           </Typography>

//           <Stack direction={'row'} mt={10}>
//             <Icon component={CheckCircleIcon} fontSize={'small'} color="success" />
//             <Typography pl={1}>The mnemonic phrase is the only way to recover wallet assets.</Typography>
//           </Stack>
//           <Stack direction={'row'} mt={5}>
//             <Icon component={CheckCircleIcon} fontSize={'small'} color="success" />
//             <Typography pl={1}>Do not share your mnemonic phrase with anyone.</Typography>
//           </Stack>
//           <Stack direction={'row'} mt={5}>
//             <Icon component={CheckCircleIcon} fontSize={'small'} color="success" />
//             <Typography pl={1}>Handwrite the mnemonic phrase and store it in a secure place.</Typography>
//           </Stack>
//         </Stack>

//         <Stack direction={'row'} mt={16}>
//           <Button variant={'contained'} size={'large'} onClick={onClickBackup}>
//             Back up the mnemonic phrase.
//           </Button>
//           <Button
//             variant={'contained'}
//             size={'large'}
//             color="error"
//             onClick={onClickBackupLater}
//             style={{ marginLeft: 10 }}
//           >
//             Backup later.
//           </Button>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default PhraseIntro;

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useStorePresistStore } from '@/lib/store'

const PhraseIntro = () => {
  const router = useRouter()
  const { getIsStore } = useStorePresistStore((state) => state)

  const onClickBackup = () => {
    router.push('/wallet/phrase/backup')
  }

  const onClickBackupLater = () => {
    router.push('/dashboard')
  }

  useEffect(() => {
    if (!getIsStore()) {
      router.push('/stores/create')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tips = [
    'The mnemonic phrase is the only way to recover wallet assets.',
    'Do not share your mnemonic phrase with anyone.',
    'Handwrite the mnemonic phrase and store it in a secure place.',
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 pt-10">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Before recording the mnemonic phrase, please remember the following security tips.
        </h1>

        <div className="space-y-4 pt-4">
          {tips.map((tip, idx) => (
            <div key={idx} className="flex items-center space-x-3 text-gray-700">
              <svg
                className="w-5 h-5 text-green-500 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-base font-medium">{tip}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-10">
          <button
            type="button"
            onClick={onClickBackup}
            className="px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm active:scale-95"
          >
            Back up the mnemonic phrase.
          </button>
          <button
            type="button"
            onClick={onClickBackupLater}
            className="px-6 py-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-sm active:scale-95"
          >
            Backup later.
          </button>
        </div>
      </div>
    </div>
  )
}

export default PhraseIntro
