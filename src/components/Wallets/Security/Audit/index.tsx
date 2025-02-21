import { Box, Button, Card, CardContent, CardHeader, Container, Icon, Stack, Typography } from '@mui/material';
import { VerifiedUser, AccountBalance, Code, GitHub } from '@mui/icons-material';

const SecurityAudit = () => {
  return (
    <Box>
      <Container>
        <Typography variant="h6">Security Audit</Typography>

        <Box mt={4} textAlign={'center'}>
          <Typography variant="h4">Trust comes from transparency</Typography>
          <Typography variant="h4" mt={1}>
            Web3 assets are in your control
          </Typography>
          <Typography mt={4}>
            Comprehensive third-party audit, extensive open source code, and jointly build web3 security
          </Typography>
        </Box>

        <Stack direction={'row'} alignItems={'center'} mt={10} gap={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'center'}>
                <Icon component={VerifiedUser}></Icon>
                <Typography variant="h5" ml={1}>
                  Multi-party audit
                </Typography>
              </Stack>
              <Typography mt={2}>
                Crypto Pay Server wallets are regularly reviewed by reputable security auditing companies to ensure
                asset security
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'center'}>
                <Icon component={AccountBalance}></Icon>
                <Typography variant="h5" ml={1}>
                  Self-management
                </Typography>
              </Stack>

              <Typography mt={2}>
                The wallet private keys and assets are completely under your control, and security and privacy are at
                the heart of our
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'center'}>
                <Icon component={Code}></Icon>
                <Typography variant="h5" ml={1}>
                  Open source code
                </Typography>
              </Stack>

              <Typography mt={2}>
                Multi-terminal code open source, technical details are freely viewed and audited, open and transparent
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        <Box mt={4}>
          <Typography variant="h6">Open source code</Typography>
          <Typography mt={2}>
            The wallet has completed open source of core code, including core algorithms such as mnemonics, private
            keys, transaction routing, etc., which have been widely verified by the technical community.
          </Typography>
          <Box mt={4}>
            <Button
              variant={'contained'}
              startIcon={<GitHub />}
              onClick={() => {
                window.location.href = 'https://github.com/cryptopayserver00/cryptopayserver';
              }}
            >
              Go to CryptoPayServer GitHub
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SecurityAudit;
