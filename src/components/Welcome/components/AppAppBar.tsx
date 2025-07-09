import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Container,
  Divider,
  MenuItem,
  Drawer,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import ColorModeIconDropdown from './ColorModeIconDropdown';
import { useEffect, useState } from 'react';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { useUserPresistStore } from 'lib/store';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from 'packages/constants';
import { CloseRounded, Menu } from '@mui/icons-material';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: 'blur(24px)',
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: '8px 12px',
}));

export default function AppAppBar() {
  const { t, i18n } = useTranslation('');
  const [open, setOpen] = useState(false);

  const [isLogin, setLogin] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('');

  const { getIsLogin, getLang, setLang } = useUserPresistStore((state) => state);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  useEffect(() => {
    const loginStatus = getIsLogin();
    setLogin(loginStatus);
    if (getLang() && getLang() !== '') {
      setLanguage(LANGUAGES.find((item) => item.code === String(getLang()))?.name || 'English');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeLanguage = async (lang: string) => {
    setLanguage(lang);
    const code = LANGUAGES.find((item) => item.name === lang)?.code;
    setLang(code || 'en');
    i18n.changeLanguage(code || 'en');
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        mt: 'calc(var(--template-frame-height, 0px) + 28px)',
      }}
    >
      <Container>
        <StyledToolbar variant="dense" disableGutters>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'}>
            <Button
              style={{ width: 200, justifyContent: 'left' }}
              onClick={() => {
                window.location.href = '/';
              }}
            >
              <Stack direction={'row'} alignItems={'center'}>
                <CustomLogo>C</CustomLogo>
                <Typography fontWeight={'bold'} color="#0098e5" fontSize={16}>
                  CryptoPay
                </Typography>
              </Stack>
            </Button>
            <Stack direction={'row'} sx={{ display: { xs: 'none', md: 'flex' } }} gap={2}>
              <Button
                style={{ width: 100 }}
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#features';
                }}
              >
                {t('Features')}
              </Button>
              <Button
                style={{ width: 100 }}
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#highlights';
                }}
              >
                {t('Highlights')}
              </Button>
              <Button
                style={{ width: 100 }}
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#pricing';
                }}
              >
                {t('Pricing')}
              </Button>
              <Button
                style={{ width: 100 }}
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#faq';
                }}
              >
                {t('FAQ')}
              </Button>
              <Button
                style={{ width: 100 }}
                variant="text"
                size="small"
                onClick={() => {
                  window.location.href = 'https://cryptopayserver.gitbook.io/cryptopayserver';
                }}
              >
                {t('Blog')}
              </Button>
            </Stack>
            <Stack
              sx={{
                display: { xs: 'none', md: 'flex' },
              }}
              justifyContent={'right'}
              width={200}
              alignItems={'center'}
              direction={'row'}
              gap={2}
            >
              <Select
                variant={'standard'}
                value={language}
                onChange={(e: any) => {
                  onChangeLanguage(e.target.value);
                }}
              >
                {LANGUAGES &&
                  LANGUAGES.length > 0 &&
                  LANGUAGES.map((item, index) => (
                    <MenuItem value={item.name} key={index}>
                      {item.name}
                    </MenuItem>
                  ))}
              </Select>

              {isLogin ? (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                >
                  {t('Dashboard')}
                </Button>
              ) : (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  {t('Sign in')}
                </Button>
              )}
            </Stack>
          </Stack>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <Menu />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: 'var(--template-frame-height, 0px)',
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRounded />
                  </IconButton>
                </Box>

                <MenuItem
                  onClick={() => {
                    window.location.href = '#features';
                  }}
                >
                  {t('Features')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = '#highlights';
                  }}
                >
                  {t('Highlights')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = '#pricing';
                  }}
                >
                  {t('Pricing')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = '#faq';
                  }}
                >
                  {t('FAQ')}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = 'https://cryptopayserver.gitbook.io/cryptopayserver';
                  }}
                >
                  {t('Blog')}
                </MenuItem>
                <Divider sx={{ my: 3 }} />

                {isLogin ? (
                  <MenuItem>
                    <Button
                      color="primary"
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        window.location.href = '/dashboard';
                      }}
                    >
                      {t('Dashboard')}
                    </Button>
                  </MenuItem>
                ) : (
                  <MenuItem>
                    <Button
                      color="primary"
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        window.location.href = '/login';
                      }}
                    >
                      {t('Sign in')}
                    </Button>
                  </MenuItem>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
