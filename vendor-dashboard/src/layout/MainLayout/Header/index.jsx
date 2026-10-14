// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import NotificationSection from './NotificationSection';
import ProfileSection from './ProfileSection';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// assets
import { IconMenu2, IconSun, IconMoon, IconExternalLink } from '@tabler/icons-react';

import useThemeMode from 'hooks/useThemeMode';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const { isDark, toggleMode } = useThemeMode();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%' }}>
      {/* Brand: Logo & Company Name + Drawer Toggle Button */}
      {/* FIXED: The logo and company name NEVER move, NEVER hide, and remain static on topbar expand/collapse */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LogoSection />
        </Box>

        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          sx={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            color: isDark ? '#41a0ae' : '#36669c',
            bgcolor: isDark ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.08)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(65, 160, 174, 0.25)' : 'rgba(54, 102, 156, 0.15)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: isDark ? '#41a0ae' : '#36669c',
              color: '#ffffff',
              transform: 'scale(1.04)'
            }
          }}
        >
          <IconMenu2 stroke={1.75} size={20} />
        </IconButton>
      </Box>

      {/* search area */}
      <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 1, md: 3 }, flexGrow: 1 }}>
        <SearchSection />
      </Box>

      {/* right action items */}
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {/* external live website link */}
        <Tooltip title="View Live Website">
          <IconButton
            component="a"
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'grey.50',
              color: 'text.primary',
              display: { xs: 'none', sm: 'inline-flex' },
              transition: 'all .2s ease-in-out',
              '&:hover': {
                bgcolor: isDark ? '#41a0ae' : '#36669c',
                color: '#ffffff',
                borderColor: isDark ? '#41a0ae' : '#36669c'
              }
            }}
          >
            <IconExternalLink stroke={1.5} size="19px" />
          </IconButton>
        </Tooltip>

        {/* light/dark mode toggle */}
        <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton
            onClick={toggleMode}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(65, 160, 174, 0.25)' : 'rgba(54, 102, 156, 0.18)',
              bgcolor: isDark ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.08)',
              color: isDark ? '#77f07f' : '#36669c',
              transition: 'all .2s ease-in-out',
              '&:hover': {
                bgcolor: isDark ? '#41a0ae' : '#36669c',
                color: '#ffffff',
                borderColor: isDark ? '#41a0ae' : '#36669c',
                transform: 'scale(1.04)'
              }
            }}
          >
            {isDark ? <IconSun stroke={1.6} size={20} /> : <IconMoon stroke={1.6} size={20} />}
          </IconButton>
        </Tooltip>

        {/* notification dropdown */}
        <NotificationSection />

        {/* profile user pill */}
        <ProfileSection />
      </Stack>
    </Box>
  );
}
