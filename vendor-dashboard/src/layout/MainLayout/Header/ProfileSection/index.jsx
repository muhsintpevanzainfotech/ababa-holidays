import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import useThemeMode from 'hooks/useThemeMode';
import Avatar from '@mui/material/Avatar';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';
import { logout } from 'store/slices/authSlice';
import api from 'utils/api';

// assets
import {
  IconLogout,
  IconSettings,
  IconUser,
  IconShieldLock,
  IconWallet,
  IconChevronDown
} from '@tabler/icons-react';

// helper for full image url
const getFullImageUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const baseUrl = import.meta.env.VITE_APP_API_URL ? import.meta.env.VITE_APP_API_URL.replace(/\/api\/?$/, '') : '';
  const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${baseUrl}/${cleanPath}`;
};

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
  const theme = useTheme();
  const { isDark } = useThemeMode();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    state: { borderRadius }
  } = useConfig();

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
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);



  const isStaffMember = Boolean(
    user?.managedBy ||
    vendorProfile?.isStaffLogin ||
    ['vendor-staff', 'staff', 'vendor_staff'].includes((user?.role || '').toLowerCase()) ||
    ['vendor-staff', 'staff', 'vendor_staff'].includes((vendorProfile?.role || '').toLowerCase())
  );

  const userAvatar = vendorProfile?.avatar || vendorProfile?.profile?.avatar || user?.avatar || user?.profileImage || user?.image || user?.avatarUrl;
  const hasAvatar = Boolean(userAvatar);
  const avatarSrc = hasAvatar ? getFullImageUrl(userAvatar) : '/logo.png';
  const displayName = vendorProfile?.profile?.companyName || vendorProfile?.name || user?.name || user?.companyName || 'Vendor';
  const displayRole = vendorProfile?.role || user?.role || 'Vendor Partner';
  const staffName = vendorProfile?.staffDetails?.name || (isStaffMember ? user?.name : '');

  return (
    <>
      <ButtonBase
        ref={anchorRef}
        aria-controls={open ? 'profile-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        sx={{
          p: '4px 8px 4px 5px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
          cursor: 'pointer',
          border: '1px solid',
          borderColor: open
            ? (isDark ? '#41a0ae' : '#36669c')
            : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'),
          bgcolor: open
            ? (isDark ? 'rgba(65, 160, 174, 0.15)' : 'rgba(54, 102, 156, 0.08)')
            : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: isDark ? '#41a0ae' : '#36669c',
            bgcolor: isDark ? 'rgba(65, 160, 174, 0.12)' : 'rgba(54, 102, 156, 0.06)'
          }
        }}
      >
        <Avatar
          src={avatarSrc}
          alt={hasAvatar ? displayName : 'Ababa Travels Logo'}
          sx={{
            borderRadius: '9px',
            width: 32,
            height: 32,
            bgcolor: hasAvatar ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9') : '#ffffff',
            p: hasAvatar ? 0 : '2px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(65, 160, 174, 0.4)' : 'rgba(54, 102, 156, 0.3)',
            '& img': {
              objectFit: hasAvatar ? 'cover' : 'contain',
              borderRadius: '7px'
            }
          }}
        />
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', maxWidth: 140 }}>
          <Typography
            noWrap
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              fontSize: '0.82rem',
              color: isDark ? '#ffffff' : '#0f172a',
              lineHeight: 1.2
            }}
          >
            {isStaffMember ? (staffName || displayName) : displayName}
          </Typography>
          <Typography
            noWrap
            variant="caption"
            sx={{
              fontSize: '0.68rem',
              fontWeight: 600,
              color: isDark ? '#9ca3af' : '#64748b',
              lineHeight: 1.1
            }}
          >
            {isStaffMember ? 'Staff Member' : displayRole}
          </Typography>
        </Box>
        <IconChevronDown
          size={16}
          stroke={2}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
            color: isDark ? '#9ca3af' : '#64748b'
          }}
        />
      </ButtonBase>

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
                            width: 42,
                            height: 42,
                            borderRadius: '10px',
                            bgcolor: hasAvatar ? (isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9') : '#ffffff',
                            p: hasAvatar ? 0 : '2px',
                            border: '1.5px solid',
                            borderColor: isDark ? '#41a0ae' : '#36669c',
                            '& img': { objectFit: hasAvatar ? 'cover' : 'contain', borderRadius: '8px' }
                          }}
                        />
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          {isStaffMember ? (
                            <>
                              <Typography
                                variant="subtitle1"
                                noWrap
                                sx={{
                                  color: isDark ? '#ffffff !important' : '#0f172a',
                                  fontWeight: 800,
                                  fontSize: '0.95rem',
                                  lineHeight: 1.2
                                }}
                              >
                                {staffName || displayName}
                              </Typography>
                              <Chip
                                label="Vendor Staff"
                                size="small"
                                color="info"
                                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, my: 0.3, bgcolor: '#2563eb', color: '#ffffff' }}
                              />
                              <Typography
                                variant="caption"
                                noWrap
                                sx={{
                                  color: isDark ? '#9ca3af !important' : '#64748b',
                                  fontWeight: 600,
                                  fontSize: '0.75rem',
                                  display: 'block'
                                }}
                              >
                                🏢 {vendorProfile?.mainVendorDetails?.companyName || vendorProfile?.profile?.companyName || 'Main Vendor Account'}
                              </Typography>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
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
                            minHeight: 42,
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

                        <ListItemButton component={Link} to="/wallet" onClick={handleClose}>
                          <ListItemIcon sx={{ color: isDark ? '#41a0ae' : '#36669c', minWidth: 36 }}>
                            <IconWallet stroke={1.5} size="19px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#ffffff !important' : '#1e293b', fontSize: '0.88rem' }}>
                                My Wallet & Payouts
                              </Typography>
                            }
                          />
                        </ListItemButton>

                        <ListItemButton component={Link} to="/system/settings/security" onClick={handleClose}>
                          <ListItemIcon sx={{ color: isDark ? '#41a0ae' : '#36669c', minWidth: 36 }}>
                            <IconShieldLock stroke={1.5} size="19px" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#ffffff !important' : '#1e293b', fontSize: '0.88rem' }}>
                                Security & Password
                              </Typography>
                            }
                          />
                        </ListItemButton>

                        <Divider sx={{ my: 0.75, borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0' }} />

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
