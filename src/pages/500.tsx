// import { Box, Button, Container, Stack, Typography } from '@mui/material';
// import MetaTags from '@/components/Common/MetaTags';
// import { CustomLogo } from '@/components/Logo/CustomLogo';

// const Custom500 = () => {
//   const onClickButton = async () => {
//     window.location.href = '/';
//   };

//   return (
//     <>
//       <MetaTags title="Something wrong" />
//       <Container>
//         <Box mt={20}>
//           <Button
//             style={{ padding: 0 }}
//             onClick={() => {
//               window.location.href = '/dashboard';
//             }}
//           >
//             <Stack direction={'row'} alignItems={'center'}>
//               <CustomLogo>C</CustomLogo>
//               <Typography fontWeight={'bold'} color="#0098e5" fontSize={'large'}>
//                 Crypto Pay
//               </Typography>
//             </Stack>
//           </Button>

//           <Stack mt={4} direction={'row'} alignItems={'center'}>
//             <Typography fontWeight={'bold'}>500.</Typography>
//             <Typography ml={1}>That&apos;s an error.</Typography>
//           </Stack>

//           <Box mt={4}>
//             <Typography>There was an error. Please try again later. That&apos;s all we know.</Typography>
//           </Box>

//           <Box mt={6}>
//             <Button variant={'contained'} onClick={onClickButton} size="large">
//               Go Home
//             </Button>
//           </Box>
//         </Box>
//       </Container>
//     </>
//   );
// };

// export default Custom500;

import Link from 'next/link'

import MetaTags from '@/components/Common/MetaTags'
import { Button } from '@/components/ui/button'
import { SiteLogo } from '@/components/Logo/SiteLogo'

const Custom500 = () => {
  return (
    <>
      <MetaTags title="Something wrong" />
      <div className="mx-auto max-w-screen-lg px-4">
        <div className="mt-32">
          <SiteLogo />

          <div className="mt-8 flex items-center gap-1">
            <span className="font-bold">500.</span>
            <span>That&apos;s an error.</span>
          </div>

          <p className="mt-4 text-muted-foreground">
            There was an error. Please try again later. That&apos;s all we know.
          </p>

          <Button size="lg" className="mt-6" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </>
  )
}

export default Custom500
