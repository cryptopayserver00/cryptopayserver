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
import { useState } from 'react';
import { CustomLogo } from 'components/Logo/CustomLogo';
import { Stack, Typography } from '@mui/material';

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
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
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
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <Button
              onClick={() => {
                window.location.href = '/';
              }}
            >
              <Stack direction={'row'} alignItems={'center'}>
                <CustomLogo>C</CustomLogo>
                <Typography fontWeight={'bold'} color="#0098e5" fontSize={16}>
                  Crypto Pay
                </Typography>
              </Stack>
            </Button>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }} gap={1} ml={1}>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#features';
                }}
              >
                Features
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#testimonials';
                }}
              >
                Testimonials
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#highlights';
                }}
              >
                Highlights
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={() => {
                  window.location.href = '#pricing';
                }}
              >
                Pricing
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0 }}
                onClick={() => {
                  window.location.href = '#faq';
                }}
              >
                FAQ
              </Button>
              <Button
                variant="text"
                size="small"
                sx={{ minWidth: 0 }}
                onClick={() => {
                  window.location.href = 'https://cryptopayserver.gitbook.io/cryptopayserver';
                }}
              >
                Blog
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1,
              alignItems: 'center',
            }}
            gap={1}
          >
            <Button
              color="primary"
              variant="text"
              size="small"
              onClick={() => {
                window.location.href = '/login';
              }}
            >
              Sign in
            </Button>
            <Button
              color="primary"
              variant="contained"
              size="small"
              onClick={() => {
                window.location.href = '/register';
              }}
            >
              Sign up
            </Button>
            <ColorModeIconDropdown />
          </Box>
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
                  Features
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = '#testimonials';
                  }}
                >
                  Testimonials
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = '#highlights';
                  }}
                >
                  Highlights
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = '#pricing';
                  }}
                >
                  Pricing
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = '#faq';
                  }}
                >
                  FAQ
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = 'https://cryptopayserver.gitbook.io/cryptopayserver';
                  }}
                >
                  Blog
                </MenuItem>
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    onClick={() => {
                      window.location.href = '/register';
                    }}
                  >
                    Sign up
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    color="primary"
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      window.location.href = '/login';
                    }}
                  >
                    Sign in
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
