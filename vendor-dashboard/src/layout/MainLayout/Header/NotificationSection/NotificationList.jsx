import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import { withAlpha } from 'utils/colorUtils';

// assets
import {
  IconCalendar,
  IconMessageDots,
  IconMail,
  IconStar,
  IconWallet,
  IconAlertCircle,
  IconInfoCircle,
  IconBellOff
} from '@tabler/icons-react';

const resolveVendorPath = (item) => {
  if (item?.link) {
    if (item.link === '/enquiries') return '/platform/enquiries';
    if (item.link === '/contact' || item.link === '/contact-us') return '/platform/contact-us';
    if (item.link === '/reviews' || item.link === '/testimonials') return '/platform/testimonials';
    if (item.link === '/bookings') return '/bookings';
    return item.link;
  }
  const cat = (item?.category || '').toLowerCase();
  if (cat.includes('booking')) return '/bookings';
  if (cat.includes('enquiry')) return '/platform/enquiries';
  if (cat.includes('contact')) return '/platform/contact-us';
  if (cat.includes('review') || cat.includes('testimonial')) return '/platform/testimonials';
  if (cat.includes('wallet') || cat.includes('payment')) return '/wallet';
  if (cat.includes('package')) return '/packages';
  return '/dashboard';
};

const getCategoryIcon = (category, type) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('booking')) return <IconCalendar stroke={1.5} size="18px" />;
  if (cat.includes('enquiry')) return <IconMessageDots stroke={1.5} size="18px" />;
  if (cat.includes('contact')) return <IconMail stroke={1.5} size="18px" />;
  if (cat.includes('review')) return <IconStar stroke={1.5} size="18px" />;
  if (cat.includes('wallet') || cat.includes('payment')) return <IconWallet stroke={1.5} size="18px" />;
  if (type === 'warning' || type === 'error') return <IconAlertCircle stroke={1.5} size="18px" />;
  return <IconInfoCircle stroke={1.5} size="18px" />;
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

function ListItemWrapper({ children, isUnread, onClick }) {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        bgcolor: isUnread ? withAlpha(theme.palette.primary.light || '#e0f2fe', 0.2) : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: withAlpha(theme.palette.primary.light || '#e0f2fe', 0.4)
        }
      }}
    >
      {children}
    </Box>
  );
}

ListItemWrapper.propTypes = {
  children: PropTypes.node,
  isUnread: PropTypes.bool,
  onClick: PropTypes.func
};

// ==============================|| NOTIFICATION LIST ||============================== //

export default function NotificationList({ items = [], loading = false, onItemClick }) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Loading notifications...
        </Typography>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <IconBellOff stroke={1.5} size="32px" color={theme.palette.text.secondary} />
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          No Notifications
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          You are all caught up!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', py: 0 }}>
      {items.map((item) => {
        const isUnread = !item.isRead;
        const targetPath = resolveVendorPath(item);

        return (
          <ListItemWrapper
            key={item._id}
            isUnread={isUnread}
            onClick={() => onItemClick && onItemClick(item._id, targetPath)}
          >
            <ListItem
              alignItems="flex-start"
              disablePadding
              secondaryAction={
                <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.secondary', whiteSpace: 'nowrap', pl: 1 }}>
                  {formatTimeAgo(item.createdAt)}
                </Typography>
              }
            >
              <ListItemAvatar sx={{ minWidth: 38 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: isUnread ? 'primary.light' : 'grey.200',
                    color: isUnread ? 'primary.dark' : 'grey.700'
                  }}
                >
                  {getCategoryIcon(item.category, item.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: isUnread ? 700 : 500, fontSize: '0.82rem', pr: 4, lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>
                }
              />
            </ListItem>
            <Stack sx={{ gap: 0.5, pl: 4.75, mt: 0.25 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {item.message}
              </Typography>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 0.25 }}>
                <Chip
                  label={item.category || 'System'}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, textTransform: 'capitalize' }}
                />
                {isUnread && (
                  <Chip
                    label="Unread"
                    color="error"
                    size="small"
                    sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700 }}
                  />
                )}
              </Stack>
            </Stack>
          </ListItemWrapper>
        );
      })}
    </List>
  );
}

NotificationList.propTypes = {
  items: PropTypes.array,
  loading: PropTypes.bool,
  onItemClick: PropTypes.func
};
