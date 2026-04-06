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
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            overflow: 'hidden',
            transition: 'all .2s ease-in-out',
            color: theme.vars.palette.secondary.dark,
            background: theme.vars.palette.secondary.light,
            '&:hover': {
              color: theme.vars.palette.secondary.light,
              background: theme.vars.palette.secondary.dark
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
            ...theme.typography.commonAvatar,
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            overflow: 'hidden',
            transition: 'all .2s ease-in-out',
            color: theme.vars.palette.secondary.dark,
            background: theme.vars.palette.secondary.light,
            '&:hover': {
              color: theme.vars.palette.secondary.light,
              background: theme.vars.palette.secondary.dark
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
