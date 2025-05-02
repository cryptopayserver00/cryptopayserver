import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Icon,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackPresistStore, useStorePresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import axios from 'utils/http/axios';
import { Http } from 'utils/http/http';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { AccountBalanceWallet, ExpandMore, ReportGmailerrorred } from '@mui/icons-material';
import Image from 'next/image';
import BitcoinSVG from 'assets/chain/bitcoin.svg';
import { BLOCKCHAIN, BLOCKCHAINNAMES, COIN } from 'packages/constants/blockchain';

type walletType = {
  id: number;
  address: string;
  type: string;
  network: number;
  chainId: number;
};

type blockchainCoinType = {
  icon: any;
  isMainCoin: boolean;
  address: string;
  balance: string;
  enabled: boolean;
  scan: boolean;
};

type blockchainType = {
  icon: any;
  name: string;
  desc: string;
  coins: blockchainCoinType[];
};

const ManageWallet = () => {
  const [name, setName] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [isBackup, setIsBackup] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const [openExplain, setOpenExplain] = useState<boolean>(false);
  const [wallet, setWallet] = useState<walletType[]>([]);
  const [blockchain, setBlcokchain] = useState<BLOCKCHAIN[]>([]);

  const { getWalletId } = useWalletPresistStore((state) => state);
  const { setSnackSeverity, setSnackOpen, setSnackMessage } = useSnackPresistStore((state) => state);
  const { getUserId, getNetwork } = useUserPresistStore((state) => state);
  const { getStoreId } = useStorePresistStore((state) => state);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onClickRename = async () => {
    try {
      if (!newName || newName === '') {
        setSnackSeverity('error');
        setSnackMessage('Incorrect name input');
        setSnackOpen(true);
        return;
      }

      const response: any = await axios.put(Http.update_name_by_wallet_id, {
        wallet_id: getWalletId(),
        name: newName,
      });
      if (response.result) {
        setSnackSeverity('success');
        setSnackMessage('Successful update!');
        setSnackOpen(true);

        await init();

        handleClose();
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const getNetworkInfo = async () => {
    const value = BLOCKCHAINNAMES.filter((item) => (getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet));

    setBlcokchain(value);
  };

  const getWalletManage = async () => {
    try {
      const response: any = await axios.get(Http.find_wallet_manage_by_network, {
        params: {
          wallet_id: getWalletId(),
          store_id: getStoreId(),
          network: getNetwork() === 'mainnet' ? 1 : 2,
        },
      });
      if (response.result) {
        const respBalances = response.data.balances;
        const respCoins = response.data.coins;
        const respScan = response.data.scan;

        const blockchain = BLOCKCHAINNAMES.filter((item) =>
          getNetwork() === 'mainnet' ? item.isMainnet : !item.isMainnet,
        );

        let blockchains: blockchainType[] = [];
        for (const chain of blockchain) {
          let blockchain: blockchainType = {
            icon: chain.icon,
            name: chain.name,
            desc: chain.desc,
            coins: [],
          };

          let coins: blockchainCoinType[] = [];
          for (const coin of chain.coins) {
            let blockchainCoin: blockchainCoinType = {
              icon: coin.icon,
              isMainCoin: coin.isMainCoin,
              address: '',
              balance: '',
              enabled: false,
              scan: false,
            };

            const findBalance = respBalances.find((item: any) => item.chain_id === coin.chainId);

            blockchainCoin.address = findBalance.address ? findBalance?.address : '';
            blockchainCoin.balance = findBalance.balance[coin.name] ? findBalance.balance[coin.name] : '0';
            blockchainCoin.enabled = respCoins.find(
              (item: any) => item.chain_id === coin.chainId && item.name === coin.name,
            ).enabled;

            if (respScan.result) {
              blockchainCoin.scan = true;
            } else {
              blockchainCoin.scan = respScan.data.find(
                (item: any) => item.chain_id === coin.chainId && item.address === blockchainCoin.address,
              )
                ? true
                : false;
            }

            coins.push(blockchainCoin);
          }

          blockchain.coins = coins;
          blockchains.push(blockchain);
        }

        console.log(111, blockchains);
      }
    } catch (e) {
      setSnackSeverity('error');
      setSnackMessage('The network error occurred. Please try again later.');
      setSnackOpen(true);
      console.error(e);
    }
  };

  const init = async () => {
    setNewName('');
    await getNetworkInfo();
    await getWalletManage();

    // try {
    //   const response: any = await axios.get(Http.find_wallet_by_id, {
    //     params: {
    //       id: getWalletId(),
    //     },
    //   });

    //   if (response.result && response.data) {
    //     setName(response.data.name);
    //     setIsBackup(response.data.is_backup === 1 ? true : false);
    //   }
    // } catch (e) {
    //   setSnackSeverity('error');
    //   setSnackMessage('The network error occurred. Please try again later.');
    //   setSnackOpen(true);
    //   console.error(e);
    // }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Container>
        <Typography variant="h6">Wallet Manage</Typography>

        <Box mt={4}>
          <Card>
            <CardContent>
              <Stack direction={'row'} alignItems={'flex-start'} justifyContent={'space-between'}>
                <Stack direction={'row'} alignItems={'center'}>
                  <Icon component={AccountBalanceWallet} fontSize={'large'} />
                  <Typography fontWeight={'bold'} px={2}>
                    {name ? name : 'UNKOWN NAME'}
                  </Typography>
                  <Chip color={isBackup ? 'success' : 'error'} label={isBackup ? 'Backed up' : 'Not backed up'} />
                </Stack>
                <Stack direction={'row'} alignItems={'center'} gap={1}>
                  <Button variant={'contained'} onClick={handleOpen}>
                    Rename wallet
                  </Button>
                  <Button
                    color="success"
                    variant={'contained'}
                    onClick={() => {
                      window.location.href = '/wallet/phrase/intro';
                    }}
                  >
                    Go back up
                  </Button>
                </Stack>
              </Stack>

              <Box mt={4}>
                <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'} pb={2}>
                  <Stack direction={'row'} alignItems={'center'}>
                    <Typography variant="h6">Address Manage</Typography>
                    <IconButton
                      onClick={() => {
                        setOpenExplain(!openExplain);
                      }}
                    >
                      <ReportGmailerrorred />
                    </IconButton>
                  </Stack>

                  <Button variant={'contained'} color={'success'}>
                    Refresh
                  </Button>
                </Stack>

                {openExplain && (
                  <Alert severity="info">
                    <AlertTitle>Info</AlertTitle>
                    Refresh: All data of the blockchain tokens will be refreshed.
                    <br />
                    Enable or Disable: Click the following button to enable or disable the display of this token,
                    involving all the users who create invoices.
                  </Alert>
                )}

                {blockchain &&
                  blockchain.length > 0 &&
                  blockchain.map((item, index) => (
                    <Accordion defaultExpanded={index === 0 || index === 1 ? true : false} key={index}>
                      <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel1-content">
                        <Stack direction={'row'} alignItems={'center'} gap={2}>
                          <Image src={item.icon} alt="icon" width={40} height={40} />
                          <Typography>{item.name}</Typography>
                          <Chip color="success" label={'Scanned'} variant={'filled'} />
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{item.desc}</Typography>
                        <Typography py={2} fontWeight={'bold'} color={'orange'}>
                          Click the following button to enable or disable the display of this token
                        </Typography>
                        {item.coins &&
                          item.coins.length > 0 &&
                          item.coins.map((coinItem, coinIndex) => (
                            <Stack
                              direction={'row'}
                              alignItems={'center'}
                              justifyContent={'space-between'}
                              pb={2}
                              key={coinIndex}
                            >
                              <Stack direction={'row'} alignItems={'center'} gap={2}>
                                <Image src={coinItem.icon} alt="icon" width={40} height={40} />
                                <Typography>0x4e16f68b13f15b40b0313f35E01bF2e6F636eB9a</Typography>
                                {coinItem.isMainCoin && <Chip color={'info'} label={'main coin'} variant={'filled'} />}
                                <Chip color={'primary'} label={'100.123'} variant={'filled'} />
                              </Stack>
                              <Switch
                                checked={false}
                                onChange={() => {
                                  // setShowSound(!showSound);
                                }}
                              />
                            </Stack>
                          ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}

                {/* <Image src={GetImgSrcByChain(FindChainIdsByChainNames(item[1]))} alt="icon" width={30} height={30} /> */}

                {/* {wallet &&
                  wallet.length > 0 &&
                  wallet.map((item, index) => (
                    <Box key={index} mb={4}>
                      <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                        <Box>
                          <Typography fontWeight={'bold'} fontSize={14}>
                            {item.type}
                          </Typography>
                          <Typography mt={1}>{item.address}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))} */}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">Rename Wallet</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              required
              margin="dense"
              type={'text'}
              fullWidth
              variant="standard"
              value={newName}
              onChange={(e: any) => {
                setNewName(e.target.value);
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button variant={'contained'} onClick={handleClose}>
              Close
            </Button>
            <Button variant={'contained'} onClick={onClickRename} color="success">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ManageWallet;
