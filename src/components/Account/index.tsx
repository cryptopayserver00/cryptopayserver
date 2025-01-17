import { Box, Container, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import MainAccount from './Account';
import ApiKey from './Apikey';
import Authentication from './Authentication';
import LoginCodes from './LoginCodes';
import Notification from './Notification';
import Password from './Password';

const Account = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <Container>
        <Typography variant="h5" pt={5}>
          Account Settings
        </Typography>

        <Box mt={2}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Account" {...a11yProps(0)} />
              <Tab label="Password" {...a11yProps(1)} />
              <Tab label="Two-Factor Authentication" {...a11yProps(2)} />
              <Tab label="API Keys" {...a11yProps(3)} />
              <Tab label="Notifications" {...a11yProps(4)} />
              <Tab label="Login Codes" {...a11yProps(5)} />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <MainAccount />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <Password />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
            <Authentication />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={3}>
            <ApiKey />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={4}>
            <Notification />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={5}>
            <LoginCodes />
          </CustomTabPanel>
        </Box>
      </Container>
    </Box>
  );
};

export default Account;

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
