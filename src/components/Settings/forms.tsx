import { Box, Button, Stack, Typography } from '@mui/material';

const Forms = () => {
  return (
    <Box>
      <Box>
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="h6">Roles</Typography>
          <Button
            variant={'contained'}
            onClick={() => {
              alert('no suuport right now!');
            }}
          >
            Create Form
          </Button>
        </Stack>

        <Typography mt={5}>
          CryptoPay Server&apos;s Forms Builder enables you to request specific information from your customer.
        </Typography>

        <Typography mt={5}>There are no forms yet.</Typography>
      </Box>
    </Box>
  );
};

export default Forms;
