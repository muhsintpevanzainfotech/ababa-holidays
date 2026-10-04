import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MainCard from 'ui-component/cards/MainCard';

const CardWrapper = styled(MainCard, {
  shouldForwardProp: (prop) => prop !== 'cardVariant' && prop !== 'colorScheme'
})(({ theme, cardVariant = 'light', colorScheme = 'primary' }) => {
  const isDark = theme.palette.mode === 'dark' || cardVariant === 'dark';
  return {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: isDark ? '#111827' : '#ffffff',
    color: isDark ? '#e5e7eb' : theme.palette.text.primary,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    borderRadius: '10px',
    boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 8px rgba(15, 23, 42, 0.03)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.3)' : '0 6px 16px rgba(15, 23, 42, 0.06)'
    }
  };
});

const getColorSchemePastel = (scheme = 'primary', theme) => {
  const isDark = theme?.palette?.mode === 'dark';
  switch (scheme) {
    case 'success':
      return { bg: isDark ? 'rgba(62, 201, 149, 0.15)' : '#e6f8f2', color: '#3ec995', border: isDark ? 'rgba(62, 201, 149, 0.3)' : '#77f07f' };
    case 'warning':
      return { bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb', color: '#f59e0b', border: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a' };
    case 'error':
      return { bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', color: '#ef4444', border: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca' };
    case 'info':
      return { bg: isDark ? 'rgba(65, 160, 174, 0.15)' : '#eaf6f8', color: '#41a0ae', border: isDark ? 'rgba(65, 160, 174, 0.3)' : '#aedbe1' };
    case 'secondary':
      return { bg: isDark ? 'rgba(65, 160, 174, 0.15)' : '#eaf6f8', color: '#41a0ae', border: isDark ? 'rgba(65, 160, 174, 0.3)' : '#aedbe1' };
    case 'primary':
    default:
      return { bg: isDark ? 'rgba(54, 102, 156, 0.15)' : '#edf4fa', color: '#36669c', border: isDark ? 'rgba(54, 102, 156, 0.3)' : '#bce1e6' };
  }
};

export default function StatCard({
  count = 0,
  label = '',
  icon,
  change = '+1.90%',
  changeType = 'up', // 'up' | 'down'
  comparisonText = '',
  onMoreClick,
  variant = 'light',
  colorScheme = 'primary',
  onClick,
  active = false,
  loading = false,
  sx = {}
}) {
  const theme = useTheme();
  const schemePastel = getColorSchemePastel(colorScheme, theme);
  const isUp = changeType === 'up';

  if (loading) {
    return (
      <CardWrapper
        border
        content={false}
        cardVariant={variant}
        colorScheme={colorScheme}
        sx={{
          p: { xs: 2, sm: 2.25 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          ...sx
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
            <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '8px' }} />
            <Skeleton variant="text" width="60%" height={20} />
          </Stack>
          <Skeleton variant="circular" width={24} height={24} />
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mt: 'auto' }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: '20px' }} />
        </Stack>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      border
      content={false}
      cardVariant={variant}
      colorScheme={colorScheme}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        p: { xs: 2, sm: 2.25 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...(active && {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}30`
        }),
        ...sx
      }}
    >
      {/* Top Header Row: Icon + Label + More Action */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
          {icon && (
            <Avatar
              variant="rounded"
              sx={{
                width: 36,
                height: 36,
                minWidth: 36,
                borderRadius: '8px',
                bgcolor: schemePastel.bg,
                color: schemePastel.color,
                border: `1px solid ${schemePastel.border}`,
                flexShrink: 0
              }}
            >
              {icon}
            </Avatar>
          )}
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              fontSize: { xs: '0.75rem', sm: '0.78rem', md: '0.8rem', lg: '0.84rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}
            title={label}
          >
            {label}
          </Typography>
        </Stack>

        {onMoreClick ? (
          <IconButton size="small" onClick={onMoreClick} sx={{ color: 'text.disabled', flexShrink: 0 }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        ) : (
          <IconButton size="small" sx={{ color: 'text.disabled', opacity: 0.5, flexShrink: 0 }}>
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      {/* Bottom Main Stat Value & Percentage Badge */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="nowrap" gap={1} sx={{ mt: 'auto' }}>
        <Typography
          variant="h2"
          noWrap
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            fontSize: { xs: '1.35rem', sm: '1.45rem', md: '1.6rem' },
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}
        >
          {count}
        </Typography>

        {change && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.3,
                px: 0.9,
                py: 0.3,
                borderRadius: '20px',
                bgcolor: isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: isUp ? '#10b981' : '#ef4444',
                fontSize: '0.72rem',
                fontWeight: 800,
                border: `1px solid ${isUp ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                whiteSpace: 'nowrap'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: 'inherit', whiteSpace: 'nowrap' }}>
                {change}
              </Typography>
              {isUp ? <ArrowUpwardIcon sx={{ fontSize: '0.75rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '0.75rem' }} />}
            </Box>
            {comparisonText && (
              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {comparisonText}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </CardWrapper>
  );
}

StatCard.propTypes = {
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  label: PropTypes.string,
  icon: PropTypes.node,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['up', 'down']),
  comparisonText: PropTypes.string,
  onMoreClick: PropTypes.func,
  variant: PropTypes.oneOf(['light', 'dark']),
  colorScheme: PropTypes.string,
  onClick: PropTypes.func,
  active: PropTypes.bool,
  loading: PropTypes.bool,
  sx: PropTypes.object
};
