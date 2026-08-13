// import { Box, Button, Container, IconButton, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { useSnackPresistStore } from '@/lib/store/snack';
// import { Visibility, VisibilityOff } from '@mui/icons-material';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { useStorePresistStore, useWalletPresistStore } from '@/lib/store';
// import { isValidPassword } from '@/utils/verify';

// const SetPassword = () => {
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);
//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { getIsStore } = useStorePresistStore((state) => state);

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleClickShowPassword = () => setShowPassword((show) => !show);
//   const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

//   const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
//     event.preventDefault();
//   };

//   const onClickConfirm = async () => {
//     try {
//       if (
//         !password ||
//         !confirmPassword ||
//         !isValidPassword(password) ||
//         !isValidPassword(confirmPassword) ||
//         password != confirmPassword
//       ) {
//         setSnackSeverity('error');
//         setSnackMessage('Incorrect password input');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
//         wallet_id: getWalletId(),
//         password: password,
//       });
//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful update!');
//         setSnackOpen(true);

//         setTimeout(() => {
//           if (response.data.is_backup === 1) {
//             window.location.href = '/dashboard';
//           } else if (response.data.is_backup === 2) {
//             window.location.href = '/wallet/phrase/intro';
//           } else {
//             setSnackMessage('Input is wrong');
//             setSnackSeverity('error');
//             setSnackOpen(true);
//             return;
//           }
//         }, 2000);
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
//     <Box>
//       <Container>
//         <Stack mt={20}>
//           <Typography variant="h4">Setup wallet password</Typography>
//           <Typography mt={5}>
//             This password is used to unlock the wallet, we cannot restore this password for you.
//           </Typography>
//           <Typography mt={1}>
//             <Link href="#">learn more</Link>
//           </Typography>
//           <Box mt={4}>
//             <Typography>New password</Typography>
//             <Box mt={1}>
//               <TextField
//                 fullWidth
//                 type={showPassword ? 'text' : 'password'}
//                 size="small"
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//                 value={password}
//                 onChange={(e) => {
//                   setPassword(e.target.value);
//                 }}
//               />
//             </Box>
//           </Box>
//           <Box mt={4}>
//             <Typography>Confirm password</Typography>
//             <Box mt={1}>
//               <TextField
//                 fullWidth
//                 type={showConfirmPassword ? 'text' : 'password'}
//                 size="small"
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         onClick={handleClickShowConfirmPassword}
//                         onMouseDown={handleMouseDownPassword}
//                         edge="end"
//                       >
//                         {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//                 value={confirmPassword}
//                 onChange={(e) => {
//                   setConfirmPassword(e.target.value);
//                 }}
//               />
//             </Box>
//           </Box>

//           <Box mt={8}>
//             <Button variant={'contained'} size={'large'} onClick={onClickConfirm}>
//               Confirm
//             </Button>
//           </Box>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default SetPassword;

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSnackPresistStore } from '@/lib/store/snack'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { useStorePresistStore, useWalletPresistStore } from '@/lib/store'
import { isValidPassword } from '@/utils/verify'
import { useShallow } from 'zustand/react/shallow'

const SetPassword = () => {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { walletId } = useWalletPresistStore(
    useShallow((state) => ({
      walletId: state.walletId,
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

  const onClickConfirm = async () => {
    try {
      if (
        !password ||
        !confirmPassword ||
        !isValidPassword(password) ||
        !isValidPassword(confirmPassword) ||
        password !== confirmPassword
      ) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect password input')
        setSnackOpen(true)
        return
      }

      const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
        wallet_id: walletId,
        password: password,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful update!')
        setSnackOpen(true)

        setTimeout(() => {
          if (response.data.is_backup === 1) {
            router.push('/dashboard')
          } else if (response.data.is_backup === 2) {
            router.push('/wallet/phrase/intro')
          } else {
            setSnackMessage('Input is wrong')
            setSnackSeverity('error')
            setSnackOpen(true)
          }
        }, 2000)
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
    }
  }, [isStore])

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6 pt-10">
        <h1 className="text-3xl font-bold text-gray-900">Setup wallet password</h1>

        <div className="text-gray-600 space-y-1">
          <p>
            This password is used to unlock the wallet, we cannot restore this password for you.
          </p>
          <Link
            href="#"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
          >
            learn more
          </Link>
        </div>

        <div className="space-y-4 pt-2">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.16 19.16 0 012.355-3.693M6.205 6.205A9.957 9.957 0 0112 5c7 0 10 7 10 7a19.14 19.14 0 01-2.35 3.68M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-10-7-10-7a19.16 19.16 0 012.355-3.693M6.205 6.205A9.957 9.957 0 0112 5c7 0 10 7 10 7a19.14 19.14 0 01-2.35 3.68M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            type="button"
            onClick={onClickConfirm}
            className="px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all duration-200 shadow-sm"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetPassword
