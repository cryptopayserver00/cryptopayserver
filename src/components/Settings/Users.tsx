import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { USER_ROLE } from 'packages/constants';
import { useState } from 'react';

const Users = () => {
  const [userRole, setUserRole] = useState<string>(USER_ROLE.Employee);

  return (
    <Box>
      <Box>
        <Typography variant="h6">Store Users</Typography>
        <Typography mt={2}>
          Give other registered CryptoPay Server users access to your store. See the{' '}
          <Link href={'/settings'}>roles</Link> for granted permissions.
        </Typography>
        <Stack direction={'row'} alignItems={'center'} gap={3} mt={4}>
          <TextField fullWidth hiddenLabel size="small"  placeholder='user@example.com'/>
          <Select
            size={'small'}
            inputProps={{ 'aria-label': 'Without label' }}
            value={userRole}
            onChange={(e) => {
              setUserRole(e.target.value);
            }}
          >
            {USER_ROLE &&
              Object.entries(USER_ROLE).map((item, index) => (
                <MenuItem value={item[1]} key={index}>
                  {item[1]}
                </MenuItem>
              ))}
          </Select>

          <Button variant={'contained'} style={{ width: 150 }}>
            Add User
          </Button>
        </Stack>
      </Box>

      <Box mt={5}>
        <StoreUserTable />
      </Box>
    </Box>
  );
};

export default Users;

function createData(id: number, email: string, role: string) {
  return { id, email, role };
}

const rows = [createData(1, 'example@gmail.com', 'Owner')];

function StoreUserTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && rows.length > 0 ? (
            <>
              {rows.map((row) => (
                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.email}
                  </TableCell>
                  <TableCell>{row.role}</TableCell>
                  <TableCell align="right">
                    <Button>Change Role</Button>
                    <Button>Remove</Button>
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
