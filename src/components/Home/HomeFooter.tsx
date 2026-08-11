// import { Box, Button, Container, Grid, Icon, Link, Stack, Typography } from '@mui/material';
// import { Twitter, GitHub, Telegram, Favorite, Article, HelpOutline } from '@mui/icons-material';
// const HomeFooter = () => {
//   return (
//     <Box mt={20} pb={2}>
//       <Container>
//         <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
//           <Grid container color={'#8f979e'} gap={4}>
//             <Grid item>
//               <Link
//                 href={'https://github.com/cryptopayserver00/cryptopayserver'}
//                 target="_blank"
//                 underline={'hover'}
//                 color={'#000'}
//               >
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Icon component={GitHub} fontSize={'small'} />
//                   <Typography pl={1}>Github</Typography>
//                 </Stack>
//               </Link>
//             </Grid>
//             <Grid item>
//               <Link href={'https://github.com/viper-00'} target="_blank" underline={'hover'} color={'#000'}>
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Icon component={Twitter} fontSize={'small'} />
//                   <Typography pl={1}>X</Typography>
//                 </Stack>
//               </Link>
//             </Grid>
//             <Grid item>
//               <Link href={'https://t.me/cryptopayserver'} target="_blank" underline={'hover'} color={'#000'}>
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Icon component={Telegram} fontSize={'small'} />
//                   <Typography pl={1}>Telegram</Typography>
//                 </Stack>
//               </Link>
//             </Grid>
//             <Grid item>
//               <Link
//                 href={'https://cryptopayserver.gitbook.io/cryptopayserver'}
//                 target="_blank"
//                 underline={'hover'}
//                 color={'#000'}
//               >
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Icon component={Favorite} fontSize={'small'} />
//                   <Typography pl={1}>Donate</Typography>
//                 </Stack>
//               </Link>
//             </Grid>
//             <Grid item>
//               <Link
//                 href={'https://cryptopayserver.gitbook.io/cryptopayserver'}
//                 target="_blank"
//                 underline={'hover'}
//                 color={'#000'}
//               >
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Icon component={Article} fontSize={'small'} />
//                   <Typography pl={1}>API</Typography>
//                 </Stack>
//               </Link>
//             </Grid>
//             <Grid item>
//               <Link
//                 href={'https://cryptopayserver.gitbook.io/cryptopayserver'}
//                 target="_blank"
//                 underline={'hover'}
//                 color={'#000'}
//               >
//                 <Stack direction={'row'} alignItems={'center'}>
//                   <Icon component={HelpOutline} fontSize={'small'} />
//                   <Typography pl={1}>Docs</Typography>
//                 </Stack>
//               </Link>
//             </Grid>
//           </Grid>
//           <Stack color={'#8f979e'} fontSize={14} direction={'row'} alignItems={'center'} width={250}>
//             <Typography>© CryptoPayServer</Typography>
//             <Typography pl={1}>v0.0.1</Typography>
//           </Stack>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default HomeFooter;

import Link from 'next/link'
import { Send, Heart, FileText, HelpCircle } from 'lucide-react'

const footerLinks = [
  // {
  //   href: 'https://github.com/cryptopayserver00/cryptopayserver',
  //   label: 'Github',
  //   icon: Github,
  // },
  // {
  //   href: 'https://github.com/viper-00',
  //   label: 'X',
  //   icon: Twitter,
  // },
  {
    href: 'https://t.me/cryptopayserver',
    label: 'Telegram',
    icon: Send,
  },
  {
    href: 'https://cryptopayserver.gitbook.io/cryptopayserver',
    label: 'Donate',
    icon: Heart,
  },
  {
    href: 'https://cryptopayserver.gitbook.io/cryptopayserver',
    label: 'API',
    icon: FileText,
  },
  {
    href: 'https://cryptopayserver.gitbook.io/cryptopayserver',
    label: 'Docs',
    icon: HelpCircle,
  },
]

const HomeFooter = () => {
  return (
    <div className="mt-32 pb-4">
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {footerLinks.map(({ href, label, icon: IconComponent }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
              >
                <IconComponent className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>© CryptoPayServer</span>
            <span>v0.0.1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeFooter
