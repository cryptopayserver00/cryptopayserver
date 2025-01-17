import { ReportGmailerrorred } from '@mui/icons-material';
import { Box, Container, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import PayoutDataGrid from '../../DataList/PayoutDataGrid';
import { PAYOUT_STATUS } from 'packages/constants';

const Payouts = () => {
  const [openPayout, setOpenPayout] = useState<boolean>(false);

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect;

  return (
    <Box>
      <Container>
        <Box>
          <Stack direction={'row'} alignItems={'center'} pt={5}>
            <Typography variant="h6">Payouts</Typography>
            <IconButton
              onClick={() => {
                setOpenPayout(!openPayout);
              }}
            >
              <ReportGmailerrorred />
            </IconButton>
          </Stack>

          <Box mt={5}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
                <Tab label={PAYOUT_STATUS.AwaitingApproval} {...a11yProps(0)} />
                <Tab label={PAYOUT_STATUS.AwaitingPayment} {...a11yProps(1)} />
                <Tab label={PAYOUT_STATUS.InProgress} {...a11yProps(2)} />
                <Tab label={PAYOUT_STATUS.Completed} {...a11yProps(3)} />
                <Tab label={PAYOUT_STATUS.Cancelled} {...a11yProps(4)} />ƒ
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <PayoutDataGrid status={PAYOUT_STATUS.AwaitingApproval} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <PayoutDataGrid status={PAYOUT_STATUS.AwaitingPayment} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <PayoutDataGrid status={PAYOUT_STATUS.InProgress} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
              <PayoutDataGrid status={PAYOUT_STATUS.Completed} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
              <PayoutDataGrid status={PAYOUT_STATUS.Cancelled} />
            </CustomTabPanel>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Payouts;

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
