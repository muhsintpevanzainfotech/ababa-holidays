import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme, useColorScheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';
import { logout } from 'store/slices/authSlice';
import api from 'utils/api';

// assets
import User1 from 'assets/images/users/avatar-user.jpg';
import { IconLogout, IconSearch, IconSettings, IconUser } from '@tabler/icons-react';

// helper for full image url
const getFullImageUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const baseUrl = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:9000';
  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
  const theme = useTheme();
  const { mode } = useColorScheme();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    state: { borderRadius }
  } = useConfig();

  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [vendorProfile, setVendorProfile] = useState(null);

  const anchorRef = useRef(null);

  useEffect(() => {
    api.get('/vendors/profile')
      .then((res) => {
        const responseData = res?.data || res;
        const d = responseData?.data || responseData;
        if (d) setVendorProfile(d);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    dispatch(logout());
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const isDark = mode === 'dark' || theme.palette.mode === 'dark';

  const userAvatar = vendorProfile?.avatar || vendorProfile?.profile?.avatar || user?.avatar || user?.profileImage || user?.image || user?.avatarUrl;
  const hasAvatar = Boolean(userAvatar);
  const avatarSrc = hasAvatar ? getFullImageUrl(userAvatar) : '/logo.png';
  const displayName = vendorProfile?.profile?.companyName || vendorProfile?.name || user?.name || user?.companyName || 'Waterways';
  const displayRole = vendorProfile?.role || user?.role || 'Vendor';

  return (
    <>
      <Avatar
        src={avatarSrc}
        alt={hasAvatar ? displayName : 'Ababa Travels Logo'}
        sx={{
          cursor: 'pointer',
          borderRadius: '12px',
          width: '42px',
          height: '42px',
          ml: 1.5,
          bgcolor: hasAvatar ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9') : '#ffffff',
          p: hasAvatar ? 0 : '3px',
          border: '2px solid',
          borderColor: isDark ? '#41a0ae' : '#36669c',
          boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 12px rgba(54, 102, 156, 0.25)',
          transition: 'all 0.2s ease-in-out',
          '& img': {
            objectFit: hasAvatar ? 'cover' : 'contain',
            borderRadius: '8px'
          },
          '&:hover': {
            borderColor: '#77f07f',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 18px rgba(119, 240, 127, 0.3)'
          }
        }}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      />
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 10]
            }
          }
        ]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper sx={{ background: 'transparent', boxShadow: 'none' }}>
                {open && (
                  <MainCard
                    border={false}
                    elevation={16}
                    content={false}
                    boxShadow
                    shadow={theme.shadows[16]}
                    sx={{
                      bgcolor: isDark ? '#16152b' : '#ffffff',
                      color: isDark ? '#ffffff !important' : '#0f172a',
                      border: '1px solid',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      width: 290,
                      maxWidth: 'calc(100vw - 32px)',
                      boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.65)' : '0 12px 32px rgba(15, 23, 42, 0.12)'
                    }}
                  >
                    {/* Header Section */}
                    <Box sx={{ p: 2, pb: 1.75, bgcolor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar
                          src={avatarSrc}
                          alt={hasAvatar ? displayName : 'Ababa Travels Logo'}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '10px',
                            bgcolor: hasAvatar ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9') : '#ffffff',
                            p: hasAvatar ? 0 : '2px',
                            border: '1.5px solid',
                            borderColor: isDark ? '#41a0ae' : '#36669c',
                            '& img': { objectFit: hasAvatar ? 'cover' : 'contain', borderRadius: '8px' }
                          }}
                        />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography
                            variant="subtitle1"
                            noWrap
                            sx={{
                              color: isDark ? '#ffffff !important' : '#0f172a',
                              fontWeight: 700,
                              fontSize: '0.98rem',
                              lineHeight: 1.2
                            }}
                          >
                            {displayName}
                          </Typography>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              color: isDark ? '#9ca3af !important' : '#64748b',
                              fontWeight: 500,
                              fontSize: '0.78rem',
                              display: 'block',
                              mt: 0.25
                            }}
                          >
                            {displayRole}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0' }} />

                    {/* Navigation Menu Items */}
                    <Box sx={{ p: 1, pt: 1 }}>
                      <List
                        component="nav"
                        disablePadding
                        sx={{
                          width: '100%',
                          minWidth: 260,
                          '& .MuiListItemButton-root': {
                            borderRadius: '10px',
                            my: 0.35,
                            py: 1,
                            px: 1.75,
                            minHeight: 44,
                            transition: 'all 0.15s ease-in-out',
                            '&:hover': {
                              bgcolor: isDark ? 'rgba(65, 160, 174, 0.18)' : 'rgba(54, 102, 156, 0.08)',
                              '& .MuiListItemIcon-root': { color: isDark ? '#77f07f' : '#36669c' },
                              '& .MuiTypography-root': { color: isDark ? '#ffffff !important' : '#0f172a' }
                            }
                          }
                        }}
                      >
                        <ListItemButton component={Link} to="/system/settings/profile" onClick={handleClose}>
                          <ListItemIcon sx={{ color: isDark ? '#41a0ae' : '#36669c', minWidth: 36 }}>
                            <IconSettings stroke={1.5} size="19px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#ffffff !important' : '#1e293b', fontSize: '0.88rem' }}>
                                Account Settings
                              </Typography>
                            }
                          />
                        </ListItemButton>

                        <ListItemButton component={Link} to="/system/settings/profile" onClick={handleClose}>
                          <ListItemIcon sx={{ color: isDark ? '#41a0ae' : '#36669c', minWidth: 36 }}>
                            <IconUser stroke={1.5} size="19px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#ffffff !important' : '#1e293b', fontSize: '0.88rem' }}>
                                  Social Profile
                                </Typography>
                                <Chip
                                  label="02"
                                  size="small"
                                  sx={{
                                    bgcolor: isDark ? 'rgba(119, 240, 127, 0.18)' : '#e6f9f2',
                                    color: isDark ? '#77f07f' : '#2db382',
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(119, 240, 127, 0.35)' : '#a4f3d2',
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    height: 20,
                                    minWidth: 24
                                  }}
                                />
                              </Stack>
                            }
                          />
                        </ListItemButton>

                        <ListItemButton onClick={handleLogout} sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12) !important' } }}>
                          <ListItemIcon sx={{ color: '#ef4444', minWidth: 36 }}>
                            <IconLogout stroke={1.5} size="19px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444', fontSize: '0.88rem' }}>
                                Logout
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}
