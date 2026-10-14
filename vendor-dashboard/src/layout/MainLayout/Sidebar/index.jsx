import { memo, useMemo } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MenuList from '../MenuList';
import LogoSection from '../LogoSection';
import MiniDrawerStyled from './MiniDrawerStyled';
import { drawerWidth } from 'store/constant';
import SimpleBar from 'ui-component/third-party/SimpleBar';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import useThemeMode from 'hooks/useThemeMode';

// assets
import { IconChevronLeft } from '@tabler/icons-react';

// ==============================|| SIDEBAR DRAWER ||============================== //

function Sidebar() {
  const { isDark } = useThemeMode();
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const mobileLogo = useMemo(
    () => (
      <Box
        sx={{
          display: 'flex',
          px: 2.5,
          height: '70px',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <LogoSection />
        <IconButton
          size="small"
          onClick={() => handlerDrawerOpen(false)}
          sx={{ borderRadius: '8px', p: 0.75 }}
        >
          <IconChevronLeft size={20} />
        </IconButton>
      </Box>
    ),
    []
  );

  const drawer = useMemo(() => {
    let drawerSX = { px: 1, py: 1.5 };
    if (drawerOpen) drawerSX = { px: 1.75, py: 2 };

    return (
      <Box sx={{ height: downMD ? 'calc(100vh - 70px)' : 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column' }}>
        <SimpleBar sx={{ flexGrow: 1, ...drawerSX }}>
          <MenuList />
        </SimpleBar>

        {drawerOpen && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'rgba(0,0,0,0.02)' }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: isDark ? 'rgba(65, 160, 174, 0.08)' : 'rgba(54, 102, 156, 0.06)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(65, 160, 174, 0.2)' : 'rgba(54, 102, 156, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  bgcolor: '#3ec995',
                  boxShadow: '0 0 8px #3ec995',
                  flexShrink: 0
                }}
              />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.primary' }}>
                  Vendor Portal Active
                </Typography>
                <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                  v{import.meta.env.VITE_APP_VERSION || '1.0.0'} • Verified
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  }, [downMD, drawerOpen]);

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: 0,
        width: { xs: 'auto', md: drawerOpen ? drawerWidth : 72 },
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
          })
      }}
      aria-label="vendor drawer folders"
    >
      {downMD ? (
        <Drawer
          variant="temporary"
          anchor="left"
          open={drawerOpen}
          onClose={() => handlerDrawerOpen(!drawerOpen)}
          slotProps={{
            paper: {
              sx: {
                zIndex: 1300,
                width: drawerWidth,
                bgcolor: 'background.default',
                color: 'text.primary',
                borderRight: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) => theme.shadows[8]
              }
            }
          }}
          ModalProps={{ keepMounted: true }}
          color="inherit"
        >
          {mobileLogo}
          {drawer}
        </Drawer>
      ) : (
        <MiniDrawerStyled variant="permanent" open={drawerOpen}>
          {drawer}
        </MiniDrawerStyled>
      )}
    </Box>
  );
}

export default memo(Sidebar);
