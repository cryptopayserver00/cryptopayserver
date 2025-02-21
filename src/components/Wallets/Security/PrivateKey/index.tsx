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

const SecurityPrivateKey = () => {
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>();
  const [currentItem, setCurrentItem] = useState<BLOCKCHAIN>();
  const [open, setOpen] = useState<boolean>(false);
  const [rows, setRows] = useState<RowType[]>([]);

  const { getWalletId } = useWalletPresistStore((state) => state);
  const { getNetwork } = useUserPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onClickPrivateKeyItem = async (item: BLOCKCHAIN) => {
    try {
      const response: any = await axios.get(Http.find_private_key_by_chain_and_network, {
        params: {
          wallet_id: getWalletId(),
          chain_id: FindChainIdsByChainNames(item.name),
          network: item.isMainnet ? 1 : 2,
        },
      });

      if (response.result && response.data.length > 0) {
        let rt: RowType[] = [];
        response.data.forEach((element: any) => {
          rt.push({
            chainId: FindChainIdsByChainNames(item.name),
            isMainnet: item.isMainnet,
            address: element.address,
            privateKey: element.private_key,
            view: false,
          });
        });

        setRows(rt);
      } else {
        setSnackSeverity('error');
        setSnackMessage('Can not find the data on site!');
        setSnackOpen(true);
      }

      setCurrentItem(item);
      handleOpen();
    } catch (e) {
      console.error(e);
    }
  };

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
                        onClickPrivateKeyItem(item);
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
              {rows &&
                rows.map((item, index) => (
                  <Box key={index} mb={4}>
                    <Link
                      href={GetBlockchainAddressUrlByChainIds(item.isMainnet, item.chainId, item.address)}
                      target="_blank"
                    >
                      {item.address}
                    </Link>
                    <Box mt={1}>
                      {item.view ? (
                        <Box mt={2}>
                          <TextField multiline fullWidth value={item.privateKey} disabled rows={5} />
                        </Box>
                      ) : (
                        <Box
                          style={{
                            position: 'relative',
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            color: '#fff',
                          }}
                          onClick={() => {
                            const newRows = [...rows];
                            newRows[index].view = true;
                            setRows(newRows);
                          }}
                        >
                          <Box mt={2} p={2}>
                            <Icon component={VisibilityOff} fontSize={'large'} />
                            <Typography mt={1}>Click to view private key</Typography>
                            <Typography mt={2}>Please make sure no one can view your screen</Typography>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <Stack direction={'row'} alignItems={'center'} justifyContent={'right'} mt={1}>
                      <Box mr={1}>
                        {item.view ? (
                          <Button
                            variant={'outlined'}
                            onClick={() => {
                              const newRows = [...rows];
                              newRows[index].view = false;
                              setRows(newRows);
                            }}
                          >
                            Hide
                          </Button>
                        ) : (
                          <Button
                            variant={'outlined'}
                            onClick={() => {
                              const newRows = [...rows];
                              newRows[index].view = true;
                              setRows(newRows);
                            }}
                          >
                            View
                          </Button>
                        )}
                      </Box>
                      <Button
                        variant={'outlined'}
                        onClick={async () => {
                          await navigator.clipboard.writeText(item.privateKey);

                          setSnackMessage('Successfully copy');
                          setSnackSeverity('success');
                          setSnackOpen(true);
                        }}
                      >
                        Copy
                      </Button>
                    </Stack>
                  </Box>
                ))}
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

export default SecurityPrivateKey;
