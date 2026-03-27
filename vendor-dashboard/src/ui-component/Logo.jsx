// material-ui
import { useTheme } from '@mui/material/styles';

// project imports

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ==============================|| LOGO ||============================== //

export default function Logo() {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          background: `linear-gradient(45deg, ${theme.vars.palette.primary.main} 30%, ${theme.vars.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.1em'
        }}
      >
        ABABA
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 300,
          color: theme.vars.palette.text.secondary,
          letterSpacing: '0.1em'
        }}
      >
        TRAVELS
      </Typography>
    </Box>
  );
}
