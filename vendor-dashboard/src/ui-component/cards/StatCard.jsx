import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MainCard from 'ui-component/cards/MainCard';

// Styled Wrapper with ambient background circles (same pattern as TotalIncomeDarkCard & TotalIncomeLightCard)
const CardWrapper = styled(MainCard, {
  shouldForwardProp: (prop) => prop !== 'cardVariant' && prop !== 'colorScheme'
})(({ theme, cardVariant = 'light', colorScheme = 'primary' }) => {
  const isDark = cardVariant === 'dark';
  const mainColor = theme.vars.palette[colorScheme]?.main || theme.vars.palette.primary.main;
  const darkColor = theme.vars.palette[colorScheme]?.dark || theme.vars.palette.primary.dark;
  const lightColor = theme.vars.palette[colorScheme]?.light || theme.vars.palette.primary.light;

  return {
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: isDark ? darkColor : theme.vars.palette.background.paper,
    background: isDark ? darkColor : theme.vars.palette.background.paper,
    color: isDark ? '#ffffff' : theme.vars.palette.text.primary,
    borderColor: isDark ? 'transparent' : theme.vars.palette.divider,
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: isDark
        ? `0 12px 28px ${mainColor}40`
        : '0 10px 24px rgba(15, 23, 42, 0.08)'
    },
    '&:after': {
      content: '""',
      position: 'absolute',
      width: 210,
      height: 210,
      background: isDark
        ? `linear-gradient(210.04deg, ${lightColor} -50.94%, rgba(255, 255, 255, 0) 83.49%)`
        : `linear-gradient(210.04deg, ${mainColor}20 -50.94%, rgba(255, 255, 255, 0) 83.49%)`,
      borderRadius: '50%',
      top: -30,
      right: -180,
      pointerEvents: 'none'
    },
    '&:before': {
      content: '""',
      position: 'absolute',
      width: 210,
      height: 210,
      background: isDark
        ? `linear-gradient(140.9deg, ${lightColor} -14.02%, rgba(255, 255, 255, 0) 77.58%)`
        : `linear-gradient(140.9deg, ${mainColor}15 -14.02%, rgba(255, 255, 255, 0) 70.50%)`,
      borderRadius: '50%',
      top: -160,
      right: -130,
      opacity: 0.6,
      pointerEvents: 'none'
    }
  };
});

export default function StatCard({
  count = 0,
  label = '',
  icon,
  variant = 'light', // 'light' | 'dark'
  colorScheme = 'primary', // 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  onClick,
  active = false
}) {
  const theme = useTheme();
  const isDark = variant === 'dark';

  const avatarBg = isDark
    ? (theme.vars.palette[colorScheme]?.[800] || theme.vars.palette[colorScheme]?.dark || 'primary.dark')
    : (theme.vars.palette[colorScheme]?.light || 'primary.light');

  const avatarColor = isDark
    ? '#ffffff'
    : (theme.vars.palette[colorScheme]?.dark || theme.vars.palette[colorScheme]?.main || 'primary.main');

  return (
    <CardWrapper
      border={!isDark}
      content={false}
      cardVariant={variant}
      colorScheme={colorScheme}
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        ...(active && !isDark && {
          borderColor: `${theme.vars.palette[colorScheme]?.main || theme.vars.palette.primary.main}`,
          boxShadow: `0 0 0 2px ${theme.vars.palette[colorScheme]?.main || theme.vars.palette.primary.main}40`
        })
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <List sx={{ py: 0 }}>
          <ListItem alignItems="center" disableGutters sx={{ py: 0 }}>
            {icon && (
              <ListItemAvatar>
                <Avatar
                  variant="rounded"
                  sx={{
                    ...theme.typography.largeAvatar,
                    borderRadius: '12px',
                    bgcolor: avatarBg,
                    color: avatarColor,
                    width: 48,
                    height: 48
                  }}
                >
                  {icon}
                </Avatar>
              </ListItemAvatar>
            )}
            <ListItemText
              sx={{ py: 0, my: 0 }}
              primary={
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: isDark ? '#ffffff' : 'text.primary',
                    fontSize: '1.75rem',
                    lineHeight: 1.2
                  }}
                >
                  {count}
                </Typography>
              }
              secondary={
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: isDark ? theme.vars.palette[colorScheme]?.light || 'primary.light' : 'text.secondary',
                    mt: 0.4,
                    fontWeight: 600,
                    fontSize: '0.8125rem'
                  }}
                >
                  {label}
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Box>
    </CardWrapper>
  );
}

StatCard.propTypes = {
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  label: PropTypes.string,
  icon: PropTypes.node,
  variant: PropTypes.oneOf(['light', 'dark']),
  colorScheme: PropTypes.string,
  onClick: PropTypes.func,
  active: PropTypes.bool
};
