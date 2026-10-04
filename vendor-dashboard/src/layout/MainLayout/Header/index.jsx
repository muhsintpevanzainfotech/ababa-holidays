// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

// project imports
import LogoSection from '../LogoSection';
import Breadcrumbs from 'ui-component/extended/Breadcrumbs';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
import { IconMenu2, IconSun, IconMoon } from '@tabler/icons-react';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all .2s ease-in-out',
            color: mode === 'dark' ? '#41a0ae' : '#36669c',
            background: mode === 'dark' ? 'rgba(65, 160, 174, 0.18)' : 'rgba(54, 102, 156, 0.1)',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(65, 160, 174, 0.3)' : 'rgba(54, 102, 156, 0.2)',
            '&:hover': {
              color: '#ffffff',
              background: '#36669c'
            }
          }}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
        >
          <IconMenu2 stroke={1.5} size="20px" />
        </Avatar>
      </Box>

      {/* breadcrumbs feed in center header area */}
      <Box sx={{ flexGrow: 1, ml: 4, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
        <Breadcrumbs card={false} title={false} divider={false} sx={{ mb: 0, '& .MuiTypography-root': { mt: 0 } }} />
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />

      {/* theme toggle and actions standard group */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', ml: 2 }}>
        <Avatar
          variant="rounded"
          sx={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all .2s ease-in-out',
            color: mode === 'dark' ? '#77f07f' : '#36669c',
            background: mode === 'dark' ? 'rgba(58, 47, 107, 0.4)' : 'rgba(54, 102, 156, 0.1)',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(119, 240, 127, 0.3)' : 'rgba(54, 102, 156, 0.2)',
            '&:hover': {
              color: '#ffffff',
              background: '#41a0ae'
            }
          }}
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
        >
          {mode === 'light' ? <IconMoon stroke={1.5} size="22px" /> : <IconSun stroke={1.5} size="22px" />}
        </Avatar>

        {/* notification */}
        <NotificationSection />

        {/* profile */}
        <ProfileSection />
      </Stack>
    </>
  );
}
