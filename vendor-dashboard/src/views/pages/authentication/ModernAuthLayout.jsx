import PropTypes from 'prop-types';
import { Box, Grid, Typography, Stack, Container, Avatar, Divider } from '@mui/material';
import Logo from 'ui-component/Logo';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LuggageIcon from '@mui/icons-material/Luggage';
import MapIcon from '@mui/icons-material/Map';

export default function ModernAuthLayout({ children, title, subtitle }) {
  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw',
      maxHeight: '100vh', 
      display: 'flex', 
      bgcolor: '#ffffff', 
      overflow: 'hidden' 
    }}>
      <Grid container sx={{ height: '100vh', width: '100%', m: 0 }}>
        
        {/* Left Side: Travel & Trip Visual Banner (Fits 100vh) */}
        <Grid size={{ xs: 12, md: 6, lg: 6.5 }} sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          height: '100vh',
          p: { md: 4, lg: 6 },
          position: 'relative',
          background: 'linear-gradient(150deg, #043933 0%, #08524a 50%, #022420 100%)',
          color: '#ffffff',
          overflow: 'hidden'
        }}>
          {/* Ambient Background Decorative Glow */}
          <Box sx={{ 
            position: 'absolute', 
            top: '-15%', 
            left: '-15%', 
            width: '400px', 
            height: '400px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.22) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none'
          }} />

          {/* Top Logo on Banner */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Logo />
            </Stack>
          </Box>

          {/* Center Content: Travel Tagline & Testimonial */}
          <Box sx={{ my: 'auto', py: 2, maxWidth: 540 }}>
            <Typography variant="h1" sx={{ 
              color: '#ffffff', 
              fontWeight: 700, 
              fontSize: { md: '2.1rem', lg: '2.6rem' }, 
              lineHeight: 1.25,
              mb: 2.5,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: '-0.5px'
            }}>
              Revolutionize Travel & Trips with Smarter Automation
            </Typography>

            {/* Quote Block */}
            <Box sx={{ position: 'relative', mt: 3, mb: 3, pl: 2.5, borderLeft: '3px solid #14b8a6' }}>
              <FormatQuoteIcon sx={{ fontSize: 32, color: '#14b8a6', transform: 'rotate(180deg)', mb: 0.5, opacity: 0.8 }} />
              <Typography variant="body1" sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: { md: '0.95rem', lg: '1.05rem' }, 
                fontStyle: 'italic',
                lineHeight: 1.5,
                mb: 2
              }}>
                "ABABA Holidays has completely transformed our tour & trip operations. It’s reliable, efficient, and ensures our guest releases are always top-notch."
              </Typography>

              {/* Author Profile */}
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Avatar 
                  alt="Michael Carter" 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  sx={{ width: 42, height: 42, border: '2px solid rgba(255, 255, 255, 0.3)' }}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem' }}>
                    Michael Carter
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.75rem' }}>
                    Senior Travel Partner at DevCore Trips
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Bottom Travel Partner Brand Logos / Icons */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                JOIN 5K+ TRAVEL TEAMS
              </Typography>
              <Divider sx={{ flexGrow: 1, borderColor: 'rgba(255, 255, 255, 0.15)' }} />
            </Stack>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ color: 'rgba(255, 255, 255, 0.75)', pt: 0.5 }}>
              <Stack direction="row" alignItems="center" spacing={0.6} sx={{ opacity: 0.9 }}>
                <FlightTakeoffIcon sx={{ fontSize: 18, color: '#14b8a6' }} />
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>Flights</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.6} sx={{ opacity: 0.9 }}>
                <HotelIcon sx={{ fontSize: 18, color: '#14b8a6' }} />
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>Stays & Hotels</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.6} sx={{ opacity: 0.9 }}>
                <DirectionsBusIcon sx={{ fontSize: 18, color: '#14b8a6' }} />
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>Transports</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.6} sx={{ opacity: 0.9 }}>
                <LuggageIcon sx={{ fontSize: 18, color: '#14b8a6' }} />
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>Packages</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.6} sx={{ opacity: 0.9 }}>
                <MapIcon sx={{ fontSize: 18, color: '#14b8a6' }} />
                <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>Tours</Typography>
              </Stack>
            </Stack>
          </Box>

        </Grid>

        {/* Right Side: Login / Auth Form Container (Centered in 100vh) */}
        <Grid size={{ xs: 12, md: 6, lg: 5.5 }} sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          height: '100vh',
          maxHeight: '100vh',
          overflowY: 'auto',
          px: { xs: 2.5, sm: 4, md: 5 },
          py: { xs: 2, sm: 3 },
          bgcolor: '#ffffff',
          position: 'relative'
        }}>
          {/* Header Logo */}
          <Box sx={{ 
            width: '100%', 
            maxWidth: 440,
            pt: { xs: 1, sm: 2 },
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Logo />
          </Box>

          {/* Form Content Area Centered Vertically */}
          <Container maxWidth="xs" disableGutters sx={{ width: '100%', my: 'auto', py: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h2" sx={{ 
                fontWeight: 700, 
                color: '#043e38', 
                mb: 1, 
                fontSize: { xs: '1.75rem', sm: '2.1rem' },
                fontFamily: "'Inter', sans-serif"
              }}>
                {title || 'Welcome Back!'}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Render Login / Register / Forgot Password Form */}
            <Box>
              {children}
            </Box>
          </Container>
        </Grid>

      </Grid>
    </Box>
  );
}

ModernAuthLayout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  subtitle: PropTypes.string
};

