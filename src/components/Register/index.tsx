// import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
// import { CustomLogo } from '@/components/Logo/CustomLogo';
// import { useSnackPresistStore } from '@/lib/store/snack';
// import { useEffect, useState } from 'react';
// import axios from '@/utils/http/axios';
// import { Http } from '@/utils/http/http';
// import { useRouter } from 'next/router';
// import { useUserPresistStore } from '@/lib/store';
// import { isValidPassword, IsValidEmail } from '@/utils/verify';

// const Register = () => {
//   const router = useRouter();

//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');
//   const [confirmPassword, setConfirmPassword] = useState<string>('');

//   const { getIsLogin } = useUserPresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const onRegister = async () => {
//     try {
//       if (!email || email === '' || !IsValidEmail(email)) {
//         setSnackSeverity('error');
//         setSnackMessage('Incorrect email input');
//         setSnackOpen(true);
//         return;
//       }

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

//       const response: any = await axios.get(Http.find_user_by_email, {
//         params: {
//           email: email,
//         },
//       });
//       if (response.result) {
//         setSnackSeverity('error');
//         setSnackMessage('User already exists!');
//         setSnackOpen(true);
//         return;
//       }

//       // create user
//       const create_user_resp: any = await axios.post(Http.create_user, {
//         email: email,
//         password: password,
//       });
//       if (create_user_resp.result) {
//         setSnackSeverity('success');
//         setSnackMessage('Successful creation!');
//         setSnackOpen(true);
//         setTimeout(() => {
//           window.location.href = '/login';
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
//     const enterEmail = router.query.email;
//     if (enterEmail) {
//       setEmail(enterEmail as string);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [router.query]);

//   useEffect(() => {
//     if (getIsLogin()) {
//       window.location.href = '/dashboard';
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       <Container>
//         <Stack alignItems={'center'} mt={8}>
//           <CustomLogo style={{ width: 50, height: 50 }}>C</CustomLogo>
//           <Typography variant="h5" fontWeight={'bold'} mt={4}>
//             Welcome to your CryptoPay Server
//           </Typography>
//           <Typography mt={2}>
//             A self-hosted, open-source crypto payment processor. It is secure, private, censorship-resistant and free.
//           </Typography>

//           <Card sx={{ minWidth: 450, mt: 4, padding: 2 }}>
//             <CardContent>
//               <Typography variant="h5">Create account</Typography>
//               <Box mt={3}>
//                 <Typography>Email</Typography>
//                 <Box mt={1}>
//                   <TextField
//                     fullWidth
//                     hiddenLabel
//                     size="small"
//                     value={email}
//                     onChange={(e) => {
//                       setEmail(e.target.value);
//                     }}
//                   />
//                 </Box>
//               </Box>
//               <Box mt={3}>
//                 <Typography>Password</Typography>
//                 <Box mt={1}>
//                   <TextField
//                     fullWidth
//                     hiddenLabel
//                     type={'password'}
//                     size="small"
//                     value={password}
//                     onChange={(e) => {
//                       setPassword(e.target.value);
//                     }}
//                   />
//                 </Box>
//               </Box>
//               <Box mt={3}>
//                 <Typography>Confirm Password</Typography>
//                 <Box mt={1}>
//                   <TextField
//                     fullWidth
//                     hiddenLabel
//                     type={'password'}
//                     size="small"
//                     value={confirmPassword}
//                     onChange={(e) => {
//                       setConfirmPassword(e.target.value);
//                     }}
//                   />
//                 </Box>
//               </Box>
//               <Box mt={3}>
//                 <Button fullWidth variant={'contained'} size={'large'} onClick={onRegister}>
//                   Create account
//                 </Button>
//               </Box>

//               <Box mt={2} textAlign={'center'}>
//                 <Button
//                   size={'large'}
//                   fullWidth
//                   onClick={() => {
//                     window.location.href = '/login';
//                   }}
//                 >
//                   Log in
//                 </Button>
//               </Box>
//             </CardContent>
//           </Card>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default Register;

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

// Shadcn UI 组件
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { CustomLogo } from '@/components/Logo/CustomLogo'
import { useSnackPresistStore } from '@/lib/store/snack'
import { useUserPresistStore } from '@/lib/store'
import axios from '@/utils/http/axios'
import { Http } from '@/utils/http/http'
import { isValidPassword, IsValidEmail } from '@/utils/verify'

const Register = () => {
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { getIsLogin } = useUserPresistStore((state) => state)
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state)

  const onRegister = async () => {
    try {
      if (!email || email === '' || !IsValidEmail(email)) {
        setSnackSeverity('error')
        setSnackMessage('Incorrect email input')
        setSnackOpen(true)
        return
      }

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

      setIsLoading(true)

      const response: any = await axios.get(Http.find_user_by_email, {
        params: {
          email: email,
        },
      })
      if (response.result) {
        setSnackSeverity('error')
        setSnackMessage('User already exists!')
        setSnackOpen(true)
        setIsLoading(false)
        return
      }

      // create user
      const create_user_resp: any = await axios.post(Http.create_user, {
        email: email,
        password: password,
      })
      if (create_user_resp.result) {
        setSnackSeverity('success')
        setSnackMessage('Successful creation!')
        setSnackOpen(true)
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setIsLoading(false)
      }
    } catch (e) {
      setIsLoading(false)
      setSnackSeverity('error')
      setSnackMessage('The network error occurred. Please try again later.')
      setSnackOpen(true)
      console.error(e)
    }
  }

  useEffect(() => {
    const enterEmail = router.query.email
    if (enterEmail) {
      setEmail(enterEmail as string)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query])

  useEffect(() => {
    if (getIsLogin()) {
      window.location.href = '/dashboard'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onRegister()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        {/* Logo 与 欢迎语 */}
        <div className="flex flex-col items-center text-center space-y-3">
          <CustomLogo style={{ width: 50, height: 50 }}>C</CustomLogo>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to your CryptoPay Server
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            A self-hosted, open-source crypto payment processor. It is secure, private,
            censorship-resistant and free.
          </p>
        </div>

        {/* 注册表单卡片 */}
        <Card className="w-full shadow-lg border">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Create account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <Button size="lg" className="w-full" onClick={onRegister} disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Register
