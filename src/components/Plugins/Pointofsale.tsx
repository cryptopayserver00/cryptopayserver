// import { Box, Button, Container, FormControl, OutlinedInput, Typography } from '@mui/material';

// const Pointofsale = () => {
//   return (
//     <Box>
//       <Container>
//         <Typography variant="h6" pt={5}>
//           Create a new PointOfSale
//         </Typography>
//         <Box mt={4}>
//           <Typography>App Name</Typography>
//           <Box mt={1}>
//             <FormControl fullWidth variant="outlined">
//               <OutlinedInput
//                 size={'small'}
//                 aria-describedby="outlined-weight-helper-text"
//                 inputProps={{
//                   'aria-label': 'weight',
//                 }}
//               />
//             </FormControl>
//           </Box>
//         </Box>

//         <Box mt={5}>
//           <Button variant={'contained'} size={'large'}>
//             Create
//           </Button>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Pointofsale;

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Pointofsale = () => {
  const [appName, setAppName] = useState<string>('')
  const [showError, setShowError] = useState<boolean>(false)

  const handleCreate = () => {
    if (!appName.trim()) {
      setShowError(true)
      return
    }
    setShowError(false)

    // TODO: 执行创建 PointOfSale 逻辑
    console.log('Creating PointOfSale:', appName)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* 页头标题 */}
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create a new PointOfSale
        </h1>
      </div>

      {/* 表单卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Point of Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App Name */}
          <div className="space-y-2">
            <Label htmlFor="pos-app-name" className="flex items-center gap-0.5">
              App Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pos-app-name"
              placeholder="Enter Point of Sale app name"
              value={appName}
              onChange={(e) => {
                setAppName(e.target.value)
                if (showError && e.target.value.trim()) {
                  setShowError(false)
                }
              }}
            />
            {showError && (
              <p className="text-xs text-destructive font-medium mt-1">
                The App Name field is required.
              </p>
            )}
          </div>

          {/* 提交按钮 */}
          <div className="pt-2">
            <Button size="lg" onClick={handleCreate} className="w-full sm:w-auto">
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Pointofsale
