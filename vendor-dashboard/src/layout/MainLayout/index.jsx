import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';

// project imports
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContentStyled from './MainContentStyled';
import Loader from 'ui-component/Loader';

import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

// ==============================|| MAIN LAYOUT ||============================== //

export default function MainLayout() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const {
    state: { borderRadius, miniDrawer }
  } = useConfig();
  const { menuMaster, menuMasterLoading } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;

  useEffect(() => {
    handlerDrawerOpen(!miniDrawer);
  }, [miniDrawer]);

  useEffect(() => {
    downMD && handlerDrawerOpen(false);
  }, [downMD]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: theme.vars.palette.background.default,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(12px)',
          zIndex: theme.zIndex.drawer + 1,
          height: '70px',
          justifyContent: 'center'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: '70px !important', height: '70px' }}>
          <Header />
        </Toolbar>
      </AppBar>

      {/* menu / drawer */}
      <Sidebar />

      {/* main content */}
      <MainContentStyled {...{ borderRadius, open: drawerOpen }}>
        <Box sx={{ minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
          <Footer />
        </Box>
      </MainContentStyled>
    </Box>
  );
}
