import { Link } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import ModernAuthLayout from './ModernAuthLayout';
import AuthRegister from '../auth-forms/AuthRegister';

export default function Register() {
  return (
    <ModernAuthLayout 
      title="Partner Registration" 
      subtitle="Register your vendor business to manage travel & trip packages globally."
    >
      <Box sx={{ width: 1 }}>
        <AuthRegister />
      </Box>
      <Divider sx={{ my: 3 }} />
      <Stack sx={{ alignItems: 'center' }}>
        <Typography 
          variant="body2" 
          sx={{ color: '#64748b' }}
        >
          Already have an Account?{' '}
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
