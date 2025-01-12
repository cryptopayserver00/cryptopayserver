import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
// import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import { Grid } from '@mui/material';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Cost',
    description:
      'Deploy CryptoPay Server using a VPS, the following types of fees are never charged: Merchant fees, Subscription fees, Transfer fees and Software fees',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Security',
    description:
      'Always keep your private keys private. Using a secure wallet is recommended for new merchants as the only provider (creator) of private keys.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Privacy',
    description: 'CryptoPay Server will never ask a merchant for any personal identification.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Censorship-Resistance',
    description: 'Nobody controls it expect for the user running it. No central of failure.',
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'Decentralized',
    description:
      'To help merchants remove third party dependencies and simply use the Crypto Network freely and security.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'E-Commerce Integrations',
    description: 'We support a lot of plugin platforms to help merchants expand their service scope.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'grey.900',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            CryptoPay Server is code, not a company. There is no third-party between a merchant and a customer. The
            merchant is always in full control of their funds. There are no processing or subscription fees.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  borderColor: 'hsla(220, 25%, 25%, 0.3)',
                  backgroundColor: 'grey.800',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
