import { Box, Button, Stack, Typography } from '@mui/material';
import { useSnackPresistStore } from 'lib/store';

const Forms = () => {
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  return (
    <Box>
      <Box>
        <Stack direction={'row'} justifyContent={'space-between'}>
          <Typography variant="h6">Forms</Typography>
          <Button
            variant={'contained'}
            onClick={() => {
              setSnackSeverity('warning');
              setSnackMessage('no support right now!');
              setSnackOpen(true);
              return;
            }}
          >
            Create Form
          </Button>
        </Stack>

        <Typography mt={5}>There are no forms yet.</Typography>
      </Box>
    </Box>
  );
};

export default Forms;
