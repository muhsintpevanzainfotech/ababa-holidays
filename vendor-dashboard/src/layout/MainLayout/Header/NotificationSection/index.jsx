import { Activity, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import NotificationList from './NotificationList';
import api from 'utils/api';

// assets
import { IconBell } from '@tabler/icons-react';

const statusOptions = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'booking', label: 'Bookings' },
  { value: 'enquiry', label: 'Enquiries & Contacts' },
  { value: 'review', label: 'Reviews' }
];

// ==============================|| VENDOR NOTIFICATION SECTION ||============================== //

export default function NotificationSection() {
  const theme = useTheme();
  const { mode } = useColorScheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const anchorRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const list = res.data || [];
      if (Array.isArray(list)) {
        setNotifications(list);
      }
    } catch (err) {
      console.error('Failed to load vendor notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 60 seconds
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const markAsRead = async (id, targetPath) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
    if (targetPath) {
      navigate(targetPath);
      setOpen(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'booking') return (item.category || '').toLowerCase().includes('booking');
    if (filter === 'enquiry') return (item.category || '').toLowerCase().includes('enquiry') || (item.category || '').toLowerCase().includes('contact');
    if (filter === 'review') return (item.category || '').toLowerCase().includes('review');
    return true;
  });

  const isDark = mode === 'dark' || theme.palette.mode === 'dark';

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Badge
          badgeContent={unreadCount}
          color="error"
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              top: 4,
              right: 4,
              fontSize: '0.68rem',
              height: 18,
              minWidth: 18,
              fontWeight: 700
            }
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              transition: 'all .2s ease-in-out',
              color: isDark ? '#41a0ae' : '#36669c',
              background: isDark ? 'rgba(65, 160, 174, 0.18)' : 'rgba(54, 102, 156, 0.1)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(65, 160, 174, 0.3)' : 'rgba(54, 102, 156, 0.2)',
              cursor: 'pointer',
              '&:hover, &[aria-controls="menu-list-grow"]': {
                color: '#ffffff',
                background: '#36669c'
              }
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
          >
            <IconBell stroke={1.5} size="22px" />
          </Avatar>
        </Badge>
      </Box>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [downMD ? 5 : 0, 20] } }]}
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper>
                <Activity mode={open ? 'visible' : 'hidden'}>
                  <MainCard
                    border={false}
                    elevation={16}
                    content={false}
                    boxShadow
                    shadow={theme.shadows[16]}
                    sx={{
                      width: { xs: 320, sm: 360 },
                      maxWidth: '92vw',
                      bgcolor: isDark ? '#16152b' : '#ffffff',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.5)' : '0 12px 32px rgba(15, 23, 42, 0.1)'
                    }}
                  >
                    <Stack sx={{ gap: 1.5 }}>
                      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 2, px: 2 }}>
                        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Notifications</Typography>
                          {unreadCount > 0 && (
                            <Chip size="small" label={`${unreadCount} New`} color="error" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
                          )}
                        </Stack>
                        <Button
                          variant="text"
                          size="small"
                          onClick={markAllRead}
                          sx={{ fontSize: '0.75rem', fontWeight: 600, minWidth: 'auto', p: 0.5, color: 'primary.main' }}
                        >
                          Mark all read
                        </Button>
                      </Stack>
                      <Box sx={{ height: 1, maxHeight: '380px', overflowX: 'hidden', '&::-webkit-scrollbar': { width: 5 } }}>
                        <Box sx={{ px: 2, pt: 0.25 }}>
                          <TextField
                            id="filter-notifications"
                            select
                            fullWidth
                            size="small"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            slotProps={{ select: { native: true } }}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </TextField>
                        </Box>
                        <Divider sx={{ mt: 1.5 }} />
                        <NotificationList
                          items={filteredNotifications}
                          loading={loading}
                          onItemClick={markAsRead}
                        />
                      </Box>
                    </Stack>
                    <CardActions sx={{ p: 1.25, justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                      <Button
                        size="small"
                        onClick={() => {
                          navigate('/platform/enquiries');
                          setOpen(false);
                        }}
                        sx={{ fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        View All Enquiries & Orders
                      </Button>
                    </CardActions>
                  </MainCard>
                </Activity>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
