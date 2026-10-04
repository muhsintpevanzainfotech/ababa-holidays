import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// project imports
import ModernAuthLayout from './ModernAuthLayout';
import AuthLogin from '../auth-forms/AuthLogin';

export default function Login() {
  const theme = useTheme();
  const isLightExplicit = theme.palette.mode === 'light' && document.documentElement.getAttribute('data-color-scheme') === 'light';
  const isDark = !isLightExplicit;

  return (
    <ModernAuthLayout 
      title="Welcome Back!" 
      subtitle="Sign in to access your dashboard and continue managing your travel & trip offerings."
    >
      <Box sx={{ width: 1 }}>
        <AuthLogin />
      </Box>
      <Divider sx={{ my: 3, borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0' }} />
      <Stack sx={{ alignItems: 'center' }}>
        <Typography 
          variant="body2" 
          sx={{ color: isDark ? '#9ca3af' : '#64748b' }}
        >
          Don&apos;t have an Account?{' '}
          <Typography 
            component={Link} 
            to="/register" 
            variant="body2" 
            sx={{ 
              textDecoration: 'none', 
              color: '#36669c', 
              fontWeight: 700,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Sign Up
          </Typography>
        </Typography>
      </Stack>
    </ModernAuthLayout>
  );
}
