import { Box, Card, CardContent, Container, Icon, Stack, Tab, Tabs, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useSnackPresistStore, useStorePresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import ImportMnemonicPhrase from './MnemonicPhrase';
import ImportPrivateKey from './PrivateKey';

const ImportMnemonicPhraseOrPrivateKey = () => {
  const { getIsStore } = useStorePresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (!getIsStore()) {
      window.location.href = '/stores/create';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Stack mt={20}>
          <Typography variant="h4">Mnemonic Phrase Or Private Key</Typography>

          <Typography mt={5}>Please select your mnemonic phrase in order</Typography>
          <Box mt={2}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Mnemonic Phrase" {...a11yProps(0)} />
                <Tab label="Private Key" {...a11yProps(1)} />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <ImportMnemonicPhrase />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <ImportPrivateKey />
            </CustomTabPanel>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default ImportMnemonicPhraseOrPrivateKey;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
