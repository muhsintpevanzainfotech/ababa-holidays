import { Paper, Typography, Button, Box, Alert, Stack } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useColorScheme, useTheme } from '@mui/material/styles';

const SubscriptionRestrictedCard = ({ featureName = 'This Feature', reason = 'permission' }) => {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const isDarkMode = (mode === 'system' ? systemMode : mode) === 'dark';

  const isLimit = reason === 'limit';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 5 },
        textAlign: 'center',
        borderRadius: '24px',
        border: '1px solid',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(226, 232, 240, 0.8)',
        backgroundColor: isDarkMode ? '#111936' : '#ffffff',
        my: 3,
        boxShadow: isDarkMode 
          ? '0 12px 40px rgba(0, 0, 0, 0.35)' 
          : '0 12px 40px rgba(15, 23, 42, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Gradient Glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 220,
          height: 120,
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(0,0,0,0) 70%)'
            : 'radial-gradient(circle, rgba(254, 226, 226, 0.8) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }}
      />

      {/* Lock / Warning Badge */}
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '24px',
          bgcolor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)',
          border: '1px solid',
          borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(252, 165, 165, 0.5)'
        }}
      >
        <LockIcon sx={{ fontSize: 36 }} />
      </Box>

      {/* Title */}
      <Typography variant="h2" sx={{ fontWeight: 800, mb: 1, color: isDarkMode ? '#ffffff' : '#0f172a', letterSpacing: '-0.5px' }}>
        {featureName} Access Restricted
      </Typography>

      {/* Alert Warning Box */}
      <Alert
        severity={isLimit ? "warning" : "error"}
        variant="filled"
        icon={<WorkspacePremiumIcon fontSize="inherit" />}
        sx={{
          maxWidth: 540,
          mx: 'auto',
          my: 2.5,
          borderRadius: '14px',
          fontWeight: 700,
          fontSize: '0.875rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
        }}
      >
        {isLimit
          ? `Resource Limit Reached (0 Count): Your current plan quota for ${featureName} is set to 0 or reached.`
          : `Subscription Upgrade Required: ${featureName} management is locked on your current plan.`}
      </Alert>

      {/* Description */}
      <Typography variant="body1" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b', mb: 3.5, maxWidth: 520, mx: 'auto', lineHeight: 1.6, fontWeight: 500 }}>
        {isLimit
          ? `You have used all available allocation for ${featureName} under your active membership tier. Upgrade to unlock higher resource limits and expand your catalog.`
          : `${featureName} control is disabled on your current plan level. Upgrade your membership tier to instantly unlock full access.`}
      </Typography>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          color="secondary"
          startIcon={<RocketLaunchIcon />}
          onClick={() => window.location.href = '/system/settings/subscription'}
          sx={{
            borderRadius: '12px',
            fontWeight: 800,
            px: 3.5,
            py: 1.3,
            fontSize: '0.95rem',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 28px rgba(124, 58, 237, 0.45)'
            }
          }}
        >
          Upgrade Membership Tier
        </Button>
      </Stack>
    </Paper>
  );
};

export default SubscriptionRestrictedCard;
