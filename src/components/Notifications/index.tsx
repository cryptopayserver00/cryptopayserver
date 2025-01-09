import { Settings } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

const Notifications = () => {
  return (
    <Box>
      <Container>
        <Box pt={5}>
          <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
            <Typography variant="h6">Notifications</Typography>
            <IconButton
              size={'large'}
              aria-label="toggle password visibility"
              onClick={() => {
                window.location.href = '/account';
              }}
              edge="end"
            >
              <Settings />
            </IconButton>
          </Stack>

          <Box mt={5}>
            <NotificationsTab />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Notifications;

type RowType = {
  id: number;
  label: string;
  message: string;
  isSeen: number;
  date: string;
  url: string;
};

function NotificationsTab() {
  const { getStoreId } = useStorePresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { setSnackOpen, setSnackMessage, setSnackSeverity } = useSnackPresistStore((state) => state);

  const [rows, setRows] = useState<RowType[]>([]);

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_notification, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });

      if (response.result && response.data.length > 0) {
        let rt: RowType[] = [];
        response.data.forEach(async (item: any, index: number) => {
          rt.push({
            id: item.id,
            label: item.label,
            message: item.message,
            isSeen: item.is_seen,
            date: new Date(item.created_date).toLocaleString(),
            url: item.url,
          });
        });
        setRows(rt);
      } else {
        setRows([]);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const onClickSeen = async (id: number, isSeen: number) => {
    try {
      const response: any = await axios.put(Http.update_notification, {
        store_id: getStoreId(),
        user_id: getUserId(),
        network: getNetwork() === 'mainnet' ? 1 : 2,
        id: id,
        is_seen: isSeen === 1 ? 2 : 1,
      });

      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('update Successful!');
        setSnackOpen(true);

        await init();
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Message</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{row.message}</TableCell>
                  <TableCell component="th" scope="row">
                    {row.date}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      onClick={() => {
                        window.location.href = row.url;
                      }}
                    >
                      Details
                    </Button>
                    <Button
                      onClick={() => {
                        onClickSeen(row.id, row.isSeen);
                      }}
                    >
                      {row.isSeen === 1 ? 'Mark as unseen' : 'Mark as seen'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={100} align="center">
                No rows
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
