import { NavigateNext } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Icon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useUserPresistStore } from 'lib/store';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import { VisibilityOff } from '@mui/icons-material';

const SecurityPrivateKey = () => {
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>();
  const [currentItem, setCurrentItem] = useState<BLOCKCHAIN>();
  const [open, setOpen] = useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState<string>('');

  const [isView, setIsView] = useState<boolean>(false);
  const [isDisable, setIsDisable] = useState<boolean>(true);

  const { getNetwork } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) =>
      getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet,
    );
    setBlcokchain(value);
  }, [getNetwork()]);

  return (
    <Box>
      <Container>
        <Typography variant="h6">Private Key</Typography>

        <Box sx={{ bgcolor: 'background.paper' }} mt={4}>
          <nav>
            <List>
              {blockchain &&
                blockchain.length > 0 &&
                blockchain.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemButton
                      onClick={() => {
                        setCurrentItem(item);
                        handleOpen();
                      }}
                    >
                      <ListItemIcon>
                        <Image src={item.icon} alt="image" width={40} height={40} />
                      </ListItemIcon>
                      <ListItemText primary={item.name} />
                      <Icon component={NavigateNext} />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
          </nav>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{currentItem?.name}</DialogTitle>
          <DialogContent>
            <Box>
              {!isView && (
                <Box
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    color: '#fff',
                  }}
                  onClick={() => {
                    setIsView(true);
                    setIsDisable(false);
                  }}
                >
                  <Box>
                    <Icon component={VisibilityOff} fontSize={'large'} />
                    <Typography mt={4}>Click to view private key</Typography>
                    <Typography mt={1}>Please make sure no one can view your screen</Typography>
                  </Box>
                </Box>
              )}
              <Box
                onClick={() => {
                  setIsView(false);
                }}
              >
                <Card variant="outlined">
                  <CardContent>{privateKey}</CardContent>
                </Card>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(privateKey);

                setSnackMessage('Successfully copy');
                setSnackSeverity('success');
                setSnackOpen(true);
              }}
            >
              Copy
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SecurityPrivateKey;
