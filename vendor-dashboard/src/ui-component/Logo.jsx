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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, whiteSpace: 'nowrap' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          bgcolor: '#ffffff',
          p: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.06)',
          flexShrink: 0
        }}
      >
        <img src="/logo.png" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '5px' }} alt="Ababa Travels Logo" />
      </Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          background: `linear-gradient(45deg, ${theme.vars.palette.primary.main} 30%, ${theme.vars.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }}
      >
        ABABA
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 300,
          color: theme.vars.palette.text.secondary,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }}
      >
        TRAVELS
      </Typography>
    </Box>
  );
}
