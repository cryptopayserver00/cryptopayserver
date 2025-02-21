import { NavigateNext } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Icon,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import Image from 'next/image';
import { BLOCKCHAIN, BLOCKCHAINNAMES } from 'packages/constants/blockchain';
import { useEffect, useState } from 'react';
import { VisibilityOff } from '@mui/icons-material';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { FindChainIdsByChainNames, GetBlockchainAddressUrlByChainIds } from 'utils/web3';
import Link from 'next/link';

type RowType = {
  chainId: number;
  isMainnet: boolean;
  address: string;
  privateKey: string;
  view: boolean;
};

const SecurityNetwork = () => {
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>();
  const [currentItem, setCurrentItem] = useState<BLOCKCHAIN>();
  const [open, setOpen] = useState<boolean>(false);

  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getNetwork } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onClickAddNetwork = async () => {};

  useEffect(() => {
    const value = BLOCKCHAINNAMES.filter((item: any) =>
      getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet,
    );
    setBlcokchain(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Typography variant="h6">Customize Network</Typography>
        <Box mt={4}>
          <Button
            variant={'contained'}
            fullWidth
            onClick={() => {
              onClickAddNetwork();
            }}
          >
            Add a network
          </Button>
        </Box>
        <Box mt={4}>
          <Grid container color={'#8f979e'} spacing={3}>
            {blockchain &&
              blockchain.length > 0 &&
              blockchain.map((item, index) => (
                <Grid xs={4} item key={index}>
                  <Card>
                    <CardContent>
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Stack direction={'row'} alignItems={'center'}>
                          <Image src={item.icon} alt="image" width={40} height={40} />
                          <Typography ml={1} fontWeight={'bold'}>
                            {item.name}
                          </Typography>
                        </Stack>
                        <Chip label="Active" color={'success'} />
                      </Stack>

                      <Typography mt={2}>{item.desc}</Typography>

                      <Box mt={4}>
                        <Button
                          variant={'contained'}
                          fullWidth
                          onClick={() => {
                            setCurrentItem(item);
                            handleOpen();
                          }}
                        >
                          Check Network
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">{currentItem?.name}</DialogTitle>
          <DialogContent>
            <Box mb={2}>
              <Typography mb={1}>Network name</Typography>
              <TextField size={'small'} type="text" fullWidth value={currentItem?.name} disabled />
            </Box>
            <Box mb={2}>
              <Typography mb={1}>RPC URL</Typography>
              {currentItem?.rpc &&
                currentItem.rpc.map((item, index) => (
                  <TextField key={index} size={'small'} type="text" fullWidth value={item} disabled />
                ))}
            </Box>
            <Box mb={2}>
              <Typography mb={1}>Chain ID</Typography>
              <TextField size={'small'} type="text" fullWidth value={currentItem?.chainId} disabled />
            </Box>
            <Box mb={2}>
              <Typography mb={1}>Symbol</Typography>
              <TextField size={'small'} type="text" fullWidth value={currentItem?.coins[0].symbol} disabled />
            </Box>
            <Box mb={2}>
              <Typography mb={1}>Website</Typography>
              <TextField size={'small'} type="text" fullWidth value={currentItem?.websiteUrl} disabled />
            </Box>
            <Box mb={2}>
              <Typography mb={1}>Blockchain browser</Typography>
              <TextField size={'small'} type="text" fullWidth value={currentItem?.explorerUrl} disabled />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SecurityNetwork;
