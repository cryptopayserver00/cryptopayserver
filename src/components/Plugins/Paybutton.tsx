// import { Box, Container, Typography } from '@mui/material';

// const Paybutton = () => {
//   return (
//     <Box>
//       <Container>
//         <Typography variant="h6" pt={5}>
//           Pay Button
//         </Typography>

//         <Typography mt={4}>Configure your Pay Button, and the generated code will be displayed at the bottom of the page to copy into your project.</Typography>
//       </Container>
//     </Box>
//   );
// };

// export default Paybutton;

import { Card, CardContent } from '@/components/ui/card'

export const Paybutton = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* 页头标题 */}
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pay Button</h1>
      </div>

      {/* 说明卡片 */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure your Pay Button, and the generated code will be displayed at the bottom of the
            page to copy into your project.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Paybutton
