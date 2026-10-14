// material-ui
import { styled } from '@mui/material/styles';

// project imports
import { drawerWidth } from 'store/constant';

// ==============================|| MAIN LAYOUT - STYLED ||============================== //

const MainContentStyled = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'borderRadius'
})(({ theme, open, borderRadius }) => ({
  backgroundColor: theme.vars.palette.background.default,
  minWidth: 0,
  width: '100%',
  minHeight: 'calc(100vh - 70px)',
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 70,
  boxSizing: 'border-box',
  transition: theme.transitions.create(['width', 'margin', 'padding'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    marginTop: 70
  }
}));

export default MainContentStyled;
