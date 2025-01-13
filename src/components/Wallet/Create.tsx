import { Box, Card, CardContent, Container, Icon, Stack, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const CreateWallet = () => {
  const onClickImport = () => {
    window.location.href = '/wallet/import';
  };

  const onClickGenerate = () => {
    window.location.href = '/wallet/generate';
  };

  return (
    <Box>
      <Container>
        <Stack alignItems={'center'} mt={20}>
          <Typography variant="h4">Let&apos;s get started</Typography>
          <Box mt={8}>
            <Typography variant="h5">I don&apos;t have a wallet</Typography>
            <div onClick={onClickGenerate} style={{ marginTop: 26 }}>
              <Card sx={{ width: 750, padding: 2 }}>
                <CardContent>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AddCircleOutlineIcon} fontSize={'large'} />
                      <Box ml={5}>
                        <Typography variant="h5">Create a new wallet</Typography>
                        <Typography mt={1}>Generate a brand-new wallet to use</Typography>
                      </Box>
                    </Stack>
                    <Icon component={ChevronRightIcon} fontSize={'large'} />
                  </Stack>
                </CardContent>
              </Card>
            </div>
          </Box>
          <Box mt={10}>
            <Typography variant="h5">I have a wallet</Typography>
            <div onClick={onClickImport} style={{ marginTop: 26 }}>
              <Card sx={{ width: 750, padding: 2 }}>
                <CardContent>
                  <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                    <Stack direction={'row'} alignItems={'center'}>
                      <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
                      <Box ml={5}>
                        <Typography variant="h5">Connect an existing wallet</Typography>
                        <Typography mt={1}>Import an existing hardware or software wallet</Typography>
                      </Box>
                    </Stack>
                    <Icon component={ChevronRightIcon} fontSize={'large'} />
                  </Stack>
                </CardContent>
              </Card>
            </div>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CreateWallet;
