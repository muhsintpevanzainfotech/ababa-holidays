import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Stack, 
  Typography, 
  Box, 
  Chip,
  Container 
} from '@mui/material';

// icons
import { IconHome, IconTools, IconRefresh, IconClock } from '@tabler/icons-react';

// styles
const ErrorWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? 'radial-gradient(circle at 50% 50%, #1e1e2d 0%, #0d0e12 100%)' 
    : 'radial-gradient(circle at 50% 50%, #eef2f6 0%, #e0e7ff 100%)',
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(3)
}));

const ErrorCard = styled(Card)(({ theme }) => ({
  maxWidth: 580,
  width: '100%',
  margin: '0 auto',
  textAlign: 'center',
  position: 'relative',
  zIndex: 5,
  borderRadius: '24px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 20px 50px rgba(0,0,0,0.5)'
    : '0 20px 50px rgba(103, 58, 183, 0.12)',
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 45, 0.85)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${theme.palette.divider}`
}));

// ==============================|| MAINTENANCE PAGE ||============================== //

const Maintenance = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <ErrorWrapper>
      {/* Background Decorative Elements */}
      <Box sx={{ 
        position: 'absolute', top: -120, left: -120, width: 380, height: 380, 
        background: 'radial-gradient(circle, rgba(103, 58, 183, 0.15) 0%, transparent 70%)', 
        borderRadius: '50%' 
      }} />
      <Box sx={{ 
        position: 'absolute', bottom: -120, right: -120, width: 380, height: 380, 
        background: 'radial-gradient(circle, rgba(33, 150, 243, 0.15) 0%, transparent 70%)', 
        borderRadius: '50%' 
      }} />

      <Container maxWidth="md">
        <Grid container direction="column" alignItems="center" justifyContent="center">
          <Grid item xs={12} sx={{ width: '100%' }}>
            <ErrorCard>
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Stack spacing={3} alignItems="center">
                  
                  {/* Status Badge */}
                  <Chip
                    icon={<IconTools size={18} />}
                    label="Scheduled Maintenance Mode"
                    color="secondary"
                    variant="outlined"
                    sx={{ borderRadius: '20px', fontWeight: 700, px: 1, py: 0.5 }}
                  />

                  {/* Icon Graphic */}
                  <Box 
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(103, 58, 183, 0.2)'
                        : 'rgba(103, 58, 183, 0.1)',
                      color: 'secondary.main',
                      boxShadow: '0 10px 25px rgba(103, 58, 183, 0.2)'
                    }}
                  >
                    <IconTools size={54} stroke={1.5} />
                  </Box>

                  {/* Heading & Subtitle */}
                  <Box>
                    <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                      System Under Maintenance
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 460, margin: '0 auto', fontSize: '0.95rem' }}>
                      We are currently performing routine upgrades to improve speed and reliability. Thank you for your patience!
                    </Typography>
                  </Box>

                  {/* Timer Note */}
                  <Chip 
                    icon={<IconClock size={16} />}
                    label="Estimated completion: ~15-30 mins" 
                    size="small"
                    sx={{ borderRadius: '12px', background: theme.palette.action.hover, fontWeight: 600 }}
                  />

                  {/* Action Buttons */}
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2} 
                    sx={{ pt: 2, width: '100%', justifyContent: 'center' }}
                  >
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      size="large"
                      startIcon={<IconRefresh size={20} />}
                      onClick={() => window.location.reload()}
                      sx={{ 
                        borderRadius: '12px', 
                        fontWeight: 700, 
                        px: 3, 
                        py: 1.2,
                        textTransform: 'none'
                      }}
                    >
                      Check Status
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      component={Link}
                      to="/dashboard"
                      startIcon={<IconHome size={20} />}
                      sx={{ 
                        borderRadius: '12px', 
                        fontWeight: 700, 
                        px: 3.5, 
                        py: 1.2,
                        textTransform: 'none',
                        boxShadow: '0 8px 20px rgba(33, 150, 243, 0.3)'
                      }}
                    >
                      Vendor Dashboard
                    </Button>
                  </Stack>

                </Stack>
              </CardContent>
            </ErrorCard>
          </Grid>
        </Grid>
      </Container>
    </ErrorWrapper>
  );
};

export default Maintenance;
