// material-ui
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';

// project imports
import { drawerWidth } from 'store/constant';

function openedMixin(theme) {
  return {
    width: drawerWidth,
    borderRight: '1px solid',
    borderColor: theme.vars?.palette?.divider || theme.palette.divider,
    zIndex: 1099,
    top: '70px !important',
    height: 'calc(100vh - 70px) !important',
    background: theme.vars?.palette?.background?.default || theme.palette.background.default,
    overflowX: 'hidden',
    boxShadow: 'none',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  };
}

function closedMixin(theme) {
  return {
    borderRight: '1px solid',
    borderColor: theme.vars?.palette?.divider || theme.palette.divider,
    zIndex: 1099,
    top: '70px !important',
    height: 'calc(100vh - 70px) !important',
    background: theme.vars?.palette?.background?.default || theme.palette.background.default,
    overflowX: 'hidden',
    width: 72,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  };
}

// ==============================|| DRAWER - MINI STYLED ||============================== //

const MiniDrawerStyled = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  borderRight: '0px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
}));

export default MiniDrawerStyled;
