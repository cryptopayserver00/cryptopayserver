import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';

type RowType = {
  id: number;
  date: string;
  message: string;
};

export function InvoiceEventDataTab(params: { orderId: number }) {
  const { orderId } = params;

  const [rows, setRows] = useState<RowType[]>([]);

  const getEvent = async () => {
    if (orderId && orderId > 0) {
      try {
        const event_resp: any = await axios.get(Http.find_invoice_event_by_order_id, {
          params: {
            order_id: orderId,
          },
        });
        if (event_resp.result && event_resp.data.length > 0) {
          let rt: RowType[] = [];
          event_resp.data.forEach(async (item: any, index: number) => {
            rt.push({
              id: index + 1,
              date: new Date(item.created_date).toLocaleString(),
              message: item.message,
            });
          });
          setRows(rt);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    getEvent();
  }, [orderId]);

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows && rows.length > 0 ? (
              <>
                {rows.map((row) => (
                  <TableRow key={row.date} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell component="th" scope="row">
                      {row.date}
                    </TableCell>
                    <TableCell align="left">{row.message}</TableCell>
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
    </Box>
  );
}
