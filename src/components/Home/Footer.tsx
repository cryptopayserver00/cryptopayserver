import { Box, Button, Container, Grid, Icon, Link, Stack, Typography } from '@mui/material';
import { Twitter, GitHub, Telegram, Favorite, Article, HelpOutline } from '@mui/icons-material';
const Footer = () => {
  return (
    <Box mt={20} pb={2}>
      <Container>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Grid container color={'#8f979e'} gap={4}>
            <Grid item>
              <Link
                href={'https://github.com/cryptopayserver00/cryptopayserver'}
                target="_blank"
                underline={'hover'}
                color={'#000'}
              >
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={GitHub} fontSize={'small'} />
                  <Typography pl={1}>Github</Typography>
                </Stack>
              </Link>
            </Grid>
            <Grid item>
              <Link href={'https://github.com/viper-00'} target="_blank" underline={'hover'} color={'#000'}>
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={Twitter} fontSize={'small'} />
                  <Typography pl={1}>X</Typography>
                </Stack>
              </Link>
            </Grid>
            <Grid item>
              <Link href={'https://t.me/cryptopayserver'} target="_blank" underline={'hover'} color={'#000'}>
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={Telegram} fontSize={'small'} />
                  <Typography pl={1}>Telegram</Typography>
                </Stack>
              </Link>
            </Grid>
            <Grid item>
              <Link
                href={'https://cryptopayserver.gitbook.io/cryptopayserver'}
                target="_blank"
                underline={'hover'}
                color={'#000'}
              >
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={Favorite} fontSize={'small'} />
                  <Typography pl={1}>Donate</Typography>
                </Stack>
              </Link>
            </Grid>
            <Grid item>
              <Link
                href={'https://cryptopayserver.gitbook.io/cryptopayserver'}
                target="_blank"
                underline={'hover'}
                color={'#000'}
              >
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={Article} fontSize={'small'} />
                  <Typography pl={1}>API</Typography>
                </Stack>
              </Link>
            </Grid>
            <Grid item>
              <Link
                href={'https://cryptopayserver.gitbook.io/cryptopayserver'}
                target="_blank"
                underline={'hover'}
                color={'#000'}
              >
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={HelpOutline} fontSize={'small'} />
                  <Typography pl={1}>Docs</Typography>
                </Stack>
              </Link>
            </Grid>
          </Grid>
          <Stack color={'#8f979e'} fontSize={14} direction={'row'} alignItems={'center'} width={250}>
            <Typography>© CryptoPayServer</Typography>
            <Typography pl={1}>v0.0.1</Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
