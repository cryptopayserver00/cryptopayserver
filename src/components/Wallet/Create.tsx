import { Box, Button, Card, CardContent, Container, Icon, Stack, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useEffect } from 'react';
import { useStorePresistStore } from 'lib/store';

const CreateWallet = () => {
  const { getIsStore } = useStorePresistStore((state) => state);

  const onClickImport = () => {
    window.location.href = '/wallet/import';
  };

  const onClickGenerate = () => {
    window.location.href = '/wallet/generate';
  };

  useEffect(() => {
    if (!getIsStore()) {
      window.location.href = '/stores/create';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Stack alignItems={'center'} mt={20}>
          <Typography variant="h4">Let&apos;s get started</Typography>
          <Box mt={8}>
            <Typography variant="h5">I don&apos;t have a wallet</Typography>
            <Box mt={2}>
              <Button onClick={onClickGenerate}>
                <Card sx={{ width: 700, padding: 2 }}>
                  <CardContent>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                      <Stack direction={'row'} alignItems={'center'}>
                        <Icon component={AddCircleOutlineIcon} fontSize={'large'} />
                        <Typography variant="h5" ml={5}>
                          Create a new wallet
                        </Typography>
                      </Stack>
                      <Icon component={ChevronRightIcon} fontSize={'large'} />
                    </Stack>
                  </CardContent>
                </Card>
              </Button>
            </Box>
          </Box>

          <Box mt={8}>
            <Typography variant="h5">I have a wallet</Typography>
            <Box mt={2}>
              <Button onClick={onClickImport}>
                <Card sx={{ width: 700, padding: 2 }}>
                  <CardContent>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                      <Stack direction={'row'} alignItems={'center'}>
                        <Icon component={AccountBalanceWalletIcon} fontSize={'large'} />
                        <Typography variant="h5" ml={5}>
                          Connect an existing wallet
                        </Typography>
                      </Stack>
                      <Icon component={ChevronRightIcon} fontSize={'large'} />
                    </Stack>
                  </CardContent>
                </Card>
              </Button>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default CreateWallet;
