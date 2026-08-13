// import { Box, Card, CardContent, Container, Icon, Stack, Tab, Tabs, Typography } from '@mui/material';
// import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import { useSnackPresistStore, useStorePresistStore } from '@/lib/store';
// import { useEffect, useState } from 'react';
// import ImportMnemonicPhrase from './MnemonicPhrase';
// import ImportPrivateKey from './PrivateKey';

// const ImportMnemonicPhraseOrPrivateKey = () => {
//   const { getIsStore } = useStorePresistStore((state) => state);
//   const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

//   const [value, setValue] = useState(0);
//   const handleChange = (event: React.SyntheticEvent, newValue: number) => {
//     setValue(newValue);
//   };

//   useEffect(() => {
//     if (!getIsStore()) {
//       window.location.href = '/stores/create';
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Box>
//       <Container>
//         <Stack mt={20}>
//           <Typography variant="h4">Mnemonic Phrase Or Private Key</Typography>

//           <Typography mt={5}>Please select your mnemonic phrase in order</Typography>
//           <Box mt={2}>
//             <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//               <Tabs
//                 value={value}
//                 onChange={handleChange}
//                 aria-label="basic tabs example"
//                 variant="scrollable"
//                 scrollButtons="auto"
//               >
//                 <Tab label="Mnemonic Phrase" {...a11yProps(0)} />
//                 <Tab label="Private Key" {...a11yProps(1)} />
//               </Tabs>
//             </Box>
//             <CustomTabPanel value={value} index={0}>
//               <ImportMnemonicPhrase />
//             </CustomTabPanel>
//             <CustomTabPanel value={value} index={1}>
//               <ImportPrivateKey />
//             </CustomTabPanel>
//           </Box>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default ImportMnemonicPhraseOrPrivateKey;

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// function CustomTabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </div>
//   );
// }

// function a11yProps(index: number) {
//   return {
//     id: `simple-tab-${index}`,
//     'aria-controls': `simple-tabpanel-${index}`,
//   };
// }

import { useEffect, useState } from 'react'
import { useStorePresistStore } from '@/lib/store'
import ImportMnemonicPhrase from './MnemonicPhrase'
import ImportPrivateKey from './PrivateKey'
import { useShallow } from 'zustand/react/shallow'

const ImportMnemonicPhraseOrPrivateKey = () => {
  const [activeTab, setActiveTab] = useState<number>(0)

  const { isStore } = useStorePresistStore(
    useShallow((state) => ({
      isStore: state.isStore,
    }))
  )

  useEffect(() => {
    if (!isStore) {
      window.location.href = '/stores/create'
    }
  }, [isStore])

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto flex flex-col pt-10">
        <h1 className="text-3xl font-bold text-gray-900">Mnemonic Phrase Or Private Key</h1>

        <p className="mt-5 text-base text-gray-600">Please select your mnemonic phrase in order</p>

        <div className="mt-6">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab(0)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                  activeTab === 0
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 0}
              >
                Mnemonic Phrase
              </button>
              <button
                type="button"
                onClick={() => setActiveTab(1)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors focus:outline-none ${
                  activeTab === 1
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                role="tab"
                aria-selected={activeTab === 1}
              >
                Private Key
              </button>
            </nav>
          </div>

          {/* Tab Panels */}
          <div className="pt-6">
            <div role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
              {activeTab === 0 && <ImportMnemonicPhrase />}
            </div>
            <div role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1" aria-labelledby="tab-1">
              {activeTab === 1 && <ImportPrivateKey />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportMnemonicPhraseOrPrivateKey
