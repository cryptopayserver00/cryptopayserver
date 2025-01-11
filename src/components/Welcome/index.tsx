import { Box, Typography } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import AppAppBar from './components/AppAppBar';
import Hero from './components/Hero';
import LogoCollection from './components/LogoCollection';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Highlights from './components/Highlights';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AppTheme from './components/AppTheme';

const Welcome = (props: { disableCustomTheme?: boolean }) => {
  return (
    <Box>
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <AppAppBar />
        <Hero />
        <Box>
          <LogoCollection />
          <Features />
          <Divider />
          {/* <Testimonials /> */}
          {/* <Divider /> */}
          <Highlights />
          <Divider />
          <Pricing />
          <Divider />
          <FAQ />
          <Divider />
          <Footer />
        </Box>
      </AppTheme>
    </Box>
  );
};

export default Welcome;
