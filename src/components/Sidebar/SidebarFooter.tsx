// import styled from '@emotion/styled';
// import CustomButton from '@/components/Button/CustomButton';
// import CustomIconButton from '@/components/Button/CustomIconButton';
// import {
//   Box,
//   Button,
//   ClickAwayListener,
//   Divider,
//   Drawer,
//   Icon,
//   IconButton,
//   MenuItem,
//   Popover,
//   Select,
//   Stack,
//   SwipeableDrawer,
//   Switch,
//   Typography,
// } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { Brightness4, DarkMode, PermIdentity, WbSunny } from '@mui/icons-material';
// import { useUserPresistStore } from '@/lib/store/user';
// import { useStorePresistStore } from '@/lib/store/store';
// import { useWalletPresistStore } from '@/lib/store/wallet';
// import { LANGUAGES } from '@/packages/constants';
// import { useTranslation } from 'react-i18next';

// interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
//   children?: React.ReactNode;
//   collapsed?: boolean;
// }

// const StyledButton = styled.a`
//   padding: 5px 16px;
//   border-radius: 4px;
//   border: none;
//   cursor: pointer;
//   display: inline-block;
//   background-color: #fff;
//   color: #484848;
//   text-decoration: none;
// `;

// const StyledSidebarFooter = styled.div`
//   width: 60%;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   padding: 20px;
//   border-radius: 8px;
//   /* background: linear-gradient(45deg, rgb(21 87 205) 0%, rgb(90 225 255) 100%); */
//   /* background: #0098e5; */
// `;

// const StyledCollapsedSidebarFooter = styled.a`
//   width: 40px;
//   height: 40px;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   border-radius: 50%;
//   color: white;
//   background: linear-gradient(45deg, rgb(21 87 205) 0%, rgb(90 225 255) 100%);
//   /* background: #0098e5; */
// `;

// const codeUrl = 'https://github.com/azouaoui-med/react-pro-sidebar/blob/master/storybook/Playground.tsx';

// export const SidebarFooter: React.FC<SidebarFooterProps> = ({ children, collapsed, ...rest }) => {
//   const { t, i18n } = useTranslation('');
//   const [openAccountDrawer, setOpenAccountDrawer] = useState(false);
//   const [language, setLanguage] = useState<string>('');

//   const toggleAccountDrawer = (newOpen: boolean) => () => {
//     setOpenAccountDrawer(newOpen);
//   };

//   const switchlabel = { inputProps: { 'aria-label': 'Switch demo' } };

//   const {
//     getUsername,
//     getUserTheme,
//     getUserHideSensitiveInfo,
//     setUserHideSensitiveInfo,
//     setUserTheme,
//     getNetwork,
//     setNetwork,
//     resetUser,
//     getLang,
//     setLang,
//   } = useUserPresistStore((state) => state);
//   const { resetStore } = useStorePresistStore((state) => state);
//   const { resetWallet } = useWalletPresistStore((state) => state);

//   const handleChangeUserHideSensitiveInfo = (e: any) => {
//     setUserHideSensitiveInfo(e.target.checked);
//   };

//   const handleChangeNetwork = (e: any) => {
//     setNetwork(e.target.value);
//     window.location.reload();
//   };

//   const onChangeLanguage = async (lang: string) => {
//     setLanguage(lang);
//     const code = LANGUAGES.find((item) => item.name === lang)?.code;
//     setLang(code || 'en');
//     i18n.changeLanguage(code || 'en');
//   };

//   useEffect(() => {
//     if (getLang() && getLang() !== '') {
//       setLanguage(LANGUAGES.find((item) => item.code === String(getLang()))?.name || 'English');
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <Stack>
//       {collapsed ? (
//         <StyledCollapsedSidebarFooter href={codeUrl} target="_blank">
//           {/* <MdPhone size={28} /> */}
//         </StyledCollapsedSidebarFooter>
//       ) : (
//         <StyledSidebarFooter {...rest}>
//           <Box>
//             <Button onClick={toggleAccountDrawer(true)}>
//               <Icon component={PermIdentity} />
//               <Typography ml={1}>Account</Typography>
//             </Button>

//             <Drawer open={openAccountDrawer} onClose={toggleAccountDrawer(false)} anchor={'right'}>
//               <Box sx={{ width: 250 }} role="presentation" p={2}>
//                 <Typography mb={2}>{getUsername()}</Typography>
//                 <Divider />
//                 <Box my={2}>
//                   <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
//                     <Typography>Theme</Typography>
//                     <Stack direction={'row'} alignItems={'center'}>
//                       <IconButton
//                         color={getUserTheme() === 'auto' ? 'primary' : 'default'}
//                         onClick={() => {
//                           setUserTheme('auto');
//                         }}
//                       >
//                         <Brightness4 />
//                       </IconButton>
//                       <IconButton
//                         color={getUserTheme() === 'light' ? 'primary' : 'default'}
//                         onClick={() => {
//                           setUserTheme('light');
//                         }}
//                       >
//                         <WbSunny />
//                       </IconButton>
//                       <IconButton
//                         color={getUserTheme() === 'dark' ? 'primary' : 'default'}
//                         onClick={() => {
//                           setUserTheme('dark');
//                         }}
//                       >
//                         <DarkMode />
//                       </IconButton>
//                     </Stack>
//                   </Stack>
//                   <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
//                     <Typography>Hide Sensitive Info</Typography>
//                     <Box>
//                       <Switch
//                         {...switchlabel}
//                         checked={getUserHideSensitiveInfo()}
//                         onChange={handleChangeUserHideSensitiveInfo}
//                       />
//                     </Box>
//                   </Stack>
//                   <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
//                     <Typography>Network</Typography>
//                     <Select
//                       inputProps={{ 'aria-label': 'Without label' }}
//                       value={getNetwork()}
//                       size={'small'}
//                       onChange={handleChangeNetwork}
//                     >
//                       <MenuItem value={'mainnet'} key={1}>
//                         mainnet
//                       </MenuItem>
//                       <MenuItem value={'testnet'} key={2}>
//                         testnet
//                       </MenuItem>
//                     </Select>
//                   </Stack>
//                   <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} mt={2}>
//                     <Typography>Language</Typography>
//                     <Select
//                       size={'small'}
//                       inputProps={{ 'aria-label': 'Without label' }}
//                       value={language}
//                       onChange={(e: any) => {
//                         onChangeLanguage(e.target.value);
//                       }}
//                     >
//                       {LANGUAGES &&
//                         LANGUAGES.length > 0 &&
//                         LANGUAGES.map((item, index) => (
//                           <MenuItem value={item.name} key={index}>
//                             {item.name}
//                           </MenuItem>
//                         ))}
//                     </Select>
//                   </Stack>
//                 </Box>
//                 <Divider />
//                 <Box my={1}>
//                   <Button
//                     onClick={() => {
//                       window.location.href = '/account';
//                     }}
//                   >
//                     Manage Account
//                   </Button>
//                 </Box>
//                 <Divider />
//                 <Box my={1}>
//                   <Button
//                     color={'error'}
//                     onClick={() => {
//                       resetUser();
//                       resetStore();
//                       resetWallet();

//                       setTimeout(() => {
//                         window.location.href = '/login';
//                       }, 1000);
//                     }}
//                   >
//                     Logout
//                   </Button>
//                 </Box>
//               </Box>
//             </Drawer>
//           </Box>
//         </StyledSidebarFooter>
//       )}
//     </Stack>
//   );
// };

import { useEffect, useState } from 'react'
import { User, Sun, Moon, Monitor, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useUserPresistStore } from '@/lib/store/user'
import { useStorePresistStore } from '@/lib/store/store'
import { useWalletPresistStore } from '@/lib/store/wallet'
import { LANGUAGES } from '@/packages/constants'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  collapsed?: boolean
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  collapsed,
  className,
  ...rest
}) => {
  const { t, i18n } = useTranslation('')
  const [language, setLanguage] = useState<string>('')

  const {
    getUsername,
    getUserTheme,
    getUserHideSensitiveInfo,
    setUserHideSensitiveInfo,
    setUserTheme,
    getNetwork,
    setNetwork,
    resetUser,
    getLang,
    setLang,
  } = useUserPresistStore((state) => state)
  const { resetStore } = useStorePresistStore((state) => state)
  const { resetWallet } = useWalletPresistStore((state) => state)

  const handleChangeUserHideSensitiveInfo = (checked: boolean) => {
    setUserHideSensitiveInfo(checked)
  }

  const handleChangeNetwork = (value: 'mainnet' | 'testnet') => {
    setNetwork(value)
    window.location.reload()
  }

  const onChangeLanguage = async (lang: string) => {
    setLanguage(lang)
    const code = LANGUAGES.find((item) => item.name === lang)?.code
    setLang(code || 'en')
    i18n.changeLanguage(code || 'en')
  }

  useEffect(() => {
    if (getLang() && getLang() !== '') {
      setLanguage(LANGUAGES.find((item) => item.code === String(getLang()))?.name || 'English')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (collapsed) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-white" />
      </div>
    )
  }

  return (
    <div
      className={cn('flex w-full flex-col items-center justify-center px-4 py-4', className)}
      {...rest}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <User className="h-4 w-4" />
            Account
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[280px] sm:w-[320px]">
          <SheetHeader>
            <SheetTitle className="text-left">{getUsername()}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Theme */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Theme
              </Label>
              <div className="flex items-center gap-1">
                <Button
                  variant={getUserTheme() === 'auto' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setUserTheme('auto')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={getUserTheme() === 'light' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setUserTheme('light')}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={getUserTheme() === 'dark' ? 'default' : 'outline'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setUserTheme('dark')}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Hide Sensitive Info */}
            <div className="flex items-center justify-between">
              <Label htmlFor="hide-sensitive" className="text-sm">
                Hide Sensitive Info
              </Label>
              <Switch
                id="hide-sensitive"
                checked={getUserHideSensitiveInfo()}
                onCheckedChange={handleChangeUserHideSensitiveInfo}
              />
            </div>

            <Separator />

            {/* Network */}
            <div className="space-y-2">
              <Label className="text-sm">Network</Label>
              <Select value={getNetwork()} onValueChange={handleChangeNetwork}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">mainnet</SelectItem>
                  <SelectItem value="testnet">testnet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-sm">Language</Label>
              <Select value={language} onValueChange={onChangeLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES?.map((item) => (
                    <SelectItem key={item.code} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Manage Account */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                window.location.href = '/account'
              }}
            >
              <Settings className="h-4 w-4" />
              Manage Account
            </Button>

            <Separator />

            {/* Logout */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                resetUser()
                resetStore()
                resetWallet()
                setTimeout(() => {
                  window.location.href = '/login'
                }, 1000)
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
