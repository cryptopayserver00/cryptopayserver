// import { Box, Button, FormControl, OutlinedInput, Stack, Typography } from '@mui/material';
// import { useSnackPresistStore, useUserPresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { isValidPassword } from '@/utils/verify';

// const Password = () => {
//   const [oldPwd, setOldPwd] = useState<string>('');
//   const [newPwd, setNewPwd] = useState<string>('');
//   const [confirmNewPwd, setConfirmNewPwd] = useState<string>('');

//   const { getUserEmail } = useUserPresistStore((state) => state);
//   const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

//   const onClickUpdatePassword = async () => {
//     try {
//       if (
//         !oldPwd ||
//         !newPwd ||
//         !confirmNewPwd ||
//         newPwd !== confirmNewPwd ||
//         oldPwd === newPwd ||
//         !isValidPassword(oldPwd) ||
//         !isValidPassword(newPwd) ||
//         !isValidPassword(confirmNewPwd)
//       ) {
//         setSnackSeverity('error');
//         setSnackMessage('Please confirm the input content!');
//         setSnackOpen(true);
//         return;
//       }

//       const response: any = await axios.put(Http.update_user_password_by_email, {
//         email: getUserEmail(),
//         old_password: oldPwd,
//         new_password: newPwd,
//       });

//       if (response.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Update successful!');
//         setSnackOpen(true);
//       } else {
//         setSnackSeverity('error');
//         setSnackMessage('Update failed!');
//         setSnackOpen(true);
//       }
//     } catch (e) {
//       setSnackSeverity('error');
//       setSnackMessage('The network error occurred. Please try again later.');
//       setSnackOpen(true);
//       console.error(e);
//     } finally {
//       clearData();
//     }
//   };

//   const clearData = () => {
//     setOldPwd('');
//     setNewPwd('');
//     setConfirmNewPwd('');
//   };

//   return (
//     <Box>
//       <Typography variant={'h6'}>Change your password</Typography>
//       <Box mt={4}>
//         <Typography>Current password</Typography>
//         <Box mt={1}>
//           <FormControl variant="outlined" fullWidth>
//             <OutlinedInput
//               size={'small'}
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               type={'password'}
//               value={oldPwd}
//               onChange={(e: any) => {
//                 setOldPwd(e.target.value);
//               }}
//             />
//           </FormControl>
//         </Box>
//       </Box>

//       <Box mt={4}>
//         <Typography>New password</Typography>
//         <Box mt={1}>
//           <FormControl variant="outlined" fullWidth>
//             <OutlinedInput
//               size={'small'}
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               type={'password'}
//               value={newPwd}
//               onChange={(e: any) => {
//                 setNewPwd(e.target.value);
//               }}
//             />
//           </FormControl>
//         </Box>
//       </Box>

//       <Box mt={4}>
//         <Typography>Confirm new password</Typography>
//         <Box mt={1}>
//           <FormControl variant="outlined" fullWidth>
//             <OutlinedInput
//               size={'small'}
//               aria-describedby="outlined-weight-helper-text"
//               inputProps={{
//                 'aria-label': 'weight',
//               }}
//               type={'password'}
//               value={confirmNewPwd}
//               onChange={(e: any) => {
//                 setConfirmNewPwd(e.target.value);
//               }}
//             />
//           </FormControl>
//         </Box>
//       </Box>

//       <Box mt={5}>
//         <Button variant={'contained'} size={'large'} onClick={onClickUpdatePassword} color={'success'}>
//           Update Password
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Password;

import { useState } from 'react'
import { Eye, EyeOff, Lock, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSnackPresistStore, useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { isValidPassword } from '@/utils/verify'
import { useShallow } from 'zustand/react/shallow'

const Password = () => {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmNewPwd, setConfirmNewPwd] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const { userEmail } = useUserPresistStore(
    useShallow((state) => ({
      userEmail: state.userEmail,
    }))
  )

  const { setSnackSeverity, setSnackMessage, setSnackOpen } = useSnackPresistStore(
    useShallow((state) => ({
      setSnackSeverity: state.setSnackSeverity,
      setSnackMessage: state.setSnackMessage,
      setSnackOpen: state.setSnackOpen,
    }))
  )

  const onClickUpdatePassword = async () => {
    try {
      if (
        !oldPwd ||
        !newPwd ||
        !confirmNewPwd ||
        newPwd !== confirmNewPwd ||
        oldPwd === newPwd ||
        !isValidPassword(oldPwd) ||
        !isValidPassword(newPwd) ||
        !isValidPassword(confirmNewPwd)
      ) {
        setSnackSeverity('error')
        setSnackMessage('Please confirm the input content!')
        setSnackOpen(true)
        return
      }

      setIsUpdating(true)

      const response: any = await axios.put(Http.update_user_password_by_email, {
        email: userEmail,
        old_password: oldPwd,
        new_password: newPwd,
      })

      if (response.result) {
        setSnackSeverity('success')
        setSnackMessage('Update successful!')
        setSnackOpen(true)
      } else {
        setSnackSeverity('error')
        setSnackMessage('Update failed!')
        setSnackOpen(true)
      }
    } catch (e) {
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    } finally {
      setIsUpdating(false)
      clearData()
    }
  }

  const clearData = () => {
    setOldPwd('')
    setNewPwd('')
    setConfirmNewPwd('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Change your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ensure your account is using a strong and unique password
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Password
          </CardTitle>
          <CardDescription>Enter your current password and choose a new one</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current password */}
          <div className="space-y-2">
            <Label htmlFor="old-password">Current password</Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOld ? 'text' : 'password'}
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmNewPwd}
                onChange={(e) => setConfirmNewPwd(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmNewPwd && newPwd !== confirmNewPwd && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <div className="pt-2">
            <Button onClick={onClickUpdatePassword} disabled={isUpdating} className="gap-2">
              <Lock className="h-4 w-4" />
              {isUpdating ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Password
