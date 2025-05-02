import { Box, Button, Card, CardContent, Container, Icon, Stack, Typography } from '@mui/material';
import { useSnackPresistStore, useUserPresistStore, useWalletPresistStore } from 'lib/store';
import { useEffect, useState } from 'react';
import { BLOCKCHAIN, BLOCKCHAINNAMES, CHAINS } from 'packages/constants/blockchain';
import {
  NavigateNext,
  Lock,
  Key,
  GppGood,
  AccountBalanceWallet,
  CellTower,
  Contacts,
  Settings,
} from '@mui/icons-material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

type walletType = {
  id: number;
  address: string;
  type: string;
  network: number;
  chainId: number;
};

const Manage = () => {
  return (
    <Box>
      <Container>
        <Typography variant="h6">Wallet Management</Typography>

        <Box sx={{ bgcolor: 'background.paper' }} mt={4}>
          <nav>
            <List>
              <ListItem>
                <ListItemButton
                  onClick={() => {
                    window.location.href = '/wallets/manage/wallet';
                  }}
                >
                  <ListItemIcon>
                    <AccountBalanceWallet />
                  </ListItemIcon>
                  <ListItemText primary="Wallet Manage" />
                  <Icon component={NavigateNext} />
                </ListItemButton>
              </ListItem>

              <ListItem>
                <ListItemButton
                  onClick={() => {
                    window.location.href = '/wallets/manage/password';
                  }}
                >
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText primary="Payment Password" />
                  <Icon component={NavigateNext} />
                </ListItemButton>
              </ListItem>

              <ListItem>
                <ListItemButton
                  onClick={() => {
                    window.location.href = '/wallets/manage/privatekey';
                  }}
                >
                  <ListItemIcon>
                    <Key />
                  </ListItemIcon>
                  <ListItemText primary="Private Key" />
                  <Icon component={NavigateNext} />
                </ListItemButton>
              </ListItem>

              <ListItem>
                <ListItemButton
                  onClick={() => {
                    window.location.href = '/wallets/manage/addressbook';
                  }}
                >
                  <ListItemIcon>
                    <Contacts />
                  </ListItemIcon>
                  <ListItemText primary="Address Book" />
                  <Icon component={NavigateNext} />
                </ListItemButton>
              </ListItem>

              <ListItem>
                <ListItemButton
                  onClick={() => {
                    window.location.href = '/wallets/manage/audit';
                  }}
                >
                  <ListItemIcon>
                    <GppGood />
                  </ListItemIcon>
                  <ListItemText primary="Security Audit" />
                  <Icon component={NavigateNext} />
                </ListItemButton>
              </ListItem>

              <ListItem>
                <ListItemButton
                  onClick={() => {
                    window.location.href = '/wallets/manage/network';
                  }}
                >
                  <ListItemIcon>
                    <CellTower />
                  </ListItemIcon>
                  <ListItemText primary="Customize Network" />
                  <Icon component={NavigateNext} />
                </ListItemButton>
              </ListItem>

              <ListItem>
                <ListItemButton>
                  <ListItemIcon>
                    <Settings />
                  </ListItemIcon>
                  <ListItemText primary="Others" />
                  <Icon component={NavigateNext} />
                </ListItemButton>
              </ListItem>
            </List>
          </nav>
        </Box>

        {/* <Box mt={5}>
          <Typography fontWeight={'bold'}>Base Setting</Typography>
          <Box mt={2}>
            <Button fullWidth>
              <Card>
                <Stack direction={'row'} justifyContent={'space-between'}>
                  <Typography variant={'h5'}>Wallet backup</Typography>
                  <Icon component={NavigateNext}></Icon>
                </Stack>
              </Card>
            </Button>
          </Box>
        </Box> */}
      </Container>
    </Box>
  );
};

export default Manage;
