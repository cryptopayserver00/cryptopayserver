import styled from '@emotion/styled';
import CustomButton from 'components/Button/CustomButton';
import CustomIconButton from 'components/Button/CustomIconButton';
import {
  Box,
  Button,
  ClickAwayListener,
  Divider,
  Drawer,
  Icon,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Stack,
  SwipeableDrawer,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Brightness4, DarkMode, PermIdentity, WbSunny } from '@mui/icons-material';
import { useUserPresistStore } from 'lib/store/user';
import { useStorePresistStore } from 'lib/store/store';
import { useWalletPresistStore } from 'lib/store/wallet';

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  collapsed?: boolean;
}

const StyledButton = styled.a`
  padding: 5px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: inline-block;
  background-color: #fff;
  color: #484848;
  text-decoration: none;
`;

const StyledSidebarFooter = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  /* background: linear-gradient(45deg, rgb(21 87 205) 0%, rgb(90 225 255) 100%); */
  /* background: #0098e5; */
`;

const StyledCollapsedSidebarFooter = styled.a`
  width: 40px;
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  color: white;
  background: linear-gradient(45deg, rgb(21 87 205) 0%, rgb(90 225 255) 100%);
  /* background: #0098e5; */
`;

const codeUrl = 'https://github.com/azouaoui-med/react-pro-sidebar/blob/master/storybook/Playground.tsx';

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ children, collapsed, ...rest }) => {
  const [openAccountDrawer, setOpenAccountDrawer] = useState(false);

  const toggleAccountDrawer = (newOpen: boolean) => () => {
    setOpenAccountDrawer(newOpen);
  };

  const switchlabel = { inputProps: { 'aria-label': 'Switch demo' } };

  const {
    getUsername,
    getUserTheme,
    getUserHideSensitiveInfo,
    setUserHideSensitiveInfo,
    setUserTheme,
    getNetwork,
    setNetwork,
    resetUser,
  } = useUserPresistStore((state) => state);
  const { resetStore } = useStorePresistStore((state) => state);
  const { resetWallet } = useWalletPresistStore((state) => state);

  const handleChangeUserHideSensitiveInfo = (e: any) => {
    setUserHideSensitiveInfo(e.target.checked);
  };

  const handleChangeNetwork = (e: any) => {
    setNetwork(e.target.value);
    window.location.reload();
  };

  const AccountDrawer = (
    <Box sx={{ width: 250 }} role="presentation" p={2}>
      <Typography mb={2}>{getUsername()}</Typography>
      <Divider />
      <Box my={2}>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography>Theme</Typography>
          <Stack direction={'row'} alignItems={'center'}>
            <IconButton
              color={getUserTheme() === 'auto' ? 'primary' : 'default'}
              onClick={() => {
                setUserTheme('auto');
              }}
            >
              <Brightness4 />
            </IconButton>
            <IconButton
              color={getUserTheme() === 'light' ? 'primary' : 'default'}
              onClick={() => {
                setUserTheme('light');
              }}
            >
              <WbSunny />
            </IconButton>
            <IconButton
              color={getUserTheme() === 'dark' ? 'primary' : 'default'}
              onClick={() => {
                setUserTheme('dark');
              }}
            >
              <DarkMode />
            </IconButton>
          </Stack>
        </Stack>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
          <Typography>Hide Sensitive Info</Typography>
          <Box>
            <Switch
              {...switchlabel}
              checked={getUserHideSensitiveInfo()}
              onChange={handleChangeUserHideSensitiveInfo}
            />
          </Box>
        </Stack>
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
          <Typography>Network</Typography>
          <Select
            inputProps={{ 'aria-label': 'Without label' }}
            value={getNetwork()}
            size={'small'}
            onChange={handleChangeNetwork}
          >
            <MenuItem value={'mainnet'} key={1}>
              mainnet
            </MenuItem>
            <MenuItem value={'testnet'} key={2}>
              testnet
            </MenuItem>
          </Select>
        </Stack>
      </Box>
      <Divider />
      <Box my={1}>
        <Button
          onClick={() => {
            window.location.href = '/account';
          }}
        >
          Manage Account
        </Button>
      </Box>
      <Divider />
      <Box my={1}>
        <Button
          color={'error'}
          onClick={() => {
            resetUser();
            resetStore();
            resetWallet();

            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Stack>
      {collapsed ? (
        <StyledCollapsedSidebarFooter href={codeUrl} target="_blank">
          {/* <MdPhone size={28} /> */}
        </StyledCollapsedSidebarFooter>
      ) : (
        <StyledSidebarFooter {...rest}>
          <Box>
            <Button onClick={toggleAccountDrawer(true)}>
              <Icon component={PermIdentity} />
              <Typography ml={1}>Account</Typography>
            </Button>

            <Drawer open={openAccountDrawer} onClose={toggleAccountDrawer(false)} anchor={'right'}>
              {AccountDrawer}
            </Drawer>
          </Box>
        </StyledSidebarFooter>
      )}
    </Stack>
  );
};
