import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import GithubIcon from '@mui/icons-material/GitHub';
import TelegramIcon from '@mui/icons-material/Telegram';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import { CustomLogo } from 'components/Logo/CustomLogo';

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
      {'Copyright © '}
      <Link color="text.secondary" href="#">
        CryptoPayServer
      </Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
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
              <Typography fontWeight={'bold'} color="#0098e5" fontSize={16}>
                Crypto Pay
              </Typography>
            </Stack>
            <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
              Join the newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Subscribe for weekly updates. No spams ever!
            </Typography>
            <InputLabel htmlFor="email-newsletter">Email</InputLabel>
            <Stack direction="row" spacing={1} useFlexGap mt={1}>
              <TextField
                hiddenLabel
                size="small"
                variant="outlined"
                fullWidth
                aria-label="Enter your email address"
                placeholder="Your email address"
                // slotProps={{
                //   htmlInput: {
                //     autoComplete: 'off',
                //     'aria-label': 'Enter your email address',
                //   },
                // }}
                sx={{ width: '250px' }}
              />
              <Button variant="contained" color="primary" size="small" sx={{ flexShrink: 0 }}>
                Subscribe
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
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Software
          </Typography>
          <Link
            color="text.secondary"
            variant="body2"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/learn/introduction"
          >
            Introduction
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/learn/use-case"
          >
            Use Case
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/features/apps"
          >
            Apps
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/getting-started/quickstart"
          >
            Getting Started
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Resources
          </Typography>
          <Link color="text.secondary" variant="body2" href="https://cryptopayserver.gitbook.io/cryptopayserver">
            Documentation
          </Link>
          <Link color="text.secondary" variant="body2" href="https://github.com/cryptopayserver00/cryptopayserver">
            GitHub
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/support-and-community/support"
          >
            Support
          </Link>
          <Link
            color="text.secondary"
            variant="body2"
            href="https://cryptopayserver.gitbook.io/cryptopayserver/support-and-community/troubleshooting-an-issue-in-cryptopay-server"
          >
            FAQ
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Community
          </Typography>
          <Link color="text.secondary" variant="body2" href="https://cryptopayserver.gitbook.io/cryptopayserver">
            Blog
          </Link>
          <Link color="text.secondary" variant="body2" href="https://t.me/cryptopayserver">
            Chat
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            Contribute
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            Donate
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
        <div>
          <Link color="text.secondary" variant="body2" href="#">
            Privacy Policy
          </Link>
          <Typography sx={{ display: 'inline', mx: 0.5, opacity: 0.5 }}>&nbsp;•&nbsp;</Typography>
          <Link color="text.secondary" variant="body2" href="#">
            Terms of Service
          </Link>
          <Copyright />
        </div>
        <Stack direction="row" spacing={1} useFlexGap sx={{ justifyContent: 'left', color: 'text.secondary' }}>
          <IconButton
            color="inherit"
            size="small"
            href="https://github.com/cryptopayserver00/cryptopayserver"
            aria-label="GitHub"
            sx={{ alignSelf: 'center' }}
          >
            <GithubIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="https://t.me/cryptopayserver"
            aria-label="Telegram"
            sx={{ alignSelf: 'center' }}
          >
            <TelegramIcon />
          </IconButton>
          <IconButton color="inherit" size="small" href="#" aria-label="RssFeed" sx={{ alignSelf: 'center' }}>
            <RssFeedIcon />
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}
