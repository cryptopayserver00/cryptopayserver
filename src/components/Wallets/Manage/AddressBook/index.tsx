import { Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import { FindChainIdsByChainNames, FindChainNamesByChains, GetBlockchainAddressUrlByChainIds } from 'utils/web3';
import { CHAINNAMES } from 'packages/constants/blockchain';
import { GetImgSrcByChain } from 'utils/qrcode';

type RowType = {
  id: number;
  chainId: number;
  isMainnet: boolean;
  name: string;
  address: string;
};

const ManageAddressBook = () => {
  const [rows, setRows] = useState<RowType[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  const [selectId, setSelectId] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [network, setNetwork] = useState<CHAINNAMES>();

  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);

  const onClickDelete = async (id: number) => {
    if (!id) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect selected');
      setSnackOpen(true);
      return;
    }

    try {
      const response: any = await axios.put(Http.delete_address_book_by_id, {
        id: id,
      });

      if (response.result) {
        await init();

        handleClose();

        setSnackSeverity('success');
        setSnackMessage('Successful delete');
        setSnackOpen(true);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const onClickConfirm = async () => {
    if (!name) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect name');
      setSnackOpen(true);
      return;
    }

    if (!address) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect address');
      setSnackOpen(true);
      return;
    }

    if (!network) {
      setSnackSeverity('error');
      setSnackMessage('Incorrect network');
      setSnackOpen(true);
      return;
    }

    try {
      if (selectId && selectId > 0) {
        const response: any = await axios.put(Http.update_address_book_by_id, {
          id: selectId,
          name: name,
          address: address,
          chain_id: FindChainIdsByChainNames(network),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        });

        if (response.result) {
          await init();

          handleClose();

          setSnackSeverity('success');
          setSnackMessage('Successful update');
          setSnackOpen(true);
        } else {
          setSnackSeverity('error');
          setSnackMessage('creation failed, incorrect address or already exists');
          setSnackOpen(true);
        }
      } else {
        const response: any = await axios.post(Http.create_address_book, {
          user_id: getUserId(),
          store_id: getStoreId(),
          chain_id: FindChainIdsByChainNames(network),
          network: getNetwork() === 'mainnet' ? 1 : 2,
          name: name,
          address: address,
        });

        if (response.result && response.data.id) {
          await init();

          handleClose();

          setSnackSeverity('success');
          setSnackMessage('Successful creation!');
          setSnackOpen(true);
        } else {
          setSnackSeverity('error');
          setSnackMessage('creation failed, incorrect address or already exists');
          setSnackOpen(true);
        }
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setName('');
    setAddress('');
    setNetwork(undefined);
    setSelectId(0);

    setOpen(false);
  };

  const init = async () => {
    try {
      const response: any = await axios.get(Http.find_address_book, {
        params: {
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result && response.data.length > 0) {
        let rt: RowType[] = [];
        response.data.forEach((item: any) => {
          rt.push({
            id: item.id,
            chainId: item.chain_id,
            isMainnet: item.network === 1 ? true : false,
            name: item.name,
            address: item.address,
          });
        });

        setRows(rt);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Typography variant="h6">Address Book ({rows.length})</Typography>

        <Box mt={4}>
          <Button fullWidth variant={'contained'} onClick={handleOpen}>
            Add an address
          </Button>
        </Box>

        <Box mt={4}>
          {rows &&
            rows.length > 0 &&
            rows.map((item, index) => (
              <Box key={index} width={'100%'} mb={2}>
                <Card>
                  <CardContent>
                    <Stack direction={'row'} alignItems={'center'} width={'100%'} justifyContent={'space-between'}>
                      <Stack
                        direction={'row'}
                        alignItems={'center'}
                        onClick={() => {
                          setSelectId(item.id);
                          setName(item.name);
                          setAddress(item.address);
                          setNetwork(FindChainNamesByChains(item.chainId));

                          handleOpen();
                        }}
                      >
                        <Image src={GetImgSrcByChain(item.chainId)} alt="image" width={40} height={40} />
                        <Box ml={2}>
                          <Typography fontWeight={'bold'}>{item.name}</Typography>
                          <Typography mt={1}>{item.address}</Typography>
                        </Box>
                      </Stack>

                      <IconButton
                        onClick={async () => {
                          await onClickDelete(item.id);
                        }}
                        edge="end"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            ))}
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">Add an address</DialogTitle>
          <DialogContent>
            <Box mb={2}>
              <Typography mb={1}>Name</Typography>
              <TextField
                size={'small'}
                type="text"
                fullWidth
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Please enter a name, up to 20 characters"
              />
            </Box>
            <Box mb={2}>
              <Typography mb={1}>Address</Typography>
              <TextField
                size={'small'}
                type="text"
                fullWidth
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                }}
                placeholder="Please enter the address"
              />
            </Box>
            <Box mb={2}>
              <Typography mb={1}>Network</Typography>
              <FormControl fullWidth>
                <Select
                  size={'small'}
                  placeholder="Select the network"
                  onChange={(e) => {
                    setNetwork(e.target.value as CHAINNAMES);
                  }}
                  value={network}
                >
                  {CHAINNAMES &&
                    Object.entries(CHAINNAMES).length > 0 &&
                    Object.entries(CHAINNAMES).map((item, index) => (
                      <MenuItem value={item[1]} key={index}>
                        {item[1]}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant={'outlined'} onClick={handleClose}>
              Close
            </Button>
            <Button variant={'contained'} onClick={onClickConfirm}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ManageAddressBook;
