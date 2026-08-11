// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Container,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogContentText,
//   DialogTitle,
//   Icon,
//   IconButton,
//   InputAdornment,
//   Stack,
//   TextField,
//   Typography,
// } from '@mui/material';
// import { useSnackPresistStore, useWalletPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { TaskAlt, Close, VisibilityOff, Visibility } from '@mui/icons-material';
// import { isValidPassword } from '@/utils/verify';

// const ManagePassword = () => {
//   const [password, setPassword] = useState<string>('');
//   const [isPassword, setIsPassword] = useState<boolean>(false);
//   const [openDeletePassword, setOpenDeletePassword] = useState<boolean>(false);
//   const [openSetPassword, setOpenSetPassword] = useState<boolean>(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const { getWalletId } = useWalletPresistStore((state) => state);
//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const handleClickShowPassword = () => setShowPassword((show) => !show);
//   const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
//     event.preventDefault();
//   };

//   const handleDeletePasswordOpen = () => {
//     setOpenDeletePassword(true);
//   };

//   const handleDeletePasswordClose = () => {
//     setOpenDeletePassword(false);
//   };

//   const handleSetPasswordOpen = () => {
//     setOpenSetPassword(true);
//   };

//   const handleSetPasswordClose = () => {
//     setOpenSetPassword(false);
//   };

//   const onClickDeletePassword = async () => {
//     const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
//       wallet_id: getWalletId(),
//       password: '',
//     });
//     if (response.result) {
//       setSnackSeverity('success');
//       setSnackMessage('Successful update!');
//       setSnackOpen(true);

//       await init();

//       handleDeletePasswordClose();
//     }
//   };

//   const onClickSetPassword = async () => {
//     try {
//       if (!password || !isValidPassword(password)) {
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

//         await init();

//         handleSetPasswordClose();
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   const init = async () => {
//     setPassword('');

//     try {
//       const response: any = await axios.get(Http.find_wallet_by_id, {
//         params: {
//           id: getWalletId(),
//         },
//       });

//       if (response.result && response.data.password !== '') {
//         setIsPassword(true);
//       } else {
//         setIsPassword(false);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     }
//   };

//   useEffect(() => {
//     init();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       <Container>
//         <Typography variant="h6">Payment Password</Typography>

//         <Box mt={4}>
//           <Card>
//             <CardContent>
//               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//                 <Typography fontWeight={'bold'}>Detect Password Binding Status</Typography>
//                 {isPassword ? (
//                   <Icon component={TaskAlt} color={'success'} />
//                 ) : (
//                   <Icon component={Close} color={'error'} />
//                 )}
//               </Stack>

//               <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} mt={2}>
//                 <Typography fontWeight={'bold'}>Operate</Typography>
//                 {isPassword ? (
//                   <Button variant={'contained'} color="error" onClick={handleDeletePasswordOpen}>
//                     Delete Password
//                   </Button>
//                 ) : (
//                   <Button variant={'contained'} onClick={handleSetPasswordOpen} color="success">
//                     Set Password
//                   </Button>
//                 )}
//               </Stack>
//             </CardContent>
//           </Card>
//         </Box>
//       </Container>

//       <Dialog
//         open={openDeletePassword}
//         onClose={handleDeletePasswordClose}
//         aria-labelledby="alert-dialog-title"
//         aria-describedby="alert-dialog-description"
//       >
//         <DialogTitle id="alert-dialog-title">Are you sure you want to delete your password?</DialogTitle>
//         <DialogContent>
//           <DialogContentText id="alert-dialog-description">
//             If you delete your password, you will no longer need password support during the payment process, which may
//             raise a range of security risks.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDeletePasswordClose}>Disagree</Button>
//           <Button onClick={onClickDeletePassword} autoFocus>
//             Agree
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={openSetPassword} onClose={handleSetPasswordClose}>
//         <DialogTitle>Set Password</DialogTitle>
//         <DialogContent>
//           <DialogContentText>Setting up complex passwords can protect your assets.</DialogContentText>
//           <TextField
//             autoFocus
//             required
//             margin="dense"
//             type={showPassword ? 'text' : 'password'}
//             fullWidth
//             variant="standard"
//             value={password}
//             onChange={(e: any) => {
//               setPassword(e.target.value);
//             }}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
//                     {showPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleSetPasswordClose}>Cancel</Button>
//           <Button onClick={onClickSetPassword}>Confirm</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default ManagePassword;

'use client'

import { useEffect, useState } from 'react'
import { Check, Eye, EyeOff, X } from 'lucide-react'

import { useSnackPresistStore, useWalletPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { isValidPassword } from '@/utils/verify'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

const ManagePassword = () => {
  const [password, setPassword] = useState<string>('')
  const [isPassword, setIsPassword] = useState<boolean>(false)
  const [openDeletePassword, setOpenDeletePassword] = useState<boolean>(false)
  const [openSetPassword, setOpenSetPassword] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)

  const { getWalletId } = useWalletPresistStore((state) => state)
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state)

  const showSnack = (severity: 'success' | 'error', message: string) => {
    setSnackSeverity(severity)
    setSnackMessage(message)
    setSnackOpen(true)
  }

  const onClickDeletePassword = async () => {
    const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
      wallet_id: getWalletId(),
      password: '',
    })
    if (response.result) {
      showSnack('success', 'Successful update!')
      await init()
      setOpenDeletePassword(false)
    }
  }

  const onClickSetPassword = async () => {
    try {
      if (!password || !isValidPassword(password)) {
        showSnack('error', 'Incorrect password input')
        return
      }

      const response: any = await axios.put(Http.update_pwd_by_wallet_id, {
        wallet_id: getWalletId(),
        password: password,
      })
      if (response.result) {
        showSnack('success', 'Successful update!')
        await init()
        setOpenSetPassword(false)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  const init = async () => {
    setPassword('')

    try {
      const response: any = await axios.get(Http.find_wallet_by_id, {
        params: {
          id: getWalletId(),
        },
      })

      if (response.result && response.data.password !== '') {
        setIsPassword(true)
      } else {
        setIsPassword(false)
      }
    } catch (e) {
      showSnack('error', 'The network error occurred. Please try again later.')
      console.error(e)
    }
  }

  useEffect(() => {
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <div className="mx-auto max-w-screen-lg px-4">
        <h2 className="text-lg font-semibold">Payment Password</h2>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Detect Password Binding Status</span>
              {isPassword ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold">Operate</span>
              {isPassword ? (
                <Button variant="destructive" onClick={() => setOpenDeletePassword(true)}>
                  Delete Password
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => setOpenSetPassword(true)}
                >
                  Set Password
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 删除密码确认 */}
      <AlertDialog open={openDeletePassword} onOpenChange={setOpenDeletePassword}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete your password?</AlertDialogTitle>
            <AlertDialogDescription>
              If you delete your password, you will no longer need password support during the
              payment process, which may raise a range of security risks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant={''} size={''}>
              Disagree
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onClickDeletePassword}
              variant={''}
              size={''}
            >
              Agree
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 设置密码 */}
      <Dialog open={openSetPassword} onOpenChange={setOpenSetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Password</DialogTitle>
            <DialogDescription>
              Setting up complex passwords can protect your assets.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Input
              autoFocus
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onClickSetPassword()
              }}
              className="pr-10"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((show) => !show)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSetPassword(false)}>
              Cancel
            </Button>
            <Button onClick={onClickSetPassword}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ManagePassword
