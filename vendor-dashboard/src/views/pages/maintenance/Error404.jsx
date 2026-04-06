import React from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Button, Card, CardContent, CardMedia, Grid, Stack, Typography, Box } from '@mui/material';

// styles
const ErrorWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' ? theme.palette.dark.main : '#f8fafc',
  position: 'relative',
  overflow: 'hidden'
}));

const CardMediaWrapper = styled('div')({
  maxWidth: 720,
  margin: '0 auto',
  position: 'relative'
});

const ErrorCard = styled(Card)({
  minWidth: 280,
  maxWidth: 400,
  margin: '0 auto',
  textAlign: 'center',
  position: 'relative',
  zIndex: 5
});

// ==============================|| ERROR PAGE ||============================== //

const Error404 = () => {
  const theme = useTheme();

  return (
    <ErrorWrapper>
      {/* Decorative Gradients */}
      <Box sx={{ 
        position: 'absolute', top: -150, left: -150, width: 400, height: 400, 
        background: 'radial-gradient(circle, rgba(103, 58, 183, 0.08) 0%, transparent 70%)', 
        borderRadius: '50%' 
      }} />
      <Box sx={{ 
        position: 'absolute', bottom: -150, right: -150, width: 400, height: 400, 
        background: 'radial-gradient(circle, rgba(33, 150, 243, 0.08) 0%, transparent 70%)', 
        borderRadius: '50%' 
      }} />

      <Grid container direction="column" alignItems="center" justifyContent="center">
        <Grid item xs={12}>
          <CardMediaWrapper>
             <Box sx={{ width: '100%', maxWidth: 480, margin: '0 auto', mb: 3 }}>
                <img src="https://cdni.iconscout.com/illustration/premium/thumb/404-error-page-not-found-illustration-download-in-svg-png-gif-formats--search-logo-modern-pack-network-communication-illustrations-4790938.png" 
                     alt="404" 
                     style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))' }} 
                />
             </Box>
          </CardMediaWrapper>
        </Grid>
        <Grid item xs={12}>
          <ErrorCard elevation={0}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h1" component="div" sx={{ fontSize: '4rem', fontWeight: 900, color: 'secondary.main', mb: 0 }}>
                  404
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  Something is wrong!
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', px: 2 }}>
                  The page you are looking for was moved, removed, renamed, or might never have existed.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Button variant="contained" color="secondary" size="large" component={Link} to="/" sx={{ px: 4, borderRadius: '12px', fontWeight: 'bold', textTransform: 'none' }}>
                    Back to Home
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </ErrorCard>
        </Grid>
      </Grid>
    </ErrorWrapper>
  );
};

export default Error404;
