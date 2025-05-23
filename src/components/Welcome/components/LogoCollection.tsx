import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

const whiteLogos = [
  '/images/binance.svg',
  '/images/okx.svg',
  '/images/cryptopayserver.png',
  '/images/coinmarketcap.svg',
  '/images/alchemy.svg',
  '/images/tatum.jpg',
];

const darkLogos = [
  '/images/binance.svg',
  '/images/okx.svg',
  '/images/cryptopayserver.png',
  '/images/coinmarketcap.svg',
  '/images/alchemy.svg',
  '/images/tatum.jpg',
];

export default function LogoCollection() {
  const { t, i18n } = useTranslation('');
  const theme = useTheme();
  const logos = theme.palette.mode === 'light' ? darkLogos : whiteLogos;

  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography component="p" variant="subtitle2" align="center" sx={{ color: 'text.secondary' }}>
        {t('Trusted by the best companies')}
      </Typography>
      <Grid container sx={{ justifyContent: 'center', mt: 0.5, opacity: 0.6 }}>
        {logos.map((logo, index) => (
          <Grid item key={index}>
            <Image
              src={logo}
              alt={`Fake company number ${index + 1}`}
              width={120}
              height={100}
              style={{
                margin: '0 32px',
                opacity: 0.7,
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
