// import { Box, Button, FormControl, OutlinedInput, Paper, Stack, Typography } from '@mui/material';
// import { QRCodeSVG } from 'qrcode.react';
// import { useState } from 'react';

// const LoginCodes = () => {
//   const [code, setCode] = useState<string>('');

//   return (
//     <Box>
//       <Typography variant={'h6'}>Login Codes</Typography>
//       <Typography mt={2}>
//         Easily log into CryptoPay Server on another device using a simple login code from an already authenticated
//         device.
//       </Typography>

//       <Box mt={6}>
//         <Paper style={{ padding: 20 }}>
//           <QRCodeSVG
//             value={code}
//             width={250}
//             height={250}
//             imageSettings={{
//               src: '',
//               width: 35,
//               height: 35,
//               excavate: false,
//             }}
//           />
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default LoginCodes;

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const LoginCodes = () => {
  const [code, setCode] = useState<string>('')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Login Codes</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Easily log into CryptoPay Server on another device using a simple login code from an
          already authenticated device.
        </p>
      </div>

      {/* QR Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Scan to login
          </CardTitle>
          <CardDescription>
            Open the CryptoPay app on your other device and scan this QR code to authenticate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="inline-flex rounded-xl border bg-white p-5 shadow-sm">
            <QRCodeSVG
              value={code}
              width={220}
              height={220}
              imageSettings={{
                src: '',
                width: 35,
                height: 35,
                excavate: false,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginCodes
