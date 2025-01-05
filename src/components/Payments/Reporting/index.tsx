import { ReportGmailerrorred } from '@mui/icons-material';
import { Box, Button, Container, FormControl, IconButton, MenuItem, Select, Stack, Typography } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers-pro';
import { useState } from 'react';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { REPORT_STATUS } from 'packages/constants';
import dayjs, { Dayjs } from 'dayjs';
import ReportDataGrid from 'components/DataList/ReportDataGrid';
import Papa from 'papaparse';
import { CHAINNAMES } from 'packages/constants/blockchain';

export type RowType = {
  id: number;
  chainId: number;
  chainName: CHAINNAMES;
  currency: string;
  amount: number;
  crypto: string;
  cryptoAmount: number;
  rate: number;
  description: string;
  metadata: string;
  buyerEmail: string;
  orderStatus: string;
  paymentMethod: string;
  paid: string;
  createdDate: string;
  expirationDate: string;
};

const Reporting = () => {
  const [openReport, setOpenReport] = useState<boolean>(false);
  const [reportStatus, setReportStatus] = useState<string>(REPORT_STATUS.All);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().add(-30, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());

  const [rows, setRows] = useState<RowType[]>([]);

  const onClickExport = () => {
    const filterRows = rows.map(({ chainId, ...rest }) => rest);
    const csv = Papa.unparse(filterRows);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Box>
      <Container>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pt={5}>
          <Stack direction={'row'} alignItems={'center'}>
            <Typography variant="h6">Reporting</Typography>
            <IconButton
              onClick={() => {
                setOpenReport(!openReport);
              }}
            >
              <ReportGmailerrorred />
            </IconButton>
          </Stack>
          <Button variant={'contained'} onClick={onClickExport}>
            Export
          </Button>
        </Stack>

        <Stack mt={5} direction={'row'} gap={3} alignItems={'baseline'}>
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              inputProps={{ 'aria-label': 'Without label' }}
              value={reportStatus}
              onChange={(e) => {
                setReportStatus(e.target.value);
              }}
            >
              {REPORT_STATUS &&
                Object.entries(REPORT_STATUS).map((item, index) => (
                  <MenuItem value={item[1]} key={index}>
                    {item[1]}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Box flex={1}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DateRangePicker']}>
                <DemoItem>
                  <DateTimePicker
                    value={startDate}
                    onAccept={(value: any) => {
                      setStartDate(value);
                    }}
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>
          </Box>

          <Box flex={1}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DateRangePicker']}>
                <DemoItem>
                  <DateTimePicker
                    value={endDate}
                    onAccept={(value: any) => {
                      setEndDate(value);
                    }}
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>
          </Box>
        </Stack>

        <Box mt={5}>
          <ReportDataGrid
            status={reportStatus}
            startDate={new Date(startDate.toString()).getTime()}
            endDate={new Date(endDate.toString()).getTime()}
            rows={rows}
            setRows={setRows}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default Reporting;
