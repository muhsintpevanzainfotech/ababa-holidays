import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import ModernAuthLayout from './ModernAuthLayout';
import AuthForgotPassword from '../auth-forms/AuthForgotPassword';

export default function ForgotPassword() {
  return (
    <ModernAuthLayout 
      title="Reset Password" 
      subtitle="Enter your registered email address to receive a 6-digit OTP verification code."
    >
      <Box sx={{ width: 1 }}>
        <AuthForgotPassword />
      </Box>
      <Divider sx={{ my: 3 }} />
      <Stack sx={{ alignItems: 'center' }}>
        <Typography 
          variant="body2" 
          sx={{ color: '#64748b' }}
        >
          Remember your password?{' '}
          <Typography 
            component={Link} 
            to="/login" 
            variant="body2" 
            sx={{ 
              textDecoration: 'none', 
              color: '#043e38', 
              fontWeight: 700,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Sign In
          </Typography>
        </Typography>
      </Stack>
    </ModernAuthLayout>
  );
}
