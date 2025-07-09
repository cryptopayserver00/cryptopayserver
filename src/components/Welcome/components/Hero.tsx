import { Typography, TextField, Stack, Link, Container, Button, Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { IsValidEmail } from 'utils/verify';
import { useUserPresistStore } from 'lib/store';
import { useTranslation } from 'react-i18next';
import TokenDataGrid from 'components/DataList/TokenDataGrid';

export default function Hero() {
  const { t, i18n } = useTranslation('');

  const [email, setEmail] = useState<string>('');

  const [isLogin, setLogin] = useState<boolean>(false);

  const { getIsLogin } = useUserPresistStore((state) => state);

  useEffect(() => {
    const loginStatus = getIsLogin();
    setLogin(loginStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: '100%',
        backgroundRepeat: 'no-repeat',

        backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)',
        ...theme.applyStyles('dark', {
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)',
        }),
      })}
    >
      <Container
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack spacing={2} useFlexGap sx={{ alignItems: 'center', width: { xs: '100%', sm: '70%' } }}>
          <Typography
            variant="h1"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(3rem, 10vw, 3.5rem)',
            }}
          >
            Crypto&nbsp;Pay&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: 'inherit',
                color: 'primary.main',
                ...theme.applyStyles('dark', {
                  color: 'primary.light',
                }),
              })}
            >
              server
            </Typography>
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              width: { sm: '100%', md: '80%' },
            }}
          >
            {t('Accept Crypto payments. Free, open-source & self-hosted, Crypto payment processor.')}
          </Typography>

          <Box mt={2}>
            {isLogin ? (
              <Button
                variant="contained"
                color="primary"
                sx={{ minWidth: 'fit-content' }}
                onClick={() => {
                  window.location.href = `/dashboard`;
                }}
              >
                {t('Go to dashboard')}
              </Button>
            ) : (
              <>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  useFlexGap
                  sx={{ pt: 2, width: { xs: '100%', sm: '350px' } }}
                  mb={1}
                >
                  <TextField
                    hiddenLabel
                    size="small"
                    variant="outlined"
                    placeholder={t('Your email address')}
                    fullWidth
                    value={email}
                    onChange={(e: any) => {
                      setEmail(e.target.value);
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ minWidth: 'fit-content' }}
                    onClick={() => {
                      if (email && IsValidEmail(email)) {
                        window.location.href = `/register?email=${email}`;
                      }
                    }}
                  >
                    {t('Start now')}
                  </Button>
                </Stack>
                <Typography variant="caption" color="#000" sx={{ textAlign: 'center' }}>
                  {t('By clicking "Start now" you agree to our')}
                  <Link href="#" color="primary">
                    {t('Terms & Conditions')}
                  </Link>
                  .
                </Typography>
              </>
            )}
          </Box>
        </Stack>
        <Box mt={10}>
          <TokenDataGrid source={'dashboard'} />
        </Box>
      </Container>
    </Box>
  );
}
