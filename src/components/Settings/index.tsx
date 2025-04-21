import { Box, Container, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import AccessToken from './AccessToken';
import Checkout from './Checkout';
import Emails from './Email';
import Forms from './Forms';
import General from './General';
import Payout from './Payout';
import Rates from './Rates';
import Roles from './Roles';
import Users from './Users';
import Webhooks from './Webhooks';
import { useRouter } from 'next/router';
import { SETTING_TAB_DATAS } from 'packages/constants';

const Settings = () => {
  const router = useRouter();
  const { tab } = router.query;

  const [value, setValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const tabId = Object.values(SETTING_TAB_DATAS).find((item) => item.id === newValue)?.tabId;
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, tab: tabId },
    });

    setValue(newValue);
  };

  const init = (tab: any) => {
    const tabId = Object.values(SETTING_TAB_DATAS).find((item) => item.tabId === tab)?.id;
    setValue(tabId || 0);
  };

  useEffect(() => {
    tab && init(tab);
  }, [tab]);

  return (
    <Box>
      <Container>
        <Typography variant="h6" pt={5}>
          Store Settings
        </Typography>

        <Box mt={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
              {SETTING_TAB_DATAS &&
                SETTING_TAB_DATAS.length > 0 &&
                SETTING_TAB_DATAS.map((item, index) => <Tab key={index} label={item.title} {...a11yProps(item.id)} />)}
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <General />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Rates />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <Checkout />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <AccessToken />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            <Users />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={5}>
            <Roles />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={6}>
            <Webhooks />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={7}>
            <Payout />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={8}>
            <Emails />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={9}>
            <Forms />
          </CustomTabPanel>
        </Box>
      </Container>
    </Box>
  );
};

export default Settings;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
