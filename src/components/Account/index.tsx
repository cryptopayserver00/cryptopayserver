// import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
// import { useEffect, useState } from 'react';
// import MainAccount from './Account';
// import ApiKey from './Apikey';
// import Authentication from './Authentication';
// import LoginCodes from './LoginCodes';
// import Notification from './Notification';
// import Password from './Password';
// import { useRouter } from 'next/router';
// import { ACCOUNT_TAB_DATAS } from '@/packages/constants';

// const Account = () => {
//   const router = useRouter();
//   const { tab } = router.query;

//   const [value, setValue] = useState(0);

//   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//     const tabId = Object.values(ACCOUNT_TAB_DATAS).find((item) => item.id === newValue)?.tabId;
//     router.replace({
//       pathname: router.pathname,
//       query: { ...router.query, tab: tabId },
//     });

//     setValue(newValue);
//   };

//   const init = (tab: any) => {
//     const tabId = Object.values(ACCOUNT_TAB_DATAS).find((item) => item.tabId === tab)?.id;
//     setValue(tabId || 0);
//   };

//   useEffect(() => {
//     tab && init(tab);
//   }, [tab]);

//   return (
//     <Box>
//       <Container>
//         <Typography variant="h6" pt={5}>
//           Account Settings
//         </Typography>

//         <Box mt={2}>
//           <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//             <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
//               {ACCOUNT_TAB_DATAS &&
//                 ACCOUNT_TAB_DATAS.length > 0 &&
//                 ACCOUNT_TAB_DATAS.map((item, index) => <Tab key={index} label={item.title} {...a11yProps(item.id)} />)}
//             </Tabs>
//           </Box>
//           <CustomTabPanel value={value} index={0}>
//             <MainAccount />
//           </CustomTabPanel>
//           <CustomTabPanel value={value} index={1}>
//             <Password />
//           </CustomTabPanel>
//           <CustomTabPanel value={value} index={2}>
//             <Authentication />
//           </CustomTabPanel>
//           <CustomTabPanel value={value} index={3}>
//             <ApiKey />
//           </CustomTabPanel>
//           <CustomTabPanel value={value} index={4}>
//             <Notification />
//           </CustomTabPanel>
//           <CustomTabPanel value={value} index={5}>
//             <LoginCodes />
//           </CustomTabPanel>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Account;

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function CustomTabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <Box
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </Box>
//   );
// }

// function a11yProps(index: number) {
//   return {
//     id: `simple-tab-${index}`,
//     'aria-controls': `simple-tabpanel-${index}`,
//   };
// }

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ACCOUNT_TAB_DATAS } from '@/packages/constants'
import MainAccount from './Account'
import ApiKey from './Apikey'
import Authentication from './Authentication'
import LoginCodes from './LoginCodes'
import Notification from './Notification'
import Password from './Password'

const Account = () => {
  const router = useRouter()
  const { tab } = router.query

  const [value, setValue] = useState('0')

  const handleChange = (newValue: string) => {
    const tabId = Object.values(ACCOUNT_TAB_DATAS).find(
      (item) => item.id === Number(newValue)
    )?.tabId

    router.replace({
      pathname: router.pathname,
      query: { ...router.query, tab: tabId },
    })

    setValue(newValue)
  }

  const init = (tab: any) => {
    const tabId = Object.values(ACCOUNT_TAB_DATAS).find((item) => item.tabId === tab)?.id
    setValue(String(tabId ?? 0))
  }

  useEffect(() => {
    tab && init(tab)
  }, [tab])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Account Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account preferences, security and integrations
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={value} onValueChange={handleChange} className="w-full">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0 border-b rounded-none">
            {ACCOUNT_TAB_DATAS?.map((item) => (
              <TabsTrigger
                key={item.id}
                value={String(item.id)}
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
              >
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="0" className="mt-0 focus-visible:outline-none">
              <MainAccount />
            </TabsContent>
            <TabsContent value="1" className="mt-0 focus-visible:outline-none">
              <Password />
            </TabsContent>
            <TabsContent value="2" className="mt-0 focus-visible:outline-none">
              <Authentication />
            </TabsContent>
            <TabsContent value="3" className="mt-0 focus-visible:outline-none">
              <ApiKey />
            </TabsContent>
            <TabsContent value="4" className="mt-0 focus-visible:outline-none">
              <Notification />
            </TabsContent>
            <TabsContent value="5" className="mt-0 focus-visible:outline-none">
              <LoginCodes />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default Account
