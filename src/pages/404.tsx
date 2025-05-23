import { Box, Button, Container, Stack, Typography } from '@mui/material';
import MetaTags from 'components/Common/MetaTags';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { useTranslation } from 'react-i18next';

const Custom404 = () => {
  const { t, i18n } = useTranslation('');

  const onClickButton = async () => {
    window.location.href = '/';
  };

  return (
    <>
      <MetaTags title="Not found" />
      <Container>
        <Box mt={20}>
          <Button
            style={{ padding: 0 }}
            onClick={() => {
              window.location.href = '/dashboard';
            }}
          >
            <Stack direction={'row'} alignItems={'center'}>
              <CustomLogo>C</CustomLogo>
              <Typography fontWeight={'bold'} color="#0098e5" fontSize={'large'}>
                Crypto Pay
              </Typography>
            </Stack>
          </Button>

          <Stack mt={4} direction={'row'} alignItems={'center'}>
            <Typography fontWeight={'bold'}>404.</Typography>
            <Typography ml={1}>That&apos;s an error.</Typography>
          </Stack>

          <Box mt={4}>
            <Typography>The requested URL was not found on this server. That&apos;s all we know.</Typography>
          </Box>

          <Box mt={6}>
            <Button variant={'contained'} onClick={onClickButton} size="large">
              Go Home
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default Custom404;
