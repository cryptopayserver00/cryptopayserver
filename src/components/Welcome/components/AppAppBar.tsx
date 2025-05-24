import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from './ColorModeIconDropdown';
import { useEffect, useState } from 'react';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { Select, Stack, Typography } from '@mui/material';
import { useUserPresistStore } from 'lib/store';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from 'packages/constants';

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
          {/* <Stack sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}> */}
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
                style={{ width: 80 }}
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
                style={{ width: 80 }}
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
                style={{ width: 80 }}
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
                style={{ width: 80 }}
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
                style={{ width: 80 }}
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
              style={{ width: 200, justifyContent: 'right' }}
              sx={{
                display: { xs: 'none', md: 'flex' },
              }}
              alignItems={'center'}
              direction={'row'}
              gap={4}
            >
              {isLogin ? (
                <Button
                  style={{ width: 80 }}
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                >
                  {t('Dashboard')}
                </Button>
              ) : (
                <Button
                  style={{ width: 80 }}
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                >
                  {t('Sign in')}
                </Button>
              )}

              <Select
                style={{ width: 80 }}
                size={'small'}
                inputProps={{ 'aria-label': 'Without label' }}
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
            </Stack>
          </Stack>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
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
                    <CloseRoundedIcon />
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
