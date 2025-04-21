import { Box, Button, FormControl, OutlinedInput, Paper, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

const LoginCodes = () => {
  const [code, setCode] = useState<string>('');

  return (
    <Box>
      <Typography variant={'h6'}>Login Codes</Typography>
      <Typography mt={2}>
        Easily log into CryptoPay Server on another device using a simple login code from an already authenticated
        device.
      </Typography>

      <Box mt={6}>
        <Paper style={{ padding: 20 }}>
          <QRCodeSVG
            value={code}
            width={250}
            height={250}
            imageSettings={{
              src: '',
              width: 35,
              height: 35,
              excavate: false,
            }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginCodes;
