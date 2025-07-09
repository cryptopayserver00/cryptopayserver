import { GitHub, RssFeed, Telegram } from '@mui/icons-material';
import { Box, Button, Container, IconButton, Link, Stack, TextField, Typography } from '@mui/material';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t, i18n } = useTranslation('');

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: 'center', md: 'left' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: { xs: '100%', sm: '60%' },
          }}
        >
          <Box sx={{ width: { xs: '100%', sm: '60%' } }}>
            <Stack direction={'row'} alignItems={'center'}>
              <CustomLogo>C</CustomLogo>
              <Typography fontWeight={'bold'} color="#0098e5" fontSize={'large'}>
                Crypto Pay Server
              </Typography>
            </Stack>

            <Typography gutterBottom sx={{ fontWeight: 600, mt: 4 }}>
              {t('Join the newsletter')}
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4 }}>
              {t('Subscribe for weekly updates. No spams ever!')}
            </Typography>
            <Typography>{t('Email')}</Typography>
            <Stack direction="row" spacing={1} useFlexGap mt={1}>
              <TextField
                hiddenLabel
                size="small"
                variant="outlined"
                fullWidth
                placeholder={t('Your email address')}
                // slotProps={{
                //   htmlInput: {
                //     autoComplete: 'off',
                //     'aria-label': 'Enter your email address',
                //   },
                // }}
                sx={{ width: '250px' }}
              />
              <Button variant="contained" color="primary" size="small" sx={{ flexShrink: 0 }}>
                {t('Subscribe')}
              </Button>
            </Stack>
          </Box>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 'medium' }}>{t('Software')}</Typography>
          <Link
            color="text.secondary"
            underline="hover"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/learn/introduction"
          >
            {t('Introduction')}
          </Link>
          <Link
            color="text.secondary"
            underline="hover"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/learn/use-case"
          >
            {t('Use Case')}
          </Link>
          <Link
            color="text.secondary"
            underline="hover"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/features/apps"
          >
            {t('Apps')}
          </Link>
          <Link
            color="text.secondary"
            underline="hover"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/getting-started/quickstart"
          >
            {t('Getting Started')}
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 'medium' }}>{t('Resources')}</Typography>
          <Link color="text.secondary" underline="hover" href="https://cryptopayserver.gitbook.io/cryptopayserver">
            {t('Documentation')}
          </Link>
          <Link color="text.secondary" underline="hover" href="https://github.com/cryptopayserver00/cryptopayserver">
            GitHub
          </Link>
          <Link
            color="text.secondary"
            underline="hover"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/support-and-community/support"
          >
            {t('Support')}
          </Link>
          <Link
            color="text.secondary"
            underline="hover"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/support-and-community/troubleshooting-an-issue-in-cryptopay-server"
          >
            {t('FAQ')}
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 'medium' }}>{t('Community')}</Typography>
          <Link color="text.secondary" underline="hover" href="https://cryptopayserver.gitbook.io/cryptopayserver">
            {t('Blog')}
          </Link>
          <Link color="text.secondary" underline="hover" href="https://t.me/cryptopayserver">
            {t('Chat')}
          </Link>
          <Link color="text.secondary" underline="hover" href="#">
            {t('Contribute')}
          </Link>
          <Link color="text.secondary" underline="hover" href="#">
            {t('Donate')}
          </Link>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pt: { xs: 4, sm: 8 },
          width: '100%',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Link color="text.secondary" href="#">
            {t('Privacy Policy')}
          </Link>
          <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>&nbsp;•&nbsp;</Typography>
          <Link color="text.secondary" href="#">
            {t('Terms of Service')}
          </Link>
          <Typography sx={{ color: 'text.secondary', mt: 1 }}>
            {t('Copyright')} ©
            <Link color="text.secondary" href="#">
              CryptoPayServer
            </Link>
            &nbsp;
            {new Date().getFullYear()}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ justifyContent: 'left', color: 'text.secondary' }}>
          <IconButton
            color="inherit"
            size="small"
            href="https://github.com/cryptopayserver00/cryptopayserver"
            aria-label="GitHub"
            sx={{ alignSelf: 'center' }}
          >
            <GitHub />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="https://t.me/cryptopayserver"
            aria-label="Telegram"
            sx={{ alignSelf: 'center' }}
          >
            <Telegram />
          </IconButton>
          <IconButton color="inherit" size="small" href="#" aria-label="RssFeed" sx={{ alignSelf: 'center' }}>
            <RssFeed />
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}
