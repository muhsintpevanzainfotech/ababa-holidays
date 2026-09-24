import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { 
  Grid, Typography, Stack, Box, Avatar, TextField, 
  Switch, Divider, Button, Chip, IconButton, InputAdornment 
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import User1 from 'assets/images/users/user-round.svg';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';

const VendorSettings = () => {
    const theme = useTheme();
    const { user } = useSelector((state) => state.auth);
    
    const [notifications, setNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [fullName, setFullName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [location, setLocation] = useState('Kozhikode, Kerala');
    const [bio, setBio] = useState('Authorized travel vendor offering tour packages and local transportation services.');

    return (
        <Grid container spacing={gridSpacing}>
            {/* PAGE HEADER */}
            <Grid size={12}>
                <Box sx={{ mb: 1 }}>
                    <Chip 
                      label="VENDOR PORTAL" 
                      size="small" 
                      color="primary" 
                      sx={{ fontWeight: 800, borderRadius: '8px', fontSize: '10px', mb: 1, px: 0.5 }} 
                    />
                    <Typography variant="h2" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
                      Account <Box component="span" sx={{ color: 'primary.main' }}>Profile & Settings</Box>
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      Manage your verified vendor identity, business contact info, and preferences
                    </Typography>
                </Box>
            </Grid>

            {/* PROFILE HERO CARD */}
            <Grid size={12}>
                <MainCard border={false} content={false} sx={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                    <Box 
                      sx={{ 
                        height: 140, 
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
                        position: 'relative'
                      }} 
                    />
                    <Box sx={{ p: 3, pt: 0, mt: -6 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-end' }} justifyContent="space-between">
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-end' }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar 
                                        src={User1} 
                                        sx={{ 
                                          width: 108, 
                                          height: 108, 
                                          borderRadius: '24px', 
                                          border: '4px solid', 
                                          borderColor: 'background.paper',
                                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                        }} 
                                    />
                                    <IconButton 
                                      color="primary" 
                                      size="small"
                                      sx={{ 
                                        position: 'absolute', 
                                        bottom: -4, 
                                        right: -4, 
                                        bgcolor: 'primary.main', 
                                        color: '#fff',
                                        border: '3px solid',
                                        borderColor: 'background.paper',
                                        '&:hover': { bgcolor: 'primary.dark' }
                                      }}
                                    >
                                        <PhotoCameraIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                        <Typography variant="h3" sx={{ fontWeight: 800 }}>{fullName || 'Ababa Vendor'}</Typography>
                                        <VerifiedUserIcon color="success" fontSize="small" />
                                    </Stack>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
                                      {user?.email || 'vendor@ababatravels.com'}
                                    </Typography>
                                    <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                        <Chip label={user?.role || 'Verified Partner'} color="secondary" size="small" sx={{ borderRadius: '8px', fontWeight: 700 }} />
                                        <Chip label="Account Active" color="success" variant="outlined" size="small" sx={{ borderRadius: '8px', fontWeight: 700 }} />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Button 
                              variant="contained" 
                              color="secondary" 
                              startIcon={<SaveIcon />}
                              sx={{ borderRadius: '12px', px: 3, py: 1.2, fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                            >
                              Save Changes
                            </Button>
                        </Stack>
                    </Box>
                </MainCard>
            </Grid>

            {/* Details Form Section */}
            <Grid size={{ md: 8, xs: 12 }}>
                <Stack spacing={gridSpacing}>
                    <MainCard title="General Vendor Details" icon={<PersonIcon />}>
                        <Grid container spacing={2}>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField 
                                  fullWidth 
                                  label="Full Display Name" 
                                  value={fullName} 
                                  onChange={(e) => setFullName(e.target.value)}
                                  variant="outlined" 
                                  slotProps={{
                                    input: {
                                      startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" color="primary" /></InputAdornment>
                                    }
                                  }}
                                />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField 
                                  fullWidth 
                                  label="Registered Email Address" 
                                  value={user?.email || 'vendor@ababatravels.com'} 
                                  disabled 
                                  variant="outlined" 
                                  slotProps={{
                                    input: {
                                      startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>
                                    }
                                  }}
                                />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField 
                                  fullWidth 
                                  label="Contact Number" 
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="+91 98765 43210" 
                                  variant="outlined" 
                                  slotProps={{
                                    input: {
                                      startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="primary" /></InputAdornment>
                                    }
                                  }}
                                />
                            </Grid>
                            <Grid size={{ md: 6, xs: 12 }}>
                                <TextField 
                                  fullWidth 
                                  label="Business Headquarters Location" 
                                  value={location}
                                  onChange={(e) => setLocation(e.target.value)}
                                  placeholder="e.g. Kozhikode, Kerala" 
                                  variant="outlined" 
                                  slotProps={{
                                    input: {
                                      startAdornment: <InputAdornment position="start"><LocationOnIcon fontSize="small" color="primary" /></InputAdornment>
                                    }
                                  }}
                                />
                            </Grid>
                            <Grid size={12}>
                                <TextField 
                                  fullWidth 
                                  multiline 
                                  rows={3} 
                                  label="Business Profile Bio & Services Summary" 
                                  value={bio}
                                  onChange={(e) => setBio(e.target.value)}
                                  placeholder="Briefly describe your services..." 
                                  variant="outlined" 
                                />
                            </Grid>
                        </Grid>
                    </MainCard>

                    <MainCard title="Notification Preferences" icon={<NotificationsActiveIcon />}>
                        <Stack spacing={2}>
                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>System Notifications</Typography>
                                    <Typography variant="caption">Get real-time alerts for new bookings and package status updates</Typography>
                                </Box>
                                <Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} color="secondary" />
                            </Box>

                            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Marketing & Platform Updates</Typography>
                                    <Typography variant="caption">Receive emails about new platform features and promotional campaigns</Typography>
                                </Box>
                                <Switch checked={marketingEmails} onChange={(e) => setMarketingEmails(e.target.checked)} color="secondary" />
                            </Box>
                        </Stack>
                    </MainCard>
                </Stack>
            </Grid>

            {/* Side Info Cards */}
            <Grid size={{ md: 4, xs: 12 }}>
                <Stack spacing={gridSpacing}>
                    <MainCard title="Security & Access Protocol" icon={<SecurityIcon />}>
                        <Stack spacing={2}>
                            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Two-Factor Verification</Typography>
                                <Typography variant="caption" sx={{ display: 'block', my: 0.5 }}>
                                  Changes to your account credentials trigger an OTP code sent to your registered email.
                                </Typography>
                                <Chip label="OTP Active" color="success" size="small" sx={{ mt: 1, fontWeight: 800 }} />
                            </Box>

                            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Vendor ID Badge</Typography>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                  System Reference: <strong>{user?.customId || 'VND-9821'}</strong>
                                </Typography>
                            </Box>
                        </Stack>
                    </MainCard>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default VendorSettings;
