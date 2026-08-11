// import { Box, Button, Stack, TextField, Typography } from '@mui/material';
// import Link from 'next/link';

// const AccessToken = () => {
//   return (
//     <Box>
//       <Box>
//         <Typography variant="h6">Greenfield API Keys</Typography>
//         <Typography mt={2}>
//           To generate Greenfield API keys, please <Link href={'/account?tab=apikeys'}>click here.</Link>
//         </Typography>
//       </Box>

//       <Box mt={5}>
//         <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//           <Typography variant="h6">Access Tokens</Typography>
//           <Button variant={'contained'} size="large">
//             Create Token
//           </Button>
//         </Stack>
//         <Typography mt={2}>Authorize a public key to access Bitpay compatible Invoice API.</Typography>
//         <Typography mt={3} fontSize={14}>
//           No access tokens yet.
//         </Typography>
//       </Box>

//       <Box mt={5}>
//         <Typography variant="h6">Legacy API Keys</Typography>
//         <Typography mt={2}>
//           Alternatively, you can use the invoice API by including the following HTTP Header in your requests:
//         </Typography>
//         <Typography mt={2} fontSize={14} fontWeight={'bold'}>
//           Authorization: Basic *API Key*
//         </Typography>

//         <Box mt={3}>
//           <Typography>API Key</Typography>
//           <Stack direction={'row'} alignItems={'center'} gap={2} mt={1}>
//             <TextField fullWidth hiddenLabel disabled size="small" />
//             <Button variant={'contained'} size="large">
//               Generate
//             </Button>
//           </Stack>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default AccessToken;

import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const AccessToken = () => {
  return (
    <div className="space-y-10">
      {/* Greenfield API Keys 说明 */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Greenfield API Keys
        </h3>
        <p className="text-sm text-muted-foreground">
          To generate Greenfield API keys, please{' '}
          <Link href="/account?tab=apikeys" className="text-primary underline hover:opacity-80">
            click here.
          </Link>
        </p>
      </div>

      {/* Access Tokens */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">Access Tokens</h3>
          <Button size="lg">Create Token</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Authorize a public key to access Bitpay compatible Invoice API.
        </p>
        <p className="text-sm text-muted-foreground font-medium">No access tokens yet.</p>
      </div>

      {/* Legacy API Keys */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Legacy API Keys</h3>
        <p className="text-sm text-muted-foreground">
          Alternatively, you can use the invoice API by including the following HTTP Header in your
          requests:
        </p>
        <p className="text-sm font-bold font-mono bg-muted p-2.5 rounded-md inline-block">
          Authorization: Basic *API Key*
        </p>

        <div className="space-y-2 max-w-xl pt-2">
          <Label htmlFor="legacy-api-key">API Key</Label>
          <div className="flex items-center gap-3">
            <Input
              id="legacy-api-key"
              disabled
              placeholder="Generate key to view..."
              className="font-mono"
            />
            <Button size="lg" className="shrink-0">
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessToken
